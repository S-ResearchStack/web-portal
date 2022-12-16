import React from 'react';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import { render } from '@testing-library/react';
import { px } from 'src/styles';
import theme from 'src/styles/theme';
import { ThemeProvider } from 'styled-components/';
import LineLoader from './LineLoader';

describe('LineLoader', () => {
  it('test line loader render', () => {
    const { baseElement, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <LineLoader />
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    const lineLoader = queryByTestId('line-loader') as Element;
    const runner = queryByTestId('runner') as Element;

    expect(lineLoader).toBeInTheDocument();
    expect(runner).toBeInTheDocument();

    expect(lineLoader).toHaveStyle(`height: ${px(1)}`);
    expect(lineLoader).toHaveStyle(`background: ${theme.colors.primaryDisabled}`);

    expect(runner).toHaveStyle(`height: ${px(2)}`);
    expect(runner).toHaveStyle(`background: ${theme.colors.primary}`);
  });

  it('[NEGATIVE] should render with excluding children', () => {
    const child = 'test';

    const { baseElement, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <LineLoader>{child}</LineLoader>
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    const lineLoader = queryByTestId('line-loader') as Element;
    const runner = queryByTestId('runner') as Element;

    expect(lineLoader).toBeInTheDocument();
    expect(runner).toBeInTheDocument();
    expect(lineLoader).not.toHaveTextContent(child);
  });
});
