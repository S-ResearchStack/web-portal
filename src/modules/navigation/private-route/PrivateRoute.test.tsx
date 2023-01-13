import React from 'react';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import { act, render, screen } from '@testing-library/react';
import { history, Path } from 'src/modules/navigation/store';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { Route, Switch } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import { createTestStore } from '../../store/testing';

describe('PrivateRoute', () => {
  it('should handle authorized', async () => {
    const store = createTestStore({
      auth: {
        authToken: 'token',
      },
    });

    await act(() => {
      render(
        <Provider store={store}>
          <ConnectedRouter history={history}>
            <PrivateRoute>Children</PrivateRoute>
          </ConnectedRouter>
        </Provider>
      );
    });

    expect(await screen.findByText('Children')).toBeInTheDocument();
  });

  it('[NEGATIVE] should handle NOT authorized', async () => {
    const store = createTestStore({
      auth: {
        authToken: '',
      },
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <ConnectedRouter history={history}>
            <Switch>
              <Route path={Path.Root}>Sign in</Route>
              <PrivateRoute>Children</PrivateRoute>
            </Switch>
          </ConnectedRouter>
        </Provider>
      );
    });

    expect(screen.queryByText('Children')).toBeNull();
    expect(await screen.findByText('Sign in')).toBeInTheDocument();
  });

  it('[NEGATIVE] should handle empty store', async () => {
    const store = createTestStore({});

    await act(() => {
      render(
        <Provider store={store}>
          <ConnectedRouter history={history}>
            <Switch>
              <Route path={Path.Root}>Sign in</Route>
              <PrivateRoute>Children</PrivateRoute>
            </Switch>
          </ConnectedRouter>
        </Provider>
      );
    });

    expect(screen.queryByText('Children')).toBeNull();
    expect(await screen.findByText('Sign in')).toBeInTheDocument();
  });
});
