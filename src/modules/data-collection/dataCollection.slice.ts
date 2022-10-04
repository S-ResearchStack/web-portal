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

API.mock.provideEndpoints({
  getTablesList() {
    return API.mock.response(_range(5).map((v) => ({ Table: `table_${v}` })));
  },
  getTableColumns(_, tableId) {
    return API.mock.response(
      generateColumnsByTableId(tableId).map((c) => ({
        Column: c,
        Type: '',
        Extra: '',
        Comment: '',
      }))
    );
  },
  executeDataQuery(_, sql) {
    console.info(`EXECUTE ${sql}`);
    const tableId = getTableNameFromQuery(sql) || '';

    const columns = generateColumnsByTableId(tableId);
    const columnsCount = columns.length;

    const rowsNumber = 15;

    return API.mock.response({
      metadata: { columns: columns as never[], count: rowsNumber },
      data: _range(rowsNumber).map((v) =>
        _zipObject(
          columns,
          _range(v, columnsCount + v).map((val) => `${tableId}_${val}`)
        )
      ),
    });
  },
});

type QueryResult = SqlResponse<unknown> & { totalCount: number; queryParams: QueryParams };
type TablesMap = Record<string, string[]>;
interface DataCollectionState {
  query: string;
  tables: TablesMap;
  queryResult?: QueryResult;
  error?: string;
  isDataLoading?: boolean;
  isTablesLoading?: boolean;
}

const DEFAULT_QUEURY_STATE = 'select * from';

const initialState: DataCollectionState = {
  query: DEFAULT_QUEURY_STATE,
  tables: {},
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
    tablesSuccess(state, { payload }: PayloadAction<TablesMap>) {
      state.tables = payload;
      state.isTablesLoading = false;
    },
    tablesFailure(state) {
      state.isTablesLoading = false;
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
    },
  },
});

export const {
  setQuerySuccess,
  tablesStart,
  tablesSuccess,
  tablesFailure,
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
      const tables = (await API.getTablesList(projectId)).data.map((t) => t.Table);
      const columnsReqs = tables.map((t) => API.getTableColumns(projectId, t));

      const columns: string[][] = [];

      for await (const r of columnsReqs) {
        const { data } = await r;
        columns.push(data?.map((d) => d.Column) || []);
      }

      dispatch(tablesSuccess(_zipObject(tables, columns)));
    } catch (e) {
      dispatch(tablesFailure());
      applyDefaultApiErrorHandlers(e);
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
      applyDefaultApiErrorHandlers(e);
      if (e instanceof Error) {
        const separator = '-';
        const [, ...rest] = e.message.split(separator);
        dispatch(queryResultFailure(rest.join(separator).trim()));
      }
    }
  };

export const setQuery =
  (projectId: string, query: string, autoFetch?: boolean): AppThunk =>
  (dispatch) => {
    dispatch(setQuerySuccess(query));
    autoFetch && dispatch(dataFetchData(projectId, query));
  };

export const setTable =
  (projectId: string, table: string): AppThunk =>
  (dispatch) =>
    dispatch(setQuery(projectId, `${DEFAULT_QUEURY_STATE} ${table}`, true));

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
