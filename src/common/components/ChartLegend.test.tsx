import React from 'react';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import { getByText, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import theme from 'src/styles/theme';
import { ThemeProvider } from 'styled-components/';
import ChartLegend, { ChartLegendItem, ChartLegendProps } from './ChartLegend';

describe('ChartLegend', () => {
  const items: Array<ChartLegendItem> = [
    {
      name: 'male',
      color: 'primary',
      checked: false,
    },
    {
      name: 'female',
      color: 'secondaryGreen',
      checked: false,
    },
  ];

  it('test chart legend render', async () => {
    const onChange = jest.fn();

    const { baseElement, getByTestId, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <ChartLegend items={items} data-testid="chart-legend" canToggle onChange={onChange} />
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    const chartLegend = getByTestId('chart-legend');

    expect(chartLegend).toBeInTheDocument();
    expect(getByText(baseElement, 'Male')).toBeInTheDocument();
    expect(getByText(baseElement, 'Female')).toBeInTheDocument();

    const radioMale = queryByTestId('male') as Element;
    const radioFemale = queryByTestId('female') as Element;

    expect(radioMale).not.toBeChecked();
    expect(radioFemale).not.toBeChecked();

    await userEvent.click(radioMale);

    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('test chart legend if canToggle=false', async () => {
    const { baseElement, getByTestId, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <ChartLegend items={items} data-testid="chart-legend" canToggle={false} />
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    const chartLegend = getByTestId('chart-legend');
    const radioMale = queryByTestId('male') as Element;
    const radioFemale = queryByTestId('female') as Element;

    expect(chartLegend).toBeInTheDocument();

    expect(radioMale).toBeChecked();
    expect(radioFemale).toBeChecked();

    await userEvent.click(radioMale);

    await waitFor(() => {
      expect(radioMale).toBeChecked();
      expect(radioFemale).toBeChecked();
    });
  });

  it('[NEGATIVE] should render chart legend with empty props', async () => {
    const onChange = jest.fn();

    const { baseElement, getByTestId } = render(
      <ThemeProvider theme={theme}>
        <ChartLegend items={[]} data-testid="chart-legend" canToggle onChange={onChange} />
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    const chartLegend = getByTestId('chart-legend');

    expect(chartLegend).toBeInTheDocument();
  });

  it('[NEGATIVE] should render chart legend without props', async () => {
    const fakeProps = {} as ChartLegendProps;

    const { baseElement, getByTestId } = render(
      <ThemeProvider theme={theme}>
        <ChartLegend data-testid="chart-legend" {...fakeProps} />
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    const chartLegend = getByTestId('chart-legend');

    expect(chartLegend).toBeInTheDocument();
  });
});
