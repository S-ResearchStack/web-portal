import React from 'react';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import { findByTestId, getByText, render } from '@testing-library/react';
import theme from 'src/styles/theme';
import { ThemeProvider } from 'styled-components/';
import Banner from './Banner';

describe('Banner', () => {
  it('test banner render', async () => {
    const { baseElement } = render(
      <ThemeProvider theme={theme}>
        <Banner data-testid="banner">Test</Banner>
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    const content = getByText(baseElement, 'Test');

    expect(content).toHaveStyle(`background-color: ${theme.colors.primary10}`);
    expect(content).toHaveStyle(`color: ${theme.colors.primary}`);
  });

  it('[NEGATIVE] should render banner without children', async () => {
    const { baseElement } = render(
      <ThemeProvider theme={theme}>
        <Banner data-testid="banner" />
      </ThemeProvider>
    );

    const banner = await findByTestId(baseElement, 'banner');

    expect(baseElement).toMatchSnapshot();
    expect(banner).not.toHaveTextContent('Test');
  });
});
