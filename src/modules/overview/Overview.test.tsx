import React from 'react';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import { act, render, screen } from '@testing-library/react';
import { theme } from 'src/styles';
import { history } from 'src/modules/navigation/store';
import { ThemeProvider } from 'styled-components/';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import Overview from './Overview';
import { createTestStore } from '../store/testing';

describe('Overview', () => {
  it('should render', async () => {
    const store = createTestStore({
      auth: {
        // {"roles": ["team-admin"]}
        authToken:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlcyI6WyJ0ZWFtLWFkbWluIl19.lgIiXvLowrZVPNiYcGxBpX_qiswgS1ShgfdCSIeL7FY',
      },
      'overview/participantsList': {
        isLoading: false,
        fetchArgs: null,
        prevFetchArgs: null,
        data: {
          total: 1,
          list: [
            {
              id: 'test',
              email: 'test',
              lastSync: 0,
              localTime: 0,
            },
          ],
        },
      },
    });

    await act(() => {
      render(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <Overview />
            </ConnectedRouter>
          </Provider>
        </ThemeProvider>
      );
    });

    expect(await screen.findByTestId('overview')).toBeDefined();
  });

  it('[NEGATIVE] should render with empty store', async () => {
    const store = createTestStore({});

    await act(() => {
      render(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <Overview />
            </ConnectedRouter>
          </Provider>
        </ThemeProvider>
      );
    });

    expect(await screen.findByTestId('overview')).toBeDefined();
  });
});
