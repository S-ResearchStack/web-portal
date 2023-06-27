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

    const portal = baseElement.querySelector('[id^="portal-"]');
    expect(portal).toBeInTheDocument();

    rerender(
      <ThemeProvider theme={theme}>
        <Portal enabled={false} data-testid="portal" />
      </ThemeProvider>
    );

    expect(portal).not.toBeInTheDocument();
  });

  it('[NEGATIVE] should render with wrong props', () => {
    const id = 'id';

    const { baseElement } = render(
      <ThemeProvider theme={theme}>
        <Portal enabled={'string' as unknown as boolean} id={[id] as unknown as string} />
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    const portal = baseElement.querySelector(`[id^="${id}-"]`);

    expect(portal).toBeInTheDocument();
  });
});
