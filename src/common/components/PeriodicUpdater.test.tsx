import React from 'react';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import { render } from '@testing-library/react';
import theme from 'src/styles/theme';
import { ThemeProvider } from 'styled-components/';
import PeriodicUpdater from './PeriodicUpdater';

describe('PeriodicUpdater', () => {
  it('test periodicUpdater render', async () => {
    const { baseElement, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <PeriodicUpdater interval={300}>{() => <div data-testid="child" />}</PeriodicUpdater>
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    const child = queryByTestId('child') as Element;

    expect(child).toBeInTheDocument();
  });

  it('[NEGATIVE] should render with wrong props', async () => {
    const { baseElement, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <PeriodicUpdater interval={-1}>{() => <div data-testid="child" />}</PeriodicUpdater>
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    const child = queryByTestId('child') as Element;

    expect(child).toBeInTheDocument();
  });
});
