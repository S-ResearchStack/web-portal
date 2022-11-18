import React from 'react';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import { render } from '@testing-library/react';
import theme from 'src/styles/theme';
import { ThemeProvider } from 'styled-components/';
import Tabs from './Tabs';

describe('Tabs', () => {
  it('test tabs render', () => {
    const { baseElement, getByTestId, getAllByTestId } = render(
      <ThemeProvider theme={theme}>
        <Tabs
          data-testid="tabs"
          items={['tab_1', 'tab_2']}
          activeItemIdx={0}
          onTabChange={() => {}}
        />
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    const tabs = getByTestId('tabs');

    expect(tabs).toBeInTheDocument();
    expect(tabs).toHaveTextContent('tab_1');
    expect(tabs).toHaveTextContent('tab_2');

    const tabItems = getAllByTestId('tab');

    expect(tabItems.length).toBe(2);
  });
});
