import { useCallback, useEffect, useState } from 'react';
import _range from 'lodash/range';
import random from 'lodash/random';

import createDataSlice from 'src/modules/store/createDataSlice';
import { transformDataQueryResponse } from '../dashboard.utils';
import API, { ChartSource, DataQueryResponse, QueryResponse, QueryErrorResponse } from 'src/modules/api';

const mockDatabaseList = _range(5).map((i) => `database_${i}`);
const mockTableList = _range(10).map((i) => `table_${i}`);
const genValue = (type: string, idx: number) => {
  switch (type) {
    case 'CHAR':
      return `Char ${idx}`;
    case 'VARCHAR':
      return `Varchar ${idx}`;
    case 'DATE':
    case 'TIME':
      return new Date(Date.now() - random(0, 10) * 24 * 60 * 60 * 1000).toISOString();
    case 'BOOLEAN':
      return !!random(0, 1);
    default:
      return random(10, 100);
  }
};
export const genDataQuery = (cnt: number = 5) => {
  const columns: Record<string, string> = {
    name: 'CHAR',
    status: 'VARCHAR',
    date: 'DATE',
    time: 'TIME',
    count: 'BIGINT',
    index: 'INTEGER',
    checked: 'BOOLEAN'
  };

  const data = _range(cnt).map((i) => Object.keys(columns).reduce((prev, name) => ({ ...prev, [name]: genValue(columns[name], i) }), {}));
  return { columns, data };
};

API.mock.provideEndpoints({
  getListDatabase() {
    return API.mock.response(mockDatabaseList);
  },
  getListTable() {
    return API.mock.response(mockTableList);
  },
  executeChartDataQuery({ studyId }, { query }) {
    if (query.includes('error'))
      return API.mock.failedResponse({ status: 400, message: 'Invalid sql query' });
    return API.mock.response(genDataQuery() as DataQueryResponse);
  },
});

type GetDatabaseListParams = {
  studyId: string;
};
const databaseListSlice = createDataSlice({
  name: 'dashboard/databaseList',
  fetchData: async (params: GetDatabaseListParams) => {
    const { data: list } = await API.getListDatabase(params);
    return list;
  },
});

export const useDatabaseList = databaseListSlice.hook;
export const databaseListSelector = databaseListSlice.stateSelector;

type GetTableListParams = {
  studyId: string;
  database: string;
};
const tableListSlice = createDataSlice({
  name: 'dashboard/tableList',
  fetchData: async (params: GetTableListParams) => {
    const { data: list } = await API.getListTable(params);
    return list;
  },
});

export const useTableList = tableListSlice.hook;
export const tableListSelector = tableListSlice.stateSelector;

export default {
  [databaseListSlice.name]: databaseListSlice.reducer,
  [tableListSlice.name]: tableListSlice.reducer,
};

type SourceModalData = {
  source?: ChartSource;
  result?: QueryResponse;
  errors?: QueryErrorResponse;
};
type UseModalCachedDataArg = SourceModalData | undefined;

export const useSourceModal = (data: UseModalCachedDataArg) => {
  const [cachedData, setCachedData] = useState<UseModalCachedDataArg>(data);
  const [baseData, setBaseData] = useState<UseModalCachedDataArg>(data);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (data) {
      setBaseData(data);
      setCachedData(data);
    }
  }, [data]);

  const updateCacheData = useCallback(
    (d: Partial<SourceModalData>) => setCachedData({ ...cachedData, ...d }),
    [cachedData, setCachedData]
  );

  const updateSourceCacheData = useCallback(
    (s: Partial<ChartSource>) =>
      updateCacheData({
        source: {
          database: cachedData?.source?.database || '',
          query: cachedData?.source?.query || '',
          ...s,
        },
      }),
    [cachedData, updateCacheData]
  );

  const executeQuery = useCallback(async (studyId: string) => {
    const source = cachedData?.source;
    if (!source) return;

    setLoading(true);

    try {
      const executeRes = await API.executeChartDataQuery({ studyId }, source);
      executeRes.checkError();
      const queryResponse = transformDataQueryResponse(executeRes.data);

      updateCacheData({
        result: queryResponse,
        errors: undefined,
      });
      setBaseData({
        source: source,
        result: queryResponse,
      });
    } catch (err) {
      updateCacheData({
        result: undefined,
        errors: {
          message: 'An error occurred while executing the query.',
        },
      });
      setBaseData({
        source: source,
        result: undefined,
      });
    } finally {
      setLoading(false);
    }
  }, [cachedData, updateCacheData, setLoading]);

  return {
    cachedData,
    baseData,
    updateSourceData: updateSourceCacheData,
    executeQuery,
    loading,
    modalProps: {
      open: !!data,
      onExited: useCallback(() => setCachedData(undefined), []),
    },
  };
};
