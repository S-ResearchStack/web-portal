import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import userEvent from '@testing-library/user-event';
import 'jest-styled-components';

import theme from 'src/styles/theme';
import { makeStore } from 'src/modules/store/store';
import { makeHistory } from 'src/modules/navigation/store';
import CheckMailbox from 'src/modules/auth/signup/CheckMailbox';
import { currentSnackbarSelector } from 'src/modules/snackbar/snackbar.slice';
import { SUCCESS_CONFIRMATION_MESSAGE } from 'src/modules/auth/auth.slice';
import { enableFetchMocks } from 'jest-fetch-mock';

beforeAll(() => {
  enableFetchMocks();
});

describe('CheckMailbox', () => {
  let store: ReturnType<typeof makeStore>;
  let history: ReturnType<typeof makeHistory>;

  beforeEach(() => {
    history = makeHistory();
    store = makeStore(history);
    localStorage.setItem('API_URL', 'https://samsung.com/');
  });

  it('should render', async () => {
    const { baseElement } = render(
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          <ConnectedRouter history={history}>
            <CheckMailbox />
          </ConnectedRouter>
        </Provider>
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    const resend = await screen.findByTestId('signup-check-mailbox-resend');
    expect(resend).not.toBeNull();
    await userEvent.click(resend);

    await waitFor(() =>
      expect(currentSnackbarSelector(store.getState())).toMatchObject({
        text: SUCCESS_CONFIRMATION_MESSAGE,
      })
    );
  });
});
