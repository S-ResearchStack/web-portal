import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { Provider } from 'react-redux';
import { ConnectedRouter, getLocation } from 'connected-react-router';
import { enableFetchMocks } from 'jest-fetch-mock';
import 'jest-styled-components';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';
import { matchPath } from 'react-router-dom';
import theme from 'src/styles/theme';
import { makeStore } from 'src/modules/store/store';
import { makeHistory, Path } from 'src/modules/navigation/store';
import SignUp from 'src/modules/auth/signup/SignUp';

describe('SignUp', () => {
  let store: ReturnType<typeof makeStore>;
  let history: ReturnType<typeof makeHistory>;

  beforeAll(() => {
    enableFetchMocks();
  });

  beforeEach(async () => {
    history = makeHistory();
    store = makeStore(history);
    localStorage.setItem('API_URL', 'https://samsung.com/');

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
  });

  it('should sign up successfully', async () => {
    history.location.search = '?email=examole.com&token=123';

    const emailValue = 'email@samsung.com';
    const email = await screen.findByTestId('auth-signup-email');
    await userEvent.type(email, emailValue);
    expect(email).toHaveValue(emailValue);

    const passwordValue = 'qweQWE123!@#';
    const password = await screen.findByTestId('auth-signup-password');
    await userEvent.type(password, passwordValue);
    expect(password).toHaveValue(passwordValue);

    const radios = await screen.findAllByTestId('auth-signup-radio');
    expect(radios).toHaveLength(4);

    const create = await screen.findByTestId('auth-signup-create');
    await userEvent.click(create);

    await waitFor(() =>
      expect(
        matchPath(getLocation(store.getState()).pathname, {
          path: Path.SignIn,
        })
      ).not.toBeNull()
    );
  });

  it('[NEGATIVE] sign up with a invalid data', async () => {
    history.location.search = '?email=examole.com&token=123';

    const emailValue = 'email@samsung.com';
    const email = await screen.findByTestId('auth-signup-email');
    await userEvent.type(email, emailValue);
    expect(email).toHaveValue(emailValue);

    const passwordValue = 'pass';
    const password = await screen.findByTestId('auth-signup-password');
    await userEvent.type(password, passwordValue);
    expect(password).toHaveValue(passwordValue);

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

    expect(errorsCount).toBe(2);

    const create = await screen.findByTestId('auth-signup-create');
    expect(create).toHaveAttribute('disabled');
  });

  it('[NEGATIVE] sign up with duplicate email', async () => {
    history.location.search = '?email=examole.com&token=123';

    const emailValue = 'email@duplicate.com';
    const email = await screen.findByTestId('auth-signup-email');
    await userEvent.type(email, emailValue);
    expect(email).toHaveValue(emailValue);

    const passwordValue = 'Samsung123456@';
    const password = await screen.findByTestId('auth-signup-password');
    await userEvent.type(password, passwordValue);
    expect(password).toHaveValue(passwordValue);

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

    expect(errorsCount).toBe(0);

    const create = await screen.findByTestId('auth-signup-create');
    await userEvent.click(create);

    const errorText = await screen.findByTestId('signup-screen-error');
    expect(errorText).toHaveTextContent(
      'This email is already registered, please use another email.'
    );
  });

  it('[NEGATIVE] sign up with wrong email', async () => {
    history.location.search = '?email=examole.com&token=123';

    const emailValue = 'email@test.com';
    const email = await screen.findByTestId('auth-signup-email');
    await userEvent.type(email, emailValue);
    expect(email).toHaveValue(emailValue);

    const passwordValue = 'Samsung123456@';
    const password = await screen.findByTestId('auth-signup-password');
    await userEvent.type(password, passwordValue);
    expect(password).toHaveValue(passwordValue);

    const create = await screen.findByTestId('auth-signup-create');
    await userEvent.click(create);

    const errorText = await screen.findByTestId('signup-screen-error');
    expect(errorText).toHaveTextContent('Oops, something went wrong, please try again.');
  });
});
