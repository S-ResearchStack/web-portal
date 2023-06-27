import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { Provider } from 'react-redux';
import { ConnectedRouter, getLocation } from 'connected-react-router';
import { enableFetchMocks } from 'jest-fetch-mock';
import 'jest-styled-components';
import '@testing-library/jest-dom/extend-expect';

import theme from 'src/styles/theme';
import { makeStore } from 'src/modules/store/store';
import { makeHistory, Path } from 'src/modules/navigation/store';
import SignUp from 'src/modules/auth/signup/SignUp';
import userEvent from '@testing-library/user-event';
import { matchPath } from 'react-router-dom';

describe('SignUp', () => {
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

  it('should render', async () => {
    history.location.search = '?email=examole.com&token=123';

    await act(async () => {
      render(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <SignUp />
            </ConnectedRouter>
          </Provider>
        </ThemeProvider>
      );
    });

    expect(await screen.findByTestId('auth-signup')).toMatchSnapshot();

    const emailValue = 'email@samsung.com';
    const email = await screen.findByTestId('auth-signup-email');
    await userEvent.type(email, emailValue);
    expect(email).toHaveValue(emailValue);

    const nameValue = 'username';
    const name = await screen.findByTestId('auth-signup-name');
    await userEvent.type(name, nameValue);
    expect(name).toHaveValue(nameValue);

    const passwordValue = 'qweQWE123!@#';
    const password = await screen.findByTestId('auth-signup-password');
    await userEvent.type(password, passwordValue);
    expect(password).toHaveValue(passwordValue);

    expect(await screen.findByTestId('auth-signup')).toMatchSnapshot();

    const create = await screen.findByTestId('auth-signup-create');
    await userEvent.click(create);

    await waitFor(() =>
      expect(
        matchPath(getLocation(store.getState()).pathname, {
          path: Path.AccountConfirm,
          exact: true,
        })
      ).not.toBeNull()
    );
  });

  it('[NEGATIVE] should render with a invalid data', async () => {
    history.location.search = '?email=examole.com&token=123';

    await act(async () => {
      render(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <SignUp />
            </ConnectedRouter>
          </Provider>
        </ThemeProvider>
      );
    });

    expect(await screen.findByTestId('auth-signup')).toMatchSnapshot();

    const emailValue = 'email@samsung.com';
    const email = await screen.findByTestId('auth-signup-email');
    await userEvent.type(email, emailValue);
    expect(email).toHaveValue(emailValue);

    const nameValue = 'username';
    const name = await screen.findByTestId('auth-signup-name');
    await userEvent.type(name, nameValue);
    expect(name).toHaveValue(nameValue);

    const password = await screen.findByTestId('auth-signup-password');
    await userEvent.type(password, nameValue);
    expect(password).toHaveValue(nameValue);

    expect(await screen.findByTestId('auth-signup')).toMatchSnapshot();

    const radios = await screen.findAllByTestId('auth-signup-radio');

    expect(radios).toHaveLength(4);

    let errorsCount = 0;
    for (const radio of radios) {
      if (
        ((radio as HTMLInputElement).parentElement as HTMLElement).getAttribute('kind') === 'error'
      ) {
        errorsCount += 1;
      }
    }

    expect(errorsCount).toBe(3);

    const create = await screen.findByTestId('auth-signup-create');
    await userEvent.click(create);

    await waitFor(() =>
      expect(
        matchPath(getLocation(store.getState()).pathname, {
          path: '/',
          exact: true,
        })
      ).not.toBeNull()
    );
  });
});
