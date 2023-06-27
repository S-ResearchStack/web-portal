import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { Provider } from 'react-redux';
import { ConnectedRouter, getLocation } from 'connected-react-router';
import { enableFetchMocks } from 'jest-fetch-mock';
import 'jest-styled-components';

import theme from 'src/styles/theme';
import { makeStore } from 'src/modules/store/store';
import { makeHistory, Path } from 'src/modules/navigation/store';
import AccountCreated from 'src/modules/auth/signup/AccountCreated';
import { matchPath } from 'react-router-dom';
import userEvent from '@testing-library/user-event';

describe('AccountCreated', () => {
  let store: ReturnType<typeof makeStore>;
  let history: ReturnType<typeof makeHistory>;

  beforeAll(() => {
    enableFetchMocks();
  });

  beforeEach(() => {
    history = makeHistory();
    store = makeStore(history);
    localStorage.setItem('API_URL', 'https://samsung.com/');
  });

  let search = '';
  const mockSearch = (s: string) => {
    search = s;
    Object.defineProperty(window, 'location', {
      configurable: true,
      enumerable: true,
      get: () => new URL(`http://test.com/?${search}`),
    });
  };

  it('should render', async () => {
    mockSearch('email=example.com&reset-token=123');

    await act(async () => {
      render(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <AccountCreated />
            </ConnectedRouter>
          </Provider>
        </ThemeProvider>
      );
    });

    expect(await screen.findByTestId('account-created')).toMatchSnapshot();

    await waitFor(() =>
      expect(
        matchPath(getLocation(store.getState()).pathname, {
          path: '/', // because it is initial path
          exact: true,
        })
      ).not.toBeNull()
    );

    const nextBtn = await screen.findByTestId('account-created-next');
    await userEvent.click(nextBtn);

    await waitFor(() =>
      expect(
        matchPath(getLocation(store.getState()).pathname, {
          path: '/', // because it is initial path
          exact: true,
        })
      ).toBeNull()
    );
  });

  it('[NEGATIVE] should render without a token', async () => {
    mockSearch('');

    const { baseElement } = render(
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          <ConnectedRouter history={history}>
            <AccountCreated />
          </ConnectedRouter>
        </Provider>
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    await waitFor(() =>
      expect(
        matchPath(getLocation(store.getState()).pathname, {
          path: Path.SignIn,
          exact: true,
        })
      ).not.toBeNull()
    );
  });
});
