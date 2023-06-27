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
import { makeStore } from 'src/modules/store/store';
import PasswordChanged from 'src/modules/auth/forgot-password/PasswordChanged';

describe('PasswordChanged', () => {
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

  it('should render and redirect to overview', async () => {
    const email = 'hello@samsung.com';
    mockSearch(`email=${email}`);

    await act(() => {
      render(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <PasswordChanged />
            </ConnectedRouter>
          </Provider>
        </ThemeProvider>
      );
    });

    expect(await screen.findByTestId('password-changed')).toMatchSnapshot();

    const nextButton = await screen.findByTestId('password-changed-next-button');

    await userEvent.click(nextButton);

    expect(
      matchPath(history.location.pathname, {
        path: Path.Overview,
        exact: true,
      })
    ).not.toBeNull();
  });

  it('[NEGATIVE] should render without email', async () => {
    mockSearch(`email=`);

    const baseElement = render(
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          <ConnectedRouter history={history}>
            <PasswordChanged />
          </ConnectedRouter>
        </Provider>
      </ThemeProvider>
    );

    expect(baseElement).toBeDefined();
  });
});
