import React from 'react';
import 'jest-styled-components';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import theme from 'src/styles/theme';
import { makeHistory, Path } from 'src/modules/navigation/store';
import { ThemeProvider } from 'styled-components/';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { matchPath } from 'react-router-dom';

import ResetPassword from 'src/modules/auth/forgot-password/ResetPassword';
import { makeStore } from 'src/modules/store/store';

describe('ResetPassword', () => {
  let store: ReturnType<typeof makeStore>;
  let history: ReturnType<typeof makeHistory>;

  beforeEach(() => {
    history = makeHistory();
    store = makeStore(history);
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

  it('should reset password', async () => {
    const email = 'hello@samsung.com';
    mockSearch(`email=${email}&reset-token=123`);

    await act(() => {
      render(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <ResetPassword />
            </ConnectedRouter>
          </Provider>
        </ThemeProvider>
      );
    });

    expect(await screen.findByTestId('reset-password')).toMatchSnapshot();

    const passwordField = await screen.findByTestId('reset-rassword-screen-password-field');
    const passwordValue = 'Password123456789!';
    await userEvent.type(passwordField, passwordValue);
    expect(passwordField).toHaveValue(passwordValue);

    const resetPasswordButton = await screen.findByTestId('reset-password-button');

    await userEvent.click(resetPasswordButton);

    expect(
      matchPath(history.location.pathname, {
        path: Path.ResetPasswordComplete,
        exact: true,
      })
    ).not.toBeNull();
  });

  it('[NEGATIVE] should prevent click if data is broken', async () => {
    mockSearch(`email=&reset-token=`);

    await act(() => {
      render(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <ResetPassword />
            </ConnectedRouter>
          </Provider>
        </ThemeProvider>
      );
    });

    expect(await screen.findByTestId('reset-password')).toBeInTheDocument();

    const passwordField = await screen.findByTestId('reset-rassword-screen-password-field');
    const passwordValue = 'Password123456789!';
    await userEvent.type(passwordField, passwordValue);
    expect(passwordField).toHaveValue(passwordValue);

    const resetPasswordButton = await screen.findByTestId('reset-password-button');

    expect(resetPasswordButton).toBeDisabled();
  });
});
