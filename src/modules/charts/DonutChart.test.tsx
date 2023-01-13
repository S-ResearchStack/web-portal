import React from 'react';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import { act, findByTestId, render } from '@testing-library/react';
import { ThemeProvider } from 'styled-components/';
import { userEvent } from '@storybook/testing-library';
import DonutChart from 'src/modules/charts/DonutChart';
import theme from '../../styles/theme';

describe('DonutChart', () => {
  it('should render', async () => {
    const { baseElement } = render(
      <ThemeProvider theme={theme}>
        <DonutChart
          totalPercents={0}
          data={[
            {
              value: 10,
              total: 100,
              count: 100,
              color: 'primary',
              name: 'test',
            },
          ]}
          width={1000}
          height={1000}
        />
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    const label = await findByTestId(baseElement, 'donut-chart-shape-0');
    expect(label).toBeInTheDocument();

    act(() => {
      userEvent.hover(label);
    });

    act(() => {
      userEvent.unhover(label);
    });
  });

  it('[NEGATIVE] should render with empty data', () => {
    const { baseElement } = render(
      <ThemeProvider theme={theme}>
        <DonutChart totalPercents={0} data={[]} width={1000} height={1000} />
      </ThemeProvider>
    );

    expect(baseElement).toBeDefined();
  });
});
