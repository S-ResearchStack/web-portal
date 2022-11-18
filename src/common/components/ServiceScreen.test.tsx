import React from 'react';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import { fireEvent, getByText, render } from '@testing-library/react';
import theme from 'src/styles/theme';
import { ThemeProvider } from 'styled-components/';
import ServiceScreen from './ServiceScreen';

describe('ServiceScreen', () => {
  it('test error service screen render', async () => {
    const onReload = jest.fn();

    const { baseElement, getByTestId, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <ServiceScreen type="error" onReload={onReload} data-testid="error-screen" />
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    const errorScreen = getByTestId('error-screen');
    const reloadButton = queryByTestId('reload-button') as Element;

    expect(errorScreen).toBeInTheDocument();
    expect(reloadButton).toBeInTheDocument();

    fireEvent.click(reloadButton);

    expect(onReload).toHaveBeenCalledTimes(1);
  });

  it('test empty service screen render', () => {
    const { baseElement, getByTestId, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <ServiceScreen type="empty" data-testid="empty-screen" />
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    const emptyScreen = getByTestId('empty-screen');
    const emptyIcon = queryByTestId('empty-icon') as Element;

    expect(emptyScreen).toBeInTheDocument();
    expect(emptyIcon).toBeInTheDocument();
    expect(getByText(baseElement, 'No Data')).toBeInTheDocument();
  });

  it('test loading service screen render', () => {
    const { baseElement, getByTestId, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <ServiceScreen type="loading" data-testid="loading-screen" />
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    const errorScreen = getByTestId('loading-screen');
    const spinner = queryByTestId('spinner') as Element;

    expect(errorScreen).toBeInTheDocument();
    expect(spinner).toBeInTheDocument();
  });
});
