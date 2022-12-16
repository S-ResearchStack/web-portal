import React from 'react';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import { render } from '@testing-library/react';
import { ThemeProvider } from 'styled-components/';
import theme from 'src/styles/theme';
import CustomScrollbar from 'src/common/components/CustomScrollbar';
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

  it('[NEGATIVE] should render with wrong props', () => {
    const { baseElement, getByTestId } = render(
      <ThemeProvider theme={theme}>
        <CustomScrollbar
          data-testid="scrollable-container"
          scrollbarTrackColor={null as unknown as string}
          scrollbarThumbColor={null as unknown as string}
          scrollbarOffsetRight={null as unknown as number}
        />
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();
    expect(getByTestId('scrollable-container')).toBeInTheDocument();
  });
});
