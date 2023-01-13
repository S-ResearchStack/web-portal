import React from 'react';
import 'src/__mocks__/setupResponsiveContainerMock';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import { act, render, screen } from '@testing-library/react';
import { theme } from 'src/styles';
import { history } from 'src/modules/navigation/store';
import { ThemeProvider } from 'styled-components/';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { createTestStore } from '../store/testing';
import AvgHeartRateFluctuationsCard from './AvgHeartRateFluctuationsCard';

describe('AvgHeartRateFluctuationsCard', () => {
  it('should render', async () => {
    const store = createTestStore({
      'overview/avgHeartRateFluctuations': {
        isLoading: false,
        fetchArgs: null,
        prevFetchArgs: null,
        data: [
          {
            dataKey: 'test',
            name: 'test',
            value: 10,
          },
        ],
      },
    });

    await act(() => {
      render(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <AvgHeartRateFluctuationsCard />
            </ConnectedRouter>
          </Provider>
        </ThemeProvider>
      );
    });

    expect(await screen.findByTestId('avg-heart-rate-fluctuations-card')).toBeInTheDocument();
  });

  it('[NEGATIVE] should render with empty store', async () => {
    const store = createTestStore({});

    await act(() => {
      render(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <AvgHeartRateFluctuationsCard />
            </ConnectedRouter>
          </Provider>
        </ThemeProvider>
      );
    });

    expect(await screen.findByTestId('avg-heart-rate-fluctuations-card')).toBeInTheDocument();
  });
});
