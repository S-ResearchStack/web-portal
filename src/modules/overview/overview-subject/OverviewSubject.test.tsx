import React from 'react';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import { act, render, screen } from '@testing-library/react';
import { theme } from 'src/styles';
import { history } from 'src/modules/navigation/store';
import { ThemeProvider } from 'styled-components/';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import OverviewSubject from './OverviewSubject';
import { createTestStore } from '../../store/testing';

describe('OverviewSubject', () => {
  it('should render', async () => {
    const store = createTestStore({
      'overview/subject': {
        isLoading: false,
        fetchArgs: null,
        prevFetchArgs: null,
        data: {
          id: 'test',
          email: 'test',
          lastSync: 0,
          localTime: 0,
          avgBpm: 100,
          avgSteps: 1000,
          avgSleepMins: 8 * 3600,
          avgBloodPressure: '120/80',
        },
      },
    });

    await act(() => {
      render(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <OverviewSubject />
            </ConnectedRouter>
          </Provider>
        </ThemeProvider>
      );
    });

    expect(await screen.findByTestId('overview-subject')).toBeDefined();
  });

  it('[NEGATIVE] should render with empty store', async () => {
    const store = createTestStore({});

    await act(() => {
      render(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <OverviewSubject />
            </ConnectedRouter>
          </Provider>
        </ThemeProvider>
      );
    });

    expect(screen.queryByTestId('overview-subject')).toBeFalsy();
  });
});
