import React from 'react';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import { act, findByTestId, render } from '@testing-library/react';
import { ThemeProvider } from 'styled-components/';
import { userEvent } from '@storybook/testing-library';

import BarChart from 'src/modules/charts/BarChart';
import theme from '../../styles/theme';

describe('BarChart', () => {
  it('should render', async () => {
    const { baseElement } = render(
      <ThemeProvider theme={theme}>
        <BarChart
          data={[{ name: 'test', value: 10, totalValue: 100 }]}
          width={1000}
          height={1000}
        />
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    const bar = await findByTestId(baseElement, 'bar-0');
    expect(bar).toBeInTheDocument();

    act(() => {
      userEvent.hover(bar);
    });

    act(() => {
      userEvent.unhover(bar);
    });
  });

  it('[NEGATIVE] should render with empty data', () => {
    const { baseElement, rerender } = render(
      <ThemeProvider theme={theme}>
        <BarChart data={[{ name: '', value: 0, totalValue: 0 }]} width={1000} height={1000} />
      </ThemeProvider>
    );

    expect(baseElement).toBeDefined();

    rerender(
      <ThemeProvider theme={theme}>
        <BarChart data={[]} width={1000} height={1000} />
      </ThemeProvider>
    );
    expect(baseElement).toBeDefined();
  });
});
