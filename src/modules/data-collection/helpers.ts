import _fromPairs from 'lodash/fromPairs';
import { stringify } from 'csv-stringify/sync';

import { SqlResponse } from 'src/modules/api/models/sql';

export const DEFAULT_PAGINATION_LIMIT = 10;
export const DEFAULT_PAGINATION_OFFSET = 0;

export type TablesColumnsMap = Map<string, string[]>;

export type SorterResult = {
  dataIndex: string;
  order: 'asc' | 'desc';
};

export type PaginationResult = {
  offset?: number;
  limit?: number;
};

export type QueryParams = {
  tableName?: string;
  sortings: SorterResult[];
} & PaginationResult;

export const getTableNameFromQuery = (qs = ''): string | undefined => {
  const tableNameMatches = qs.match(/(?:from)\s+(\S+)/i);
  return tableNameMatches?.[1];
};

/* const updateQsByTable = (qs: string, table: string): string => {
  const tableMatch = getTableNameFromQuery(qs);

  return tableMatch
    ? qs.replace(new RegExp(` +from +${tableMatch[1]} `, ` from ${table} `), ` from ${table}`)
    : qs.replace(' from ', ` from ${table}`);
}; */

const orderByRegexp = / order\s+by\s+(\w+(\s+asc|\s+desc)?([\s]*,[\s]*\w+(\s+asc|\s+desc)?)*)/i;
export const getOrderValuesString = (query: string): string | undefined => {
  const orderMatch = query.match(orderByRegexp);
  return orderMatch ? orderMatch[1] : undefined;
};

export const getOrderFromQuery = (query: string): SorterResult[] => {
  const orderStr = getOrderValuesString(query);

  if (!orderStr) {
    return [];
  }

  return orderStr.split(',').map((o) => {
    const [dataIndex, orderMatched] = o.trim().split(/\s+/);
    const order = (orderMatched || '').toLowerCase().includes('desc'.toLowerCase())
      ? 'desc'
      : 'asc';
    return { dataIndex, order };
  });
};

export const updateQsBySorter = (qs: string, sorter: SorterResult[]): string => {
  const orderString = sorter
    .map((s) => `${s.dataIndex}${s.order === 'asc' ? '' : ' desc'}`)
    .join(', ');

  if (!orderString) {
    return qs.replace(orderByRegexp, '');
  }

  const hasOrderByInQuery = qs.toLowerCase().includes('order by');
  const queryOrderSubstring = getOrderValuesString(qs);

  if (hasOrderByInQuery && queryOrderSubstring) {
    return qs.replace(orderByRegexp, ` order by ${orderString}`);
  }

  const offsetPosition = qs.toLowerCase().search('offset');
  const hasOffset = offsetPosition !== -1;
  const limitPosition = qs.toLowerCase().search('limit');
  if (!hasOffset && limitPosition === -1) {
    return `${qs} order by ${orderString}`;
  }

  return qs.replace(/ offset|limit/i, ` order by ${orderString} ${hasOffset ? 'offset' : 'limit'}`);
};

const paginationRegexp = /\s+((limit|offset)\s+[0-9]+)/gi;
export const getPaginationValueStrings = (query: string): string[] => {
  const paginationMatch = query.matchAll(paginationRegexp);
  return [...paginationMatch].map((m) => m[1].replace(/\s+/, ' '));
};

export const getPaginationFromQuery = (query: string): PaginationResult => {
  const paginationStrs = getPaginationValueStrings(query);

  return paginationStrs.length
    ? _fromPairs(
        paginationStrs.map((s) => {
          const [property, value] = s.split(' ');

          return [property, Number.parseInt(value, 10)];
        })
      )
    : {};
};

export const updateQsByPagination = (qs: string, { limit, offset }: PaginationResult): string => {
  const params = [];

  if (offset) {
    params.push(`offset ${offset}`);
  }

  if (limit) {
    params.push(`limit ${limit}`);
  }

  if (!params.length) {
    return qs.replaceAll(paginationRegexp, '');
  }

  const paginationString = params.join(' ');
  const offsetPosition = qs.toLowerCase().search('offset');
  const limitPosition = qs.toLowerCase().search('limit');
  if (offsetPosition === -1 && limitPosition === -1) {
    return `${qs} ${paginationString}`;
  }

  const prevPagination = getPaginationValueStrings(qs).join(' ');

  return qs.replace(prevPagination, paginationString);
};

export const getQueryParamsFromSql = (sql: string): QueryParams => ({
  sortings: getOrderFromQuery(sql),
  ...getPaginationFromQuery(sql),
  tableName: getTableNameFromQuery(sql),
});

export const getCsvBlobFromQueryResult = (data: SqlResponse<unknown>) => {
  const { columns } = data.metadata;

  const csvString = stringify([
    columns,
    ...data.data.map((d) => columns.map((k) => (d as Record<string, string>)[k])),
  ]);

  return new Blob([csvString], {
    type: 'text/csv',
  });
};

export const updateQsByColumns = (qs: string, columns: string[]): string =>
  columns.length ? qs.replace(/select.+from/i, `select ${columns.join(', ')} from`) : qs;
