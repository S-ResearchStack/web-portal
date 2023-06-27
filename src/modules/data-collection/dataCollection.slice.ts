import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import _zipObject from 'lodash/zipObject';
import _range from 'lodash/range';

import { AppThunk, RootState } from 'src/modules/store';
import API from 'src/modules/api';
import applyDefaultApiErrorHandlers from 'src/modules/api/applyDefaultApiErrorHandlers';
import { SqlResponse } from 'src/modules/api/models/sql';

import {
  getTableNameFromQuery,
  updateQsByColumns,
  DEFAULT_PAGINATION_LIMIT,
  getQueryParamsFromSql,
  updateQsByPagination,
  updateQsBySorter,
  QueryParams,
} from './helpers';

const generateColumnsByTableId = (tableId: string) => _range(15).map((v) => `${tableId}_col_${v}`);

export const executeDataQueryMock: typeof API.executeDataQuery = (_, sql) => {
  console.info(`EXECUTE ${sql}`);
  const tableId = getTableNameFromQuery(sql) || '';

  const columns = generateColumnsByTableId(tableId);
  const columnsCount = columns.length;

  const rowsNumber = 15;

  return API.mock.response(
    sql.includes('count(*)')
      ? { data: [{ rowsNumber }], metadata: { columns: [], count: 0 } }
      : {
          metadata: { columns: columns as never[], count: rowsNumber },
          data: _range(rowsNumber).map((v) =>
            _zipObject(
              columns,
              _range(v, columnsCount + v).map((val) => `${tableId}_${val}`)
            )
          ),
        }
  );
};

API.mock.provideEndpoints({
  executeDataQuery: executeDataQueryMock,
  getTablesList() {
    return API.mock.response({
      tables: _range(5).map((v) => ({ name: `table_${v}` })),
    });
  },
  getTableColumns(_, tableId) {
    return API.mock.response({
      tables: [
        {
          columns: generateColumnsByTableId(tableId).map((c) => ({
            name: c,
            type: '',
          })),
        },
      ],
    });
  },
});

export type QueryResult = SqlResponse<unknown> & { totalCount: number; queryParams: QueryParams };
export type TablesMap = Record<string, string[]>;

export interface DataCollectionState {
  query: string;
  tables?: TablesMap;
  queryResult?: QueryResult;
  error?: string;
  isDataLoading?: boolean;
  isTablesLoading?: boolean;
}

export const DEFAULT_QUERY_STATE = 'select * from';

export const initialState: DataCollectionState = {
  query: DEFAULT_QUERY_STATE,
};

export const dataCollectionSlice = createSlice({
  name: 'dataCollection',
  initialState: { ...initialState },
  reducers: {
    setQuerySuccess(state, { payload }: PayloadAction<string>) {
      state.query = payload;
    },
    tablesStart(state) {
      state.isTablesLoading = true;
    },
    tablesSuccess(state, { payload }: PayloadAction<{ tableMap: TablesMap }>) {
      state.tables = payload.tableMap;
      state.isTablesLoading = false;
    },
    tablesFailure(state) {
      state.isTablesLoading = false;
      state.tables = {};
    },
    columnsSuccess(state, { payload }: PayloadAction<TablesMap>) {
      state.tables = { ...state.tables, ...payload };
    },
    queryResultStart(state) {
      state.isDataLoading = true;
    },
    queryResultSuccess(state, { payload }: PayloadAction<QueryResult>) {
      state.queryResult = payload;
      state.error = undefined;
      state.isDataLoading = false;
    },
    queryResultFailure(state, { payload }: PayloadAction<string>) {
      state.queryResult = undefined;
      state.error = payload;
      state.isDataLoading = false;
    },
    clearData(state) {
      state.query = initialState.query;
      state.tables = initialState.tables;
      state.queryResult = initialState.queryResult;
      state.error = initialState.error;
      state.isDataLoading = initialState.isDataLoading;
      state.isTablesLoading = initialState.isTablesLoading;
    },
  },
});

export const {
  setQuerySuccess,
  tablesStart,
  tablesSuccess,
  tablesFailure,
  columnsSuccess,
  queryResultStart,
  queryResultSuccess,
  queryResultFailure,
  clearData,
} = dataCollectionSlice.actions;

export const fetchTables =
  (projectId: string): AppThunk<Promise<void>> =>
  async (dispatch) => {
    try {
      dispatch(tablesStart());
      const res = await API.getTablesList(projectId);
      const tables = (res.data.tables || []).map((t) => t.name || '');
      dispatch(tablesSuccess({ tableMap: _zipObject(tables, []) }));
    } catch (e) {
      dispatch(tablesFailure());
      applyDefaultApiErrorHandlers(e, dispatch);
    }
  };

export const fetchColumns =
  (projectId: string, tableId: string): AppThunk<Promise<void>> =>
  async (dispatch) => {
    try {
      const res = await API.getTableColumns(projectId, tableId);
      const columns = (res.data.tables?.[0].columns || []).map(({ name }) => name || '');

      dispatch(columnsSuccess(_zipObject([tableId], [columns])));
    } catch (e) {
      applyDefaultApiErrorHandlers(e, dispatch);
    }
  };

export const dataFetchData =
  (projectId: string, sql: string): AppThunk<Promise<void>> =>
  async (dispatch) => {
    dispatch(queryResultStart());
    try {
      const countSql = updateQsBySorter(
        updateQsByPagination(updateQsByColumns(sql, ['count(*)']), {}),
        []
      );
      const countRow = (await API.executeDataQuery(projectId, countSql)).data.data[0];
      const queryParams = getQueryParamsFromSql(sql);
      const { limit, offset } = queryParams;
      let qs = sql;
      if (!limit) {
        qs = updateQsByPagination(sql, { offset, limit: DEFAULT_PAGINATION_LIMIT });
      }

      const queryResult = (await API.executeDataQuery(projectId, qs)).data;
      dispatch(
        queryResultSuccess({
          ...queryResult,
          totalCount: Object.values(countRow as Record<string, number>)[0],
          queryParams,
        })
      );
    } catch (e) {
      applyDefaultApiErrorHandlers(e, dispatch);
      if (e instanceof Error) {
        const separator = '-';
        const [, ...rest] = e.message.split(separator);
        dispatch(queryResultFailure(rest.join(separator).trim()));
      }
    }
  };

export const setQuery =
  (projectId: string, query: string, autoFetch = false): AppThunk =>
  (dispatch) => {
    dispatch(setQuerySuccess(query));
    autoFetch && dispatch(dataFetchData(projectId, query));
  };

export const setTable =
  (projectId: string, table: string): AppThunk =>
  (dispatch) =>
    dispatch(setQuery(projectId, `${DEFAULT_QUERY_STATE} ${table}`, true));

export const clear = (): AppThunk<Promise<void>> => async (dispatch) => {
  dispatch(clearData());
};

export const querySelector = (state: RootState) => state.dataCollection.query;
export const tablesSelector = (state: RootState) => state.dataCollection.tables;
export const errorSelector = (state: RootState) => state.dataCollection.error;
export const queryResultSelector = (state: RootState) => state.dataCollection.queryResult;
export const dataLoadingSelector = (state: RootState) => state.dataCollection.isDataLoading;
export const tablesLoadingSelector = (state: RootState) => state.dataCollection.isTablesLoading;

export default dataCollectionSlice.reducer;
