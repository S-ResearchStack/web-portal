import React from 'react';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import { act, findByTestId, render } from '@testing-library/react';
import { ThemeProvider } from 'styled-components/';
import { userEvent } from '@storybook/testing-library';
import theme from 'src/styles/theme';
import StackedBarChart from 'src/modules/charts/StackedBarChart';

describe('StackedBarChart', () => {
  it('should render', async () => {
    const { baseElement } = render(
      <ThemeProvider theme={theme}>
        <StackedBarChart
          width={1000}
          height={1000}
          data={[
            {
              percentage: 90,
              scaleValue: 0,
            },
            {
              percentage: 10,
              scaleValue: 1,
            },
          ]}
        />
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    const area = await findByTestId(baseElement, 'area-0');
    expect(area).toBeInTheDocument();

    act(() => {
      userEvent.hover(area);
    });

    act(() => {
      userEvent.unhover(area);
    });
  });

  it('[NEGATIVE] should render with empty data', () => {
    const { baseElement } = render(
      <ThemeProvider theme={theme}>
        <StackedBarChart width={1000} height={1000} data={[]} />
      </ThemeProvider>
    );

    expect(baseElement).toBeDefined();
  });
});
