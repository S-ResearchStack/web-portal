import {
  DEFAULT_PAGINATION_LIMIT,
  getCsvBlobFromQueryResult,
  getOrderFromQuery,
  getOrderValuesString,
  getPaginationFromQuery,
  getPaginationValueStrings,
  getQueryParamsFromSql,
  getTableNameFromQuery,
  PaginationResult,
  SorterResult,
  updateQsByColumns,
  updateQsByPagination,
  updateQsBySorter,
} from 'src/modules/data-collection/helpers';
import { executeDataQueryMock } from 'src/modules/data-collection/dataCollection.slice';

beforeAll(() => {
  jest.spyOn(console, 'info').mockImplementation();
});

describe('getTableNameFromQuery', () => {
  it('should get table name', () => {
    expect(getTableNameFromQuery('select * from table')).toEqual('table');
  });

  it('should not find table name', () => {
    expect(getTableNameFromQuery('select * from')).toBeUndefined();
  });
});

const bq = 'select * from table order by';

describe('getOrderValuesString', () => {
  it('should get order', () => {
    expect(getOrderValuesString(`${bq} column`)).toBe('column');
    expect(getOrderValuesString(`${bq} column desc`)).toBe('column desc');
    expect(getOrderValuesString(`${bq} column asc`)).toBe('column asc');
    expect(getOrderValuesString(`${bq} column, column`)).toBe('column, column');
    expect(getOrderValuesString(`${bq} column asc, column desc`)).toBe('column asc, column desc');
  });

  it('should not find order', () => {
    expect(getOrderValuesString('select * from table')).toBeUndefined();
  });
});

describe('getOrderFromQuery', () => {
  it('should get order', () => {
    expect(getOrderFromQuery(`${bq} column`)).toEqual([{ dataIndex: 'column', order: 'asc' }]);
    expect(getOrderFromQuery(`${bq} column desc`)).toEqual([
      { dataIndex: 'column', order: 'desc' },
    ]);
    expect(getOrderFromQuery(`${bq} column asc`)).toEqual([{ dataIndex: 'column', order: 'asc' }]);
    expect(getOrderFromQuery(`${bq} column, column`)).toEqual([
      { dataIndex: 'column', order: 'asc' },
      { dataIndex: 'column', order: 'asc' },
    ]);
    expect(getOrderFromQuery(`${bq} column asc, column desc`)).toEqual([
      { dataIndex: 'column', order: 'asc' },
      { dataIndex: 'column', order: 'desc' },
    ]);
  });

  it('should not find order', () => {
    expect(getOrderFromQuery('select * from table')).toHaveLength(0);
  });
});

describe('updateQsBySorter', () => {
  it('should update sort', () => {
    const sorter: SorterResult[] = [
      { dataIndex: 'column1', order: 'asc' },
      { dataIndex: 'column2', order: 'desc' },
    ];

    const resultQuery = 'select * from table order by column1, column2 desc';

    expect(updateQsBySorter(`select * from table`, [])).toEqual('select * from table');
    expect(updateQsBySorter(`select * from table`, sorter)).toEqual(resultQuery);
    expect(updateQsBySorter(`select * from table order by column1 desc`, sorter)).toEqual(
      resultQuery
    );
    expect(
      updateQsBySorter(`select * from table order by column1 desc, column2 asc`, sorter)
    ).toEqual(resultQuery);
  });
});

describe('getPaginationValueStrings', () => {
  it('should get pagination string values', () => {
    expect(getPaginationValueStrings(`select * from table`)).toEqual([]);
    expect(getPaginationValueStrings(`select * from table limit 1`)).toEqual(['limit 1']);
    expect(getPaginationValueStrings(`select * from table limit 1 offset 2`)).toEqual([
      'limit 1',
      'offset 2',
    ]);
    // expect(getPaginationValueStrings(`select * from table limit all offset null`)).toEqual(['limit all', 'offset null'])
  });
});

describe('getPaginationFromQuery', () => {
  it('should get pagination params', () => {
    expect(getPaginationFromQuery(`select * from table`)).toEqual({});
    expect(getPaginationFromQuery(`select * from table limit 1`)).toEqual({ limit: 1 });
    expect(getPaginationFromQuery(`select * from table limit 1 offset 2`)).toEqual({
      limit: 1,
      offset: 2,
    });
  });
});

describe('updateQsByPagination', () => {
  it('should update pagination', () => {
    const pagination: PaginationResult = {
      limit: 1,
      offset: 2,
    };

    const resultQuery = `select * from table offset 2 limit 1`;

    expect(updateQsByPagination(`select * from table`, {})).toEqual(`select * from table`);
    expect(updateQsByPagination(`select * from table`, pagination)).toEqual(resultQuery);
    expect(updateQsByPagination(`select * from table limit 0`, pagination)).toEqual(resultQuery);
    expect(
      updateQsByPagination(`select * from table limit 0 offset 0`, { limit: pagination.limit })
    ).toEqual(`select * from table limit 1`);
    expect(updateQsByPagination(`select * from table limit 0 offset 0`, { offset: 2 })).toEqual(
      `select * from table offset 2`
    );
  });
});

describe('getQueryParamsFromSql', () => {
  it('should get sql params', () => {
    expect(getQueryParamsFromSql(`select * from table order by id desc offset 2 limit 1`)).toEqual({
      sortings: [{ dataIndex: 'id', order: 'desc' }],
      limit: 1,
      offset: 2,
      tableName: 'table',
    });
  });
});

describe('getCsvBlobFromQueryResult', () => {
  it('should pack query results to csv', async () => {
    const { data } = await executeDataQueryMock(
      '',
      `select * from table_0 limit ${DEFAULT_PAGINATION_LIMIT}`
    );

    const result = getCsvBlobFromQueryResult(data);

    expect(result.type).toMatch('text/csv');
    expect(result.size).toBeGreaterThan(0);
  });
});

describe('updateQsByColumns', () => {
  it('should replace selecting columns', () => {
    expect(updateQsByColumns(`select * from table`, [])).toEqual(`select * from table`);
    expect(updateQsByColumns(`select * from table`, ['column1', 'column2'])).toEqual(
      `select column1, column2 from table`
    );
  });
});
