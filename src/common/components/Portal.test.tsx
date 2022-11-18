import React from 'react';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import { render } from '@testing-library/react';
import theme from 'src/styles/theme';
import { ThemeProvider } from 'styled-components/';
import Portal from './Portal';

describe('Portal', () => {
  it('test portal render', () => {
    const { baseElement, rerender } = render(
      <ThemeProvider theme={theme}>
        <Portal enabled id="portal" />
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    const portal = baseElement.querySelector('#portal-1');
    expect(portal).toBeInTheDocument();

    rerender(
      <ThemeProvider theme={theme}>
        <Portal enabled={false} data-testid="portal" />
      </ThemeProvider>
    );

    expect(portal).not.toBeInTheDocument();
  });
});
