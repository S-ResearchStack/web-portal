import React from 'react';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import { act, findByTestId, render } from '@testing-library/react';
import { ThemeProvider } from 'styled-components/';
import { userEvent } from '@storybook/testing-library';
import theme from 'src/styles/theme';
import LineChart from 'src/modules/charts/LineChart';

describe('LineChart', () => {
  it('should render', async () => {
    const onDotClick = jest.fn();

    const { baseElement } = render(
      <ThemeProvider theme={theme}>
        <LineChart
          data={[
            {
              name: 'test',
              ts: 0,
              value: 10,
              min: 5,
              max: 20,
              highlighted: true,
              lastSync: 0,
              color: 'primary',
            },
            {
              name: 'test',
              ts: 1,
              value: 11,
              min: 5,
              max: 20,
              highlighted: false,
              lastSync: 0,
              color: 'primary',
            },
          ]}
          width={1000}
          height={1000}
          hiddenDataLines={['none']}
          onDotClick={onDotClick}
          xDomain={[0, 100]}
          showTrendLines
        />
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    const dot = await findByTestId(baseElement, 'dot-test-0');
    expect(dot).toBeInTheDocument();

    act(() => {
      userEvent.hover(dot);
    });

    act(() => {
      userEvent.click(dot);
    });

    expect(onDotClick).toHaveBeenCalled();

    act(() => {
      userEvent.hover(baseElement.querySelector('.focus') as HTMLElement);
    });
  });

  it('[NEGATIVE] should render with empty data', () => {
    const { baseElement } = render(
      <ThemeProvider theme={theme}>
        <LineChart
          data={[]}
          width={1000}
          height={1000}
          hiddenDataLines={['none']}
          onDotClick={() => {}}
          xDomain={[0, 1]}
        />
      </ThemeProvider>
    );

    expect(baseElement).toBeDefined();
  });
});
