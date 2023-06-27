import {
  clearData,
  dataCollectionSlice,
  DataCollectionState,
  dataFetchData,
  dataLoadingSelector,
  DEFAULT_QUERY_STATE,
  errorSelector,
  executeDataQueryMock,
  fetchColumns,
  fetchTables,
  initialState,
  QueryResult,
  queryResultSelector,
  querySelector,
  setQuery,
  setTable,
  tablesLoadingSelector,
  TablesMap,
  tablesSelector,
} from 'src/modules/data-collection/dataCollection.slice';
import { AppDispatch, store } from 'src/modules/store/store';
import { waitFor } from '@testing-library/react';
import { maskEndpointAsFailure } from 'src/modules/api/mock';
import { DEFAULT_PAGINATION_LIMIT } from 'src/modules/data-collection/helpers';

// eslint-disable-next-line prefer-destructuring
const dispatch: AppDispatch = store.dispatch;
const projectId = 'project-id';
const tableMap = { table: [] };
const query = 'select * from table_0';
const tables = { table: [] };
const error = 'test-error';
const queryResult: QueryResult = {
  metadata: {
    columns: [
      'table_0_col_0',
      'table_0_col_1',
      'table_0_col_2',
      'table_0_col_3',
      'table_0_col_4',
      'table_0_col_5',
      'table_0_col_6',
      'table_0_col_7',
      'table_0_col_8',
      'table_0_col_9',
      'table_0_col_10',
      'table_0_col_11',
      'table_0_col_12',
      'table_0_col_13',
      'table_0_col_14',
    ] as never[],
    count: 15,
  },
  data: [
    {
      table_0_col_0: 'table_0_0',
      table_0_col_1: 'table_0_1',
      table_0_col_2: 'table_0_2',
      table_0_col_3: 'table_0_3',
      table_0_col_4: 'table_0_4',
      table_0_col_5: 'table_0_5',
      table_0_col_6: 'table_0_6',
      table_0_col_7: 'table_0_7',
      table_0_col_8: 'table_0_8',
      table_0_col_9: 'table_0_9',
      table_0_col_10: 'table_0_10',
      table_0_col_11: 'table_0_11',
      table_0_col_12: 'table_0_12',
      table_0_col_13: 'table_0_13',
      table_0_col_14: 'table_0_14',
    },
  ],
  totalCount: 1,
  queryParams: {
    tableName: 'table_0',
    offset: 1,
    limit: 1,
    sortings: [],
  },
};

const state = {
  query: 'string',
  tables: tableMap,
  queryResult,
  error,
  isDataLoading: true,
  isTablesLoading: true,
};

describe('dataCollectionSlice', () => {
  it('should create initial state', () => {
    expect(dataCollectionSlice.reducer(undefined, { type: '' })).toEqual(initialState);
  });

  it('[NEGATIVE] should still after creation broken initial state', () => {
    const brokenInitialState = { unexpected: 'unexpected' } as unknown as DataCollectionState;
    expect(dataCollectionSlice.reducer(brokenInitialState, { type: '' })).toEqual(
      brokenInitialState
    );
  });

  it('should set query', () => {
    expect(
      dataCollectionSlice.reducer(undefined, dataCollectionSlice.actions.setQuerySuccess(query))
    ).toMatchObject({ query });
  });

  it('[NEGATIVE] should set empty query', () => {
    expect(
      dataCollectionSlice.reducer(undefined, dataCollectionSlice.actions.setQuerySuccess(''))
    ).toMatchObject({ query: '' });
  });

  it('should support table lifecycle', () => {
    const initialTableState = dataCollectionSlice.reducer(
      undefined,
      dataCollectionSlice.actions.tablesStart()
    );

    expect(initialTableState).toMatchObject({
      isTablesLoading: true,
    });

    expect(
      dataCollectionSlice.reducer(
        initialTableState,
        dataCollectionSlice.actions.tablesSuccess({
          tableMap,
        })
      )
    ).toMatchObject({
      isTablesLoading: false,
      tables: tableMap,
    });

    expect(
      dataCollectionSlice.reducer(initialTableState, dataCollectionSlice.actions.tablesFailure())
    ).toMatchObject({
      isTablesLoading: false,
    });
  });

  it('[NEGATIVE] should support table lifecycle with broken data', () => {
    const initialTableState = dataCollectionSlice.reducer(
      undefined,
      dataCollectionSlice.actions.tablesStart()
    );

    expect(initialTableState).toMatchObject({
      isTablesLoading: true,
    });

    expect(
      dataCollectionSlice.reducer(
        initialTableState,
        dataCollectionSlice.actions.tablesSuccess({
          tableMap: null as unknown as TablesMap,
        })
      )
    ).toMatchObject({
      isTablesLoading: false,
      tables: null,
    });
  });

  it('should set columns', () => {
    const initialTableState = dataCollectionSlice.reducer(undefined, { type: '' });

    expect(initialTableState).toMatchObject(initialState);

    expect(
      dataCollectionSlice.reducer(
        initialTableState,
        dataCollectionSlice.actions.columnsSuccess(tables)
      )
    ).toMatchObject({
      tables,
    });
  });

  it('[NEGATIVE] should set columns with broken data', () => {
    const initialTableState = dataCollectionSlice.reducer(
      { tables } as unknown as DataCollectionState,
      { type: '' }
    );

    expect(initialTableState).toMatchObject({
      tables: {},
    });

    expect(
      dataCollectionSlice.reducer(
        initialTableState,
        dataCollectionSlice.actions.columnsSuccess(null as unknown as TablesMap)
      )
    ).toMatchObject({
      tables,
    });
  });

  it('should query result lifecycle', () => {
    const initial = dataCollectionSlice.reducer(undefined, { type: '' });

    expect(initial.queryResult).toBeUndefined();
    expect(initial.error).toBeUndefined();
    expect(initial.isDataLoading).toBeUndefined();

    const loading = dataCollectionSlice.reducer(
      initial,
      dataCollectionSlice.actions.queryResultStart()
    );

    expect(loading).toMatchObject({
      isDataLoading: true,
    });

    expect(
      dataCollectionSlice.reducer(
        loading,
        dataCollectionSlice.actions.queryResultSuccess(queryResult)
      )
    ).toMatchObject({
      isDataLoading: false,
      queryResult,
    });

    expect(
      dataCollectionSlice.reducer(loading, dataCollectionSlice.actions.queryResultFailure(error))
    ).toMatchObject({
      isDataLoading: false,
      queryResult: undefined,
      error,
    });
  });

  it('[NEGATIVE] should query result lifecycle with broken data', () => {
    const initial = dataCollectionSlice.reducer(undefined, { type: '' });

    expect(initial.queryResult).toBeUndefined();
    expect(initial.error).toBeUndefined();
    expect(initial.isDataLoading).toBeUndefined();

    const loading = dataCollectionSlice.reducer(
      initial,
      dataCollectionSlice.actions.queryResultStart()
    );

    expect(loading).toMatchObject({
      isDataLoading: true,
    });

    expect(
      dataCollectionSlice.reducer(
        loading,
        dataCollectionSlice.actions.queryResultSuccess(null as unknown as QueryResult)
      )
    ).toMatchObject({
      isDataLoading: false,
      queryResult: null,
    });
  });

  it('should reset state', () => {
    const filledState = dataCollectionSlice.reducer(state, { type: '' });

    expect(filledState).toEqual(state);
    expect(
      dataCollectionSlice.reducer(filledState, dataCollectionSlice.actions.clearData())
    ).toEqual(initialState);
  });

  it('[NEGATIVE] should reset empty state', () => {
    const filledState = dataCollectionSlice.reducer(undefined, { type: '' });

    expect(filledState).toEqual(initialState);
    expect(
      dataCollectionSlice.reducer(filledState, dataCollectionSlice.actions.clearData())
    ).toEqual(initialState);
  });

  it('should all selectors return a truth value', () => {
    expect(querySelector(store.getState())).toEqual(DEFAULT_QUERY_STATE);

    dispatch(dataCollectionSlice.actions.tablesSuccess({ tableMap }));
    expect(tablesSelector(store.getState())).toEqual(tables);
    expect(tablesLoadingSelector(store.getState())).toBeFalsy();

    dispatch(dataCollectionSlice.actions.queryResultSuccess(queryResult));
    expect(queryResultSelector(store.getState())).toEqual(queryResult);
    expect(dataLoadingSelector(store.getState())).toBeFalsy();

    dispatch(dataCollectionSlice.actions.queryResultFailure(error));
    expect(errorSelector(store.getState())).toMatch(error);
  });

  it('[NEGATIVE] should all selectors return a value while state is empty', () => {
    dispatch(dataCollectionSlice.actions.clearData());

    expect(querySelector(store.getState())).toEqual(DEFAULT_QUERY_STATE);
    expect(tablesSelector(store.getState())).toEqual(initialState.tables);
    expect(tablesLoadingSelector(store.getState())).toBeFalsy();
    expect(queryResultSelector(store.getState())).toBeUndefined();
    expect(dataLoadingSelector(store.getState())).toBeFalsy();
    expect(errorSelector(store.getState())).toBeUndefined();
  });
});

describe('actions', () => {
  beforeAll(() => {
    jest.spyOn(console, 'info').mockImplementation();
  });

  beforeEach(() => {
    dispatch(dataCollectionSlice.actions.clearData());
  });

  describe('fetchTables', () => {
    it('should fetch tables', async () => {
      expect(tablesLoadingSelector(store.getState())).toBeFalsy();

      dispatch(fetchTables(projectId));

      await waitFor(() => tablesLoadingSelector(store.getState()));
      await waitFor(() => !tablesLoadingSelector(store.getState()));

      expect(tablesSelector(store.getState())).toEqual({
        table_0: undefined,
        table_1: undefined,
        table_2: undefined,
        table_3: undefined,
        table_4: undefined,
      });
    });

    it('[NEGATIVE] should fetch tables with failure state', async () => {
      await maskEndpointAsFailure('getTablesList', async () => {
        await dispatch(fetchTables(projectId));
      });

      expect(tablesSelector(store.getState())).toEqual({});
    });
  });

  describe('fetchColumns', () => {
    it('should fetch columns', async () => {
      expect(tablesSelector(store.getState())).toEqual(initialState.tables);

      await dispatch(fetchColumns(projectId, 'table_0'));

      expect(tablesSelector(store.getState())).toEqual({
        table_0: [
          'table_0_col_0',
          'table_0_col_1',
          'table_0_col_2',
          'table_0_col_3',
          'table_0_col_4',
          'table_0_col_5',
          'table_0_col_6',
          'table_0_col_7',
          'table_0_col_8',
          'table_0_col_9',
          'table_0_col_10',
          'table_0_col_11',
          'table_0_col_12',
          'table_0_col_13',
          'table_0_col_14',
        ],
      });
    });

    it('[NEGATIVE] should fetch columns with failure state', async () => {
      expect(tablesSelector(store.getState())).toEqual(initialState.tables);

      await maskEndpointAsFailure('getTableColumns', async () => {
        await dispatch(fetchColumns(projectId, 'table_0'));
      });

      expect(tablesSelector(store.getState())).toEqual(initialState.tables);
    });
  });

  describe('dataFetchData', () => {
    it('should fetch data', async () => {
      let s = store.getState();

      expect(errorSelector(s)).toBeUndefined();
      expect(queryResultSelector(s)).toBeUndefined();
      expect(dataLoadingSelector(s)).toBeFalsy();

      dispatch(dataFetchData(projectId, query));

      expect(dataLoadingSelector(store.getState())).toBeTruthy();

      await waitFor(() => !dataLoadingSelector(store.getState()));

      const { data } = await executeDataQueryMock(
        '',
        `select * from table_0 limit ${DEFAULT_PAGINATION_LIMIT}`
      );

      s = store.getState();

      expect(errorSelector(s)).toBeUndefined();
      expect(dataLoadingSelector(s)).toBeFalsy();
      expect(queryResultSelector(s)).toEqual({
        ...data,
        queryParams: { sortings: [], tableName: 'table_0' },
        totalCount: 15,
      });
    });

    it('[NEGATIVE] should fetch data with failure state', async () => {
      let s = store.getState();

      expect(errorSelector(s)).toBeUndefined();
      expect(queryResultSelector(s)).toBeUndefined();
      expect(dataLoadingSelector(s)).toBeFalsy();

      const err = '0-1-2-3';
      const sep = '-';

      maskEndpointAsFailure(
        'executeDataQuery',
        async () => {
          await dispatch(dataFetchData(projectId, query));
        },
        { message: err }
      );

      expect(dataLoadingSelector(store.getState())).toBeTruthy();

      await waitFor(() => !dataLoadingSelector(store.getState()));

      s = store.getState();

      expect(errorSelector(s)).toMatch(err.split(sep).slice(1).join(sep));
      expect(dataLoadingSelector(s)).toBeFalsy();
      expect(queryResultSelector(s)).toBeUndefined();
    });
  });

  describe('setQuery', () => {
    it('should set query', async () => {
      expect(querySelector(store.getState())).toEqual(initialState.query);

      const newQuery = `select * from table_0 limit ${DEFAULT_PAGINATION_LIMIT}`;

      dispatch(setQuery(projectId, newQuery));

      expect(querySelector(store.getState())).toEqual(newQuery);
    });

    it('[NEGATIVE] should set broken query', async () => {
      expect(querySelector(store.getState())).toEqual(initialState.query);

      const newQuery = null as unknown as string;

      dispatch(setQuery(projectId, newQuery));

      expect(querySelector(store.getState())).toEqual(newQuery);
    });

    it('should set query with auto fetch data', async () => {
      expect(querySelector(store.getState())).toEqual(initialState.query);
      expect(queryResultSelector(store.getState())).toBeUndefined();

      const newQuery = `select * from table_0 limit ${DEFAULT_PAGINATION_LIMIT}`;

      dispatch(setQuery(projectId, newQuery, true));

      const { data } = await executeDataQueryMock('', newQuery);

      expect(querySelector(store.getState())).toEqual(newQuery);

      await waitFor(() => queryResultSelector(store.getState()));

      expect(queryResultSelector(store.getState())).toEqual({
        ...data,
        queryParams: {
          sortings: [],
          tableName: 'table_0',
          limit: DEFAULT_PAGINATION_LIMIT,
        },
        totalCount: 15,
      });
    });

    it('[NEGATIVE] should set query with auto fetch data with failure response', async () => {
      expect(querySelector(store.getState())).toEqual(initialState.query);
      expect(queryResultSelector(store.getState())).toBeUndefined();

      const newQuery = `select * from table_0 limit ${DEFAULT_PAGINATION_LIMIT}`;

      await maskEndpointAsFailure(
        'executeDataQuery',
        async () => dispatch(setQuery(projectId, newQuery, true)),
        { message: 'test-error' }
      );

      expect(querySelector(store.getState())).toEqual(newQuery);

      await waitFor(() => queryResultSelector(store.getState()));

      expect(queryResultSelector(store.getState())).toBeUndefined();
      expect(errorSelector(store.getState())).toMatch('test-error'.split('-')[1]);
    });
  });

  describe('setTable', () => {
    it('should set table', async () => {
      expect(querySelector(store.getState())).toEqual(initialState.query);
      expect(queryResultSelector(store.getState())).toBeUndefined();

      dispatch(setTable(projectId, 'table_0'));

      await waitFor(() => !dataLoadingSelector(store.getState()));

      const newQuery = `select * from table_0`;

      const { data } = await executeDataQueryMock('', newQuery);

      expect(querySelector(store.getState())).toEqual('select * from table_0');
      expect(queryResultSelector(store.getState())).toEqual({
        ...data,
        queryParams: {
          sortings: [],
          tableName: 'table_0',
        },
        totalCount: 15,
      });
    });

    it('[NEGATIVE] should set table', async () => {
      expect(querySelector(store.getState())).toEqual(initialState.query);
      expect(queryResultSelector(store.getState())).toBeUndefined();

      await maskEndpointAsFailure(
        'executeDataQuery',
        async () => dispatch(setTable(projectId, 'table_0')),
        { message: 'test-error' }
      );

      await waitFor(() => !dataLoadingSelector(store.getState()));

      expect(querySelector(store.getState())).toEqual(`select * from table_0`);
      expect(queryResultSelector(store.getState())).toBeUndefined();
    });
  });

  describe('clear', () => {
    it('should clear state', async () => {
      expect(querySelector(store.getState())).toEqual(initialState.query);
      const fakeQuery = 'select * from unknown';

      dispatch(dataCollectionSlice.actions.setQuerySuccess(fakeQuery));
      expect(querySelector(store.getState())).toEqual(fakeQuery);

      dispatch(clearData());
      expect(querySelector(store.getState())).toEqual(initialState.query);
    });

    it('[NEGATIVE] should clear state empty state', async () => {
      expect(querySelector(store.getState())).toEqual(initialState.query);
      dispatch(clearData());
      expect(querySelector(store.getState())).toEqual(initialState.query);
    });
  });
});
