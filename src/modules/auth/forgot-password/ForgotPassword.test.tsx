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

import ForgotPassword from 'src/modules/auth/forgot-password/ForgotPassword';
import { makeStore } from 'src/modules/store/store';
import { createTestStore } from '../../store/testing';

describe('ForgotPassword', () => {
  let store: ReturnType<typeof makeStore>;
  let history: ReturnType<typeof makeHistory>;

  beforeEach(() => {
    history = makeHistory();
    store = makeStore(history);
  });

  it('should render and redirect to forgot password confirm', async () => {
    await act(() => {
      render(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <ForgotPassword />
            </ConnectedRouter>
          </Provider>
        </ThemeProvider>
      );
    });

    expect(await screen.findByTestId('forgot-password')).toMatchSnapshot();

    const emailField = await screen.findByTestId('forgot-password-screen-email-field');
    const emailValue = 'hello@samsung.com';
    await userEvent.type(emailField, emailValue);
    expect(emailField).toHaveValue(emailValue);

    const requestButton = await screen.findByTestId('forgot-password-request-button');

    await userEvent.click(requestButton);

    expect(
      matchPath(history.location.pathname, {
        path: Path.ForgotPasswordConfirm,
        exact: true,
      })
    ).not.toBeNull();
  });

  it('[NEGATIVE] should show not found error', async () => {
    const testStore = createTestStore({
      forgotPassword: {
        error: {
          isNotFound: true,
          message: 'not found',
        },
      },
    });

    await act(() => {
      render(
        <ThemeProvider theme={theme}>
          <Provider store={testStore}>
            <ConnectedRouter history={history}>
              <ForgotPassword />
            </ConnectedRouter>
          </Provider>
        </ThemeProvider>
      );
    });

    expect(await screen.findByTestId('forgot-password')).toBeInTheDocument();
    expect(await screen.findByTestId('forgot-password-not-found-error')).toBeInTheDocument();
  });
});
