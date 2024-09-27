import React from 'react';
import '@testing-library/jest-dom';
import { render, fireEvent } from '@testing-library/react';
import { ThemeProvider } from 'styled-components/';
import theme from 'src/styles/theme';
import Config from './Config';
import { BarChartConfig, QueryResponseColumn } from 'src/modules/api';

describe('Config component', () => {
  const columns: QueryResponseColumn[] = [
    { name: 'value', type: 'number' },
    { name: 'category', type: 'string' },
  ];
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('should render ChooseColumn components for value and category', () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <Config columns={columns} onChange={mockOnChange} />
      </ThemeProvider>,
    );
    expect(getByText('Value column')).toBeInTheDocument();
    expect(getByText('Category column')).toBeInTheDocument();
  });

  it('should call onChange when horizontal toggle changes', () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <Config columns={columns} onChange={mockOnChange} />
      </ThemeProvider>,
    );

    fireEvent.click(getByText('Horizontal'));

    expect(mockOnChange).toHaveBeenCalledWith({ isHorizontal: true });
  });
});