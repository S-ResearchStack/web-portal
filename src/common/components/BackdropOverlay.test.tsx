import React from 'react';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import { render } from '@testing-library/react';
import theme from 'src/styles/theme';
import { ThemeProvider } from 'styled-components/';
import BackdropOverlay from './BackdropOverlay';

describe('BackdropOverlay', () => {
  it('test backdrop open', () => {
    const { baseElement, queryByTestId, rerender } = render(
      <ThemeProvider theme={theme}>
        <BackdropOverlay data-testid="backdrop-overlay" open={false}>
          <div />
        </BackdropOverlay>
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    const backdropContainer = queryByTestId('backdrop-container');

    expect(backdropContainer).toBeInTheDocument();
    expect(backdropContainer).toHaveStyle('z-index: -1');

    rerender(
      <ThemeProvider theme={theme}>
        <BackdropOverlay data-testid="backdrop-overlay" open>
          <div />
        </BackdropOverlay>
      </ThemeProvider>
    );

    expect(backdropContainer).toHaveStyle('z-index: 1000');
  });

  it('test backdrop overlay loading state', () => {
    const { queryByTestId, rerender } = render(
      <ThemeProvider theme={theme}>
        <BackdropOverlay data-testid="backdrop-overlay" open>
          <div />
        </BackdropOverlay>
      </ThemeProvider>
    );
    const backdrop = queryByTestId('backdrop');

    expect(backdrop).toBeInTheDocument();
    expect(backdrop).toHaveStyle(`background-color: ${theme.colors.black40};`);
    expect(backdrop).not.toHaveStyle('opacity: 0.7');

    rerender(
      <ThemeProvider theme={theme}>
        <BackdropOverlay data-testid="backdrop-overlay" open loaderBackdrop>
          <div />
        </BackdropOverlay>
      </ThemeProvider>
    );

    expect(backdrop).toHaveStyle(`background-color: ${theme.colors.background}`);
    expect(backdrop).toHaveStyle('opacity: 0.7');
  });

  it('[NEGATIVE] should render without children', () => {
    const { queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <BackdropOverlay open />
      </ThemeProvider>
    );

    expect(queryByTestId('backdrop')).toBeInTheDocument();
  });

  it('[NEGATIVE] should render without props', () => {
    const { queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <BackdropOverlay />
      </ThemeProvider>
    );

    expect(queryByTestId('backdrop')).toBeInTheDocument();
  });
});
