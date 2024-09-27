import React from 'react';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import { fireEvent, getByText, render } from '@testing-library/react';
import theme from 'src/styles/theme';
import { ThemeProvider } from 'styled-components/';
import ServiceScreen from './ServiceScreen';

describe('ServiceScreen', () => {
  it('[NEGATIVE] test error service screen render', async () => {
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

  it('[NEGATIVE] test empty service screen render', () => {
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

  it('[NEGATIVE] should render with wrong `title` property', () => {
    const { baseElement, getByTestId } = render(
      <ThemeProvider theme={theme}>
        <ServiceScreen type="error" title={false as unknown as string} data-testid="error-screen" />
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();
    expect(getByTestId('error-screen')).toBeInTheDocument();
    expect(getByText(baseElement, 'Server Error')).not.toBeNull();
  });

  it('[NEGATIVE] should render with wrong `type` property', () => {
    const { baseElement, getByTestId } = render(
      <ThemeProvider theme={theme}>
        <ServiceScreen type={'unknown' as 'error'} data-testid="error-screen" />
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();
    expect(getByTestId('error-screen')).toBeInTheDocument();
  });
});
