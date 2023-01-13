import React from 'react';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import { act, findByTestId, render } from '@testing-library/react';
import { ThemeProvider } from 'styled-components/';
import { userEvent } from '@storybook/testing-library';
import theme from 'src/styles/theme';
import ScatterChart from 'src/modules/charts/ScatterChart';

describe('ScatterChart', () => {
  it('should render', async () => {
    const { baseElement } = render(
      <ThemeProvider theme={theme}>
        <ScatterChart
          width={1000}
          height={1000}
          dots={[
            {
              name: 'test',
              age: 30,
              value: 150,
              lastSync: 0,
              color: 'primary',
            },
          ]}
          hiddenDataLines={[]}
          lines={[
            {
              name: 'test',
              age: 30,
              value: 180,
              color: 'primary',
            },
            {
              name: 'test',
              age: 40,
              value: 140,
              color: 'primary',
            },
          ]}
        />
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    const dot = await findByTestId(baseElement, 'dot-0');
    expect(dot).toBeInTheDocument();

    act(() => {
      userEvent.hover(dot);
    });

    act(() => {
      userEvent.unhover(dot);
    });
  });

  it('[NEGATIVE] should render with empty data', () => {
    const { baseElement } = render(
      <ThemeProvider theme={theme}>
        <ScatterChart width={1000} height={1000} dots={[]} hiddenDataLines={[]} lines={[]} />
      </ThemeProvider>
    );

    expect(baseElement).toBeDefined();
  });
});
