import React from 'react';
import 'jest-styled-components';
import '@testing-library/jest-dom/extend-expect';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from 'styled-components';
import { Provider } from 'react-redux';
import { ConnectedRouter, getLocation } from 'connected-react-router';
import { matchPath } from 'react-router-dom';
import theme from 'src/styles/theme';
import { AppDispatch, store } from 'src/modules/store/store';
import { history, Path } from 'src/modules/navigation/store';
import SignInScreen from 'src/modules/auth/signin/SignIn';
import { authSlice, isTokenExistSelector, isUserRegistered } from 'src/modules/auth/auth.slice';
import { STORAGE_REFRESH_TOKEN_KEY, STORAGE_TOKEN_KEY } from 'src/modules/auth/utils';

// eslint-disable-next-line prefer-destructuring
const dispatch: AppDispatch = store.dispatch;

const passwordValue = 'Samsung123456@';

describe('SignIn', () => {
  beforeEach(async () => {
    dispatch(authSlice.actions.clearAuth());
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem(STORAGE_REFRESH_TOKEN_KEY);

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
  });

  it('should sign in', async () => {
    const email = await screen.findByTestId('signin-screen-email');
    const password = await screen.findByTestId('signin-screen-password');
    const remember = await screen.findByTestId('signin-screen-remember');
    const send = await screen.findByTestId('signin-screen-send');

    const emailValue = 'hello@samsung.com';
    await userEvent.type(email, emailValue);
    expect(email).toHaveValue(emailValue);

    await userEvent.type(password, passwordValue);
    expect(password).toHaveValue(passwordValue);

    expect(remember).toBeChecked();

    await userEvent.click(send);

    await waitFor(() => expect(isTokenExistSelector(store.getState())).toBeTruthy());
    await waitFor(() => expect(isUserRegistered).toBeTruthy());

    expect(
      matchPath(getLocation(store.getState()).pathname, {
        path: Path.Overview,
        exact: true,
      })
    ).not.toBeNull();
  });

  it('should sign in when press Enter', async () => {
    const email = await screen.findByTestId('signin-screen-email');
    const password = await screen.findByTestId('signin-screen-password');
    const remember = await screen.findByTestId('signin-screen-remember');
    const send = await screen.findByTestId('signin-screen-send');

    const emailValue = 'hello@samsung.com';
    await userEvent.type(email, emailValue);
    expect(email).toHaveValue(emailValue);

    await userEvent.type(password, passwordValue);
    expect(password).toHaveValue(passwordValue);

    expect(remember).toBeChecked();

    await fireEvent.keyDown(send, { key: 'Enter', code: 'Enter', charCode: 13 });

    await waitFor(() => expect(isTokenExistSelector(store.getState())).toBeTruthy());

    expect(
      matchPath(getLocation(store.getState()).pathname, {
        path: Path.Overview,
        exact: true,
      })
    ).not.toBeNull();
  });

  it('should sign in without remember', async () => {
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
    expect(remember).not.toBeChecked();

    await userEvent.click(send);

    await waitFor(() => expect(isTokenExistSelector(store.getState())).toBeTruthy());

    expect(
      matchPath(getLocation(store.getState()).pathname, {
        path: Path.Overview,
        exact: true,
      })
    ).not.toBeNull();
  });

  it('[NEGATIVE] sign in with invalid email', async () => {
    const email = await screen.findByTestId('signin-screen-email');
    const password = await screen.findByTestId('signin-screen-password');
    const remember = await screen.findByTestId('signin-screen-remember');
    const send = await screen.findByTestId('signin-screen-send');
    const error = await screen.findByTestId('signin-screen-error');

    const unsatisfactoryEmailValue = 'hello.com';
    await userEvent.type(email, unsatisfactoryEmailValue);
    expect(email).toHaveValue(unsatisfactoryEmailValue);

    await userEvent.type(password, passwordValue);
    expect(password).toHaveValue(passwordValue);

    expect(remember).toBeChecked();

    await userEvent.click(send);

    await waitFor(() => expect(isTokenExistSelector(store.getState())).toBeFalsy());

    expect(error).toHaveTextContent('Incorrect email or password, please try again.');
  });

  it('[NEGATIVE] should reset error when email change', async () => {
    const email = await screen.findByTestId('signin-screen-email');
    const password = await screen.findByTestId('signin-screen-password');
    const remember = await screen.findByTestId('signin-screen-remember');
    const send = await screen.findByTestId('signin-screen-send');
    const error = await screen.findByTestId('signin-screen-error');

    const unsatisfactoryEmailValue = 'hello.com';
    await userEvent.type(email, unsatisfactoryEmailValue);
    expect(email).toHaveValue(unsatisfactoryEmailValue);

    await userEvent.type(password, passwordValue);
    expect(password).toHaveValue(passwordValue);

    expect(remember).toBeChecked();

    await userEvent.click(send);

    await waitFor(() => expect(isTokenExistSelector(store.getState())).toBeFalsy());

    expect(error).toHaveTextContent('Incorrect email or password, please try again.');

    const otherEmail = 'other@email.com';
    await userEvent.clear(email);
    await userEvent.type(email, otherEmail);
    expect(email).toHaveValue(otherEmail);
  });

  it('[NEGATIVE] should reset error when password change', async () => {
    const email = await screen.findByTestId('signin-screen-email');
    const password = await screen.findByTestId('signin-screen-password');
    const remember = await screen.findByTestId('signin-screen-remember');
    const send = await screen.findByTestId('signin-screen-send');
    const error = await screen.findByTestId('signin-screen-error');

    const unsatisfactoryEmailValue = 'hello.com';
    await userEvent.type(email, unsatisfactoryEmailValue);
    expect(email).toHaveValue(unsatisfactoryEmailValue);

    const invalidPassword = '123';
    await userEvent.type(password, invalidPassword);
    expect(password).toHaveValue(invalidPassword);

    expect(remember).toBeChecked();

    await userEvent.click(send);

    await waitFor(() => expect(isTokenExistSelector(store.getState())).toBeFalsy());

    expect(error).toHaveTextContent('Incorrect email or password, please try again.');

    const otherPassword = 'Samsung@123456';
    await userEvent.clear(password);
    await userEvent.type(password, otherPassword);
    expect(password).toHaveValue(otherPassword);
  });
});

describe('SignInWithGoogle', () => {
  const ORIG_ENV = process.env;

  beforeEach(async () => {
    jest.resetModules();
    process.env = { ...ORIG_ENV };

    dispatch(authSlice.actions.clearAuth());
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem(STORAGE_REFRESH_TOKEN_KEY);
  });

  afterEach(() => {
    process.env = ORIG_ENV;
  });
  it('should render only sign in with google', async () => {
    process.env.AUTHENTICATION_MODE = 'google';

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

    expect(await screen.findByTestId('signin-screen')).toBeInTheDocument();
  });
  it('should render sign in with google and sign in with email password', async () => {
    process.env.AUTHENTICATION_MODE = 'both';

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

    expect(await screen.findByTestId('signin-screen')).toBeInTheDocument();
  });
});
