import React from 'react';
import 'jest-styled-components';
import '@testing-library/jest-dom/extend-expect';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from 'styled-components';
import { Provider } from 'react-redux';
import { ConnectedRouter, getLocation } from 'connected-react-router';
import theme from 'src/styles/theme';
import { AppDispatch, store } from 'src/modules/store/store';
import { history, Path } from 'src/modules/navigation/store';
import SignInScreen from 'src/modules/auth/signin/SignInScreen';
import { authSlice, isAuthorizedSelector } from 'src/modules/auth/auth.slice';
import { matchPath } from 'react-router-dom';
import { STORAGE_REFRESH_TOKEN_KEY, STORAGE_TOKEN_KEY } from 'src/modules/auth/utils';

// eslint-disable-next-line prefer-destructuring
const dispatch: AppDispatch = store.dispatch;

const passwordValue = 'samsung';

describe('SignInScreen', () => {
  beforeEach(() => {
    dispatch(authSlice.actions.clearAuth());
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem(STORAGE_REFRESH_TOKEN_KEY);
  });

  it('should sign in', async () => {
    await act(() => {
      render(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <SignInScreen />
            </ConnectedRouter>
          </Provider>
        </ThemeProvider>
      );
    });

    expect(await screen.findByTestId('signin-screen')).toMatchSnapshot();

    const email = await screen.findByTestId('signin-screen-email');
    const password = await screen.findByTestId('signin-screen-password');
    const remember = await screen.findByTestId('signin-screen-remember');
    const send = await screen.findByTestId('signin-screen-send');

    const emailValue = 'hello@samsung.com';
    await userEvent.type(email, emailValue);
    expect(email).toHaveValue(emailValue);

    await userEvent.type(password, passwordValue);
    expect(password).toHaveValue(passwordValue);

    await userEvent.click(remember);
    expect(remember).toBeChecked();

    await userEvent.click(send);

    await waitFor(() => expect(isAuthorizedSelector(store.getState())).toBeTruthy());

    expect(
      matchPath(getLocation(store.getState()).pathname, {
        path: Path.Overview,
        exact: true,
      })
    ).not.toBeNull();
  });

  it('[NEGATIVE] should sign in with incorrect email', async () => {
    await act(() => {
      render(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <SignInScreen />
            </ConnectedRouter>
          </Provider>
        </ThemeProvider>
      );
    });

    expect(await screen.findByTestId('signin-screen')).toMatchSnapshot();

    const email = await screen.findByTestId('signin-screen-email');
    const password = await screen.findByTestId('signin-screen-password');
    const remember = await screen.findByTestId('signin-screen-remember');
    const send = await screen.findByTestId('signin-screen-send');
    const error = await screen.findByTestId('signin-screen-error');

    const unsatisfactoryEmailValue = 'hello@example.com';
    await userEvent.type(email, unsatisfactoryEmailValue);
    expect(email).toHaveValue(unsatisfactoryEmailValue);

    await userEvent.type(password, passwordValue);
    expect(password).toHaveValue(passwordValue);

    await userEvent.click(remember);
    expect(remember).toBeChecked();

    await userEvent.click(send);

    await waitFor(() => expect(isAuthorizedSelector(store.getState())).toBeFalsy());

    expect(error).toHaveTextContent('Incorrect email or password, please try again.');
  });
});
