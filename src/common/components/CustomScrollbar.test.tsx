import React from 'react';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import { render } from '@testing-library/react';
import theme from 'src/styles/theme';
import { ThemeProvider } from 'styled-components/';
import { MaxHeightContainer } from './CustomScrollbar.stories';

describe('CustomScrollbar', () => {
  it('test custom scrollbar render', () => {
    const { baseElement, getByTestId } = render(
      <ThemeProvider theme={theme}>
        <MaxHeightContainer data-testid="scrollable-container" />
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    const scrollableContainer = getByTestId('scrollable-container');

    expect(scrollableContainer).toBeInTheDocument();
  });
});
