import * as dt from 'src/common/utils/datetime';
import type { AutoRefresh, UserActive, QueryResponseColumnType, DataQueryResponse, QueryResponse } from "../api";

export const STORAGE_USER_ACTIVE = 'user_last_active';
export const STORAGE_AUTO_REFRESH = 'dashboard_auto_refresh';

export const setAutoRefreshStorage = (data: AutoRefresh) => {
  const dataStr = JSON.stringify(data);
  localStorage.setItem(STORAGE_AUTO_REFRESH, dataStr);
};

export const getAutoRefreshStorage = () => {
  const dataStr = localStorage.getItem(STORAGE_AUTO_REFRESH);
  const data = !dataStr ? {} : JSON.parse(dataStr) || {};
  return data as AutoRefresh;
};

export const setUserActiveStorage = (data: UserActive) => {
  const dataStr = JSON.stringify(data);
  localStorage.setItem(STORAGE_USER_ACTIVE, dataStr);
};

export const getUserActiveStorage = () => {
  const dataStr = localStorage.getItem(STORAGE_USER_ACTIVE);
  const data = !dataStr ? {} : JSON.parse(dataStr) || {};
  return data as UserActive;
};

export const timesAutoRefresh = [
  {
    key: 1,
    label: '1s',
  },
  {
    key: 5,
    label: '5s',
  },
  {
    key: 10,
    label: '10s',
  },
  {
    key: 30,
    label: '30s',
  },
  {
    key: 60,
    label: '1m',
  },
  {
    key: 300,
    label: '5m',
  },
  {
    key: 600,
    label: '10m',
  },
  {
    key: 1800,
    label: '30m',
  },
  {
    key: 3600,
    label: '1h',
  },
];

const convertType = (type: string): QueryResponseColumnType => {
  const numbers = ['TINYINT', 'SMALLINT', 'INTEGER', 'BIGINT', 'FLOAT', 'REAL', 'DOUBLE', 'NUMERIC', 'DECIMAL'];
  if (numbers.includes(type)) return 'number';

  const strings = ['CHAR', 'VARCHAR', 'LONGVARCHAR'];
  if (strings.includes(type)) return 'string';

  const booleans = ['BOOLEAN'];
  if (booleans.includes(type)) return 'boolean';

  const datetimes = ['DATE', 'TIME', 'TIMESTAMP'];
  if (datetimes.includes(type)) return 'datetime';

  return 'unknown';
};
export const transformDataQueryResponse = (response: DataQueryResponse): QueryResponse => {
  const columns = Object.keys(response.columns).map(name => ({ name: name, type: convertType(response.columns[name]) }));
  const columnObject: Record<string, string> = columns.reduce((acc, cur) => ({ ...acc, [cur.name]: cur.type }), {});
  const data = response.data.map((obj) => {
    const keyList = Object.keys(obj);
    keyList.forEach((key) => {
      switch (columnObject[key]) {
        case 'boolean':
          obj[key] = obj[key] ? 'True' : 'False';
          break;
        case 'datetime':
          obj[key] = dt.format(Date.parse(obj[key] as string), 'LLL dd yyyy hh:mm');
          break;
        case 'unknown':
          obj[key] = JSON.stringify(obj[key]);
          break;
        default:
          break;
      }
    });
    return obj;
  });
  return { columns, data };
};
