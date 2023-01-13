import React from 'react';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import { act, findByTestId, render } from '@testing-library/react';
import { ThemeProvider } from 'styled-components/';
import { userEvent } from '@storybook/testing-library';
import PieChart from 'src/modules/charts/PieChart';
import theme from '../../styles/theme';

describe('PieChart', () => {
  it('should render', async () => {
    const { baseElement } = render(
      <ThemeProvider theme={theme}>
        <PieChart
          data={[
            {
              value: 10,
              color: 'primary',
              name: 'test',
              count: 1,
              total: 1,
            },
          ]}
          width={1000}
          height={1000}
        />
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    const shape = await findByTestId(baseElement, 'arc-shape-0');
    expect(shape).toBeInTheDocument();

    act(() => {
      userEvent.hover(shape);
    });

    act(() => {
      userEvent.unhover(shape);
    });

    const label = await findByTestId(baseElement, 'pie-chart-shape-0');
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
        <PieChart data={[]} width={1000} height={1000} />
      </ThemeProvider>
    );

    expect(baseElement).toBeDefined();
  });
});
