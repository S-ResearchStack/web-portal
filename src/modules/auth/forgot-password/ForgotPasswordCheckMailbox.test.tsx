import React from 'react';
import 'jest-styled-components';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import theme from 'src/styles/theme';
import { makeHistory } from 'src/modules/navigation/store';
import { ThemeProvider } from 'styled-components/';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { makeStore } from 'src/modules/store/store';
import ForgotPasswordCheckMailbox from 'src/modules/auth/forgot-password/ForgotPasswordCheckMailbox';

describe('ForgotPasswordCheckMailbox', () => {
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

  it('should render', async () => {
    const email = 'hello@samsung.com';
    mockSearch(`email=${email}`);

    await act(() => {
      render(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <ForgotPasswordCheckMailbox />
            </ConnectedRouter>
          </Provider>
        </ThemeProvider>
      );
    });

    expect(await screen.findByTestId('forgot-password-check-mailbox')).toMatchSnapshot();

    const resendButton = await screen.findByTestId('forgot-password-check-mailbox-resend');

    await userEvent.click(resendButton);
  });

  it('[NEGATIVE] should render without email', async () => {
    mockSearch(`email=`);

    const baseElement = render(
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          <ConnectedRouter history={history}>
            <ForgotPasswordCheckMailbox />
          </ConnectedRouter>
        </Provider>
      </ThemeProvider>
    );

    expect(baseElement).toBeDefined();
  });
});
