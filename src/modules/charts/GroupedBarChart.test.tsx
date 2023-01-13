import React from 'react';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import { render } from '@testing-library/react';
import { ThemeProvider } from 'styled-components/';
import GroupedBarChart from 'src/modules/charts/GroupedBarChart';
import theme from 'src/styles/theme';

describe('GroupedBarChart', () => {
  it('should render', () => {
    const { baseElement } = render(
      <ThemeProvider theme={theme}>
        <GroupedBarChart
          data={[{ name: 'test', dataKey: 'test', value: 10 }]}
          width={1000}
          height={1000}
          barColors={['primary']}
          maxValue={0}
          numberOfKeys={0}
        />
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();
  });

  it('[NEGATIVE] should render with empty data', () => {
    const { baseElement, rerender } = render(
      <ThemeProvider theme={theme}>
        <GroupedBarChart
          data={[]}
          width={1000}
          height={1000}
          barColors={['primary']}
          maxValue={0}
          numberOfKeys={0}
        />
      </ThemeProvider>
    );

    expect(baseElement).toBeDefined();

    rerender(
      <ThemeProvider theme={theme}>
        <GroupedBarChart
          data={[{ name: '', dataKey: '', value: 0 }]}
          width={1000}
          height={1000}
          barColors={['primary']}
          maxValue={0}
          numberOfKeys={0}
        />
      </ThemeProvider>
    );
    expect(baseElement).toBeDefined();
  });
});
