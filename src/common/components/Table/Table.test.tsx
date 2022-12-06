import React from 'react';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import { render } from '@testing-library/react';
import theme from 'src/styles/theme';
import { ThemeProvider } from 'styled-components';
import Table from './Table';
import { ColumnOptions, RowKeyExtractor } from './types';

describe('Table', () => {
  interface Row {
    id: number;
    name: string;
    email: string;
    isProcessing?: boolean;
  }

  const rows: Row[] = [
    { id: 1, name: 'John', email: 'john@example.com' },
    { id: 2, name: 'Lou', email: 'lou@example.com' },
    { id: 3, name: 'Cecile', email: 'cecele@example.com' },
    { id: 4, name: 'Kate', email: 'kate@example.com' },
    { id: 5, name: 'Les', email: 'les@example.com' },
    { id: 6, name: 'Nicol', email: 'nicol@example.com' },
    { id: 7, name: 'Adam', email: 'adam@example.com' },
    { id: 8, name: 'Bob', email: 'bob@example.com' },
    { id: 9, name: 'Mary', email: 'mary@example.com' },
    { id: 10, name: 'Well', email: 'well@example.com' },
  ];

  const columns: ColumnOptions<Row>[] = [
    {
      dataKey: 'id',
      label: 'id',
      $width: 100,
    },
    {
      dataKey: 'name',
      label: 'name',
      $width: 200,
    },
    {
      dataKey: 'email',
      label: 'email',
      $width: 200,
    },
  ];

  const getRowKey: RowKeyExtractor<Row> = (row) => row.id;

  beforeAll(() => {
    global.ResizeObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    }));
  });

  it('test table render', () => {
    const { baseElement, getByTestId, queryAllByTestId, rerender } = render(
      <ThemeProvider theme={theme}>
        <Table data-testid="table" rows={rows} columns={columns} getRowKey={getRowKey} />
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    const table = getByTestId('table');

    expect(table).toBeInTheDocument();
    expect(table).toHaveStyle('width: 500');
    expect(queryAllByTestId('table-head-cell').length).toBe(columns.length);
    expect(queryAllByTestId('table-row').length).toBe(rows.length);
    expect(queryAllByTestId('table-row')[0]).toHaveStyle('width: 200');

    rerender(
      <ThemeProvider theme={theme}>
        <div style={{ width: 200, maxWidth: 200 }}>
          <Table
            data-testid="table-small-width"
            rows={rows}
            columns={columns}
            getRowKey={getRowKey}
          />
        </div>
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    const tableSmallWidth = getByTestId('table-small-width');

    expect(tableSmallWidth).toBeInTheDocument();
    expect(tableSmallWidth).toHaveStyle('width: 200');
    expect(queryAllByTestId('table-row')[0]).toHaveStyle('width: 80');

    rerender(
      <ThemeProvider theme={theme}>
        <Table
          data-testid="virtual-table"
          rows={rows}
          columns={columns}
          getRowKey={getRowKey}
          virtual
        />
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    const virtualTable = getByTestId('virtual-table');

    expect(virtualTable).toBeInTheDocument();
    expect(queryAllByTestId('table-head-cell').length).toBe(columns.length);
    expect(queryAllByTestId('table-row').length).toBe(rows.length);
  });

  it('test table loading state', () => {
    const { baseElement, getByTestId, queryByTestId, rerender } = render(
      <ThemeProvider theme={theme}>
        <Table data-testid="table" rows={rows} columns={columns} getRowKey={getRowKey} />
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    const table = getByTestId('table');

    expect(table).toBeInTheDocument();

    rerender(
      <ThemeProvider theme={theme}>
        <Table data-testid="table" rows={rows} columns={columns} getRowKey={getRowKey} isLoading />
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    expect(table).toBeInTheDocument();

    const loader = queryByTestId('line-loader');

    expect(loader).toBeInTheDocument();
  });

  it('[NEGATIVE] should render with wrong props', () => {
    const { baseElement, getByTestId } = render(
      <ThemeProvider theme={theme}>
        <Table data-testid="table" rows={[]} columns={[]} getRowKey={getRowKey} />
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    const table = getByTestId('table');

    expect(table).toBeInTheDocument();
  });
});
