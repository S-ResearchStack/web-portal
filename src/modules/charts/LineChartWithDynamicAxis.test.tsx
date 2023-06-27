import React from 'react';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import { act, findByTestId, render } from '@testing-library/react';
import { ThemeProvider } from 'styled-components/';
import { userEvent } from '@storybook/testing-library';
import theme from 'src/styles/theme';
import LineChartWithDynamicAxis from 'src/modules/charts/LineChartWithDynamicAxis';

describe('LineChartWithDynamicAxis', () => {
  it('should render with various datasets', async () => {
    /* by year */
    const { baseElement, rerender } = render(
      <ThemeProvider theme={theme}>
        <LineChartWithDynamicAxis
          data={[
            { ts: 1680220800000, value: 130 },
            { ts: 1711785600000, value: 89 },
            { ts: 1743350400000, value: 442 },
            { ts: 1774915200000, value: 368 },
            { ts: 1806480000000, value: 206 },
            { ts: 1838044800000, value: 422 },
          ]}
          width={1000}
          height={1000}
        />
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    const rect = await findByTestId(baseElement, 'line-chart-with-dynamic-axis-rect');

    act(() => {
      userEvent.hover(rect);
    });

    act(() => {
      userEvent.unhover(rect);
    });

    /* by hours */
    rerender(
      <ThemeProvider theme={theme}>
        <LineChartWithDynamicAxis
          data={[
            { value: 227, ts: 1680296400000 },
            { value: 252, ts: 1680307200000 },
            { value: 387, ts: 1680318000000 },
            { value: 210, ts: 1680328800000 },
            { value: 458, ts: 1680339600000 },
          ]}
          width={1000}
          height={1000}
        />
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    /* by weeks */
    rerender(
      <ThemeProvider theme={theme}>
        <LineChartWithDynamicAxis
          data={[
            { value: 377, ts: 1680296400000 },
            { value: 461, ts: 1681506000000 },
            { value: 384, ts: 1682888400000 },
            { value: 336, ts: 1684098000000 },
            { value: 424, ts: 1685566800000 },
            { value: 315, ts: 1686776400000 },
            { value: 354, ts: 1688113569000 },
            { value: 342, ts: 1688158800000 },
            { value: 300, ts: 1689368400000 },
            { value: 276, ts: 1690837200000 },
            { value: 366, ts: 1694725200000 },
            { value: 390, ts: 1693515600000 },
          ]}
          width={1000}
          height={1000}
        />
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    /* by months */
    rerender(
      <ThemeProvider theme={theme}>
        <LineChartWithDynamicAxis
          data={[
            { value: 489, ts: 1680296400000 },
            { value: 495, ts: 1682888400000 },
            { value: 199, ts: 1685566800000 },
            { value: 130, ts: 1688158800000 },
            { value: 186, ts: 1690837200000 },
            { value: 401, ts: 1693515600000 },
            { value: 500, ts: 1696107600000 },
            { value: 200, ts: 1698786000000 },
          ]}
          width={1000}
          height={1000}
        />
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();
  });

  it('[NEGATIVE] should render with empty data', () => {
    const { baseElement } = render(
      <ThemeProvider theme={theme}>
        <LineChartWithDynamicAxis data={[]} width={1000} height={1000} />
      </ThemeProvider>
    );

    expect(baseElement).toBeDefined();
  });
});
