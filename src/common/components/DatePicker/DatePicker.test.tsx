import React from 'react';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import { getByText, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import theme from 'src/styles/theme';
import { ThemeProvider } from 'styled-components/';
import DatePicker from './DatePicker';

describe('DatePicker', () => {
  it('test date picker render', async () => {
    const onChange = jest.fn();
    const testDate = new Date(2022, 0, 1);

    const { baseElement, getByTestId, queryByTestId, rerender } = render(
      <ThemeProvider theme={theme}>
        <DatePicker onChange={onChange} data-testid="date-picker" />
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    const datePicker = getByTestId('date-picker') as Element;
    expect(datePicker).toBeInTheDocument();

    expect(getByText(baseElement, 'Select')).toBeInTheDocument();

    rerender(
      <ThemeProvider theme={theme}>
        <DatePicker onChange={onChange} value={testDate} data-testid="date-picker" />
      </ThemeProvider>
    );

    await userEvent.click(datePicker);

    await waitFor(() => expect(queryByTestId('calendar-popover')).toBeVisible(), { timeout: 100 });

    expect(baseElement).toMatchSnapshot();

    expect(getByText(baseElement, 'Sat, Jan 01, 2022')).toBeInTheDocument();

    expect(baseElement).toMatchSnapshot();
  });

  it('[NEGATIVE] test date picker render with broken parameters', async () => {
    const onChange = jest.fn();
    const testDate = null;

    const { baseElement, getByTestId } = render(
      <ThemeProvider theme={theme}>
        <DatePicker
          onChange={onChange}
          value={testDate as unknown as Date}
          data-testid="date-picker"
        />
      </ThemeProvider>
    );

    const datePicker = getByTestId('date-picker') as Element;

    expect(baseElement).toMatchSnapshot();
    expect(datePicker).toBeInTheDocument();
  });
});
