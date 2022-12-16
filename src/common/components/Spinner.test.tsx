import React from 'react';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import { render } from '@testing-library/react';
import theme from 'src/styles/theme';
import { ThemeProvider } from 'styled-components/';
import Spinner from './Spinner';

describe('Spinner', () => {
  it('test spinner render', () => {
    const { baseElement, queryByTestId, rerender } = render(
      <ThemeProvider theme={theme}>
        <Spinner size="xs" />
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    const spinner = queryByTestId('spinner') as Element;

    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveStyle(`fill: ${theme.colors.primary}`);

    rerender(
      <ThemeProvider theme={theme}>
        <Spinner size="xs" $light />
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveStyle(`fill: ${theme.colors.surface}`);
  });

  it('[NEGATIVE] should render with wrong props', () => {
    const { baseElement, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <Spinner size={'unknown' as 'xs'} />
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    const spinner = queryByTestId('spinner') as Element;

    expect(spinner).toBeInTheDocument();
  });

  it('[NEGATIVE] should render without props', () => {
    const { baseElement, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <Spinner />
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();
    expect(queryByTestId('spinner')).toBeInTheDocument();
  });
});
