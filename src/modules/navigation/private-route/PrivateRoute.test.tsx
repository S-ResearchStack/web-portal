import '@testing-library/jest-dom';
import { act, render, screen } from '@testing-library/react';
import { ConnectedRouter } from 'connected-react-router';
import 'jest-styled-components';
import React from 'react';
import { Provider } from 'react-redux';
import { Route, Switch } from 'react-router-dom';
import { history, Path } from 'src/modules/navigation/store';
import { createTestStore } from '../../store/testing';
import TokenProtectedRoute from './TokenProtectedRoute';
import UserProtectedRoute from './UserProtectedRoute';

describe('PrivateRoute', () => {
  it('should handle authorized', async () => {
    const store = createTestStore({
      auth: {
        authToken: 'token',
      },
    });

    const { baseElement } = await render(
      <Provider store={store}>
        <ConnectedRouter history={history}>
          <UserProtectedRoute path={Path.CreateStudy}>Children</UserProtectedRoute>
        </ConnectedRouter>
      </Provider>
    );

    expect(baseElement).toMatchSnapshot();
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
              <UserProtectedRoute>Children</UserProtectedRoute>
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
              <UserProtectedRoute>Children</UserProtectedRoute>
            </Switch>
          </ConnectedRouter>
        </Provider>
      );
    });

    expect(screen.queryByText('Children')).toBeNull();
    expect(await screen.findByText('Sign in')).toBeInTheDocument();
  });
});

describe('TokenProtectedRoute', () => {
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
            <TokenProtectedRoute>Children</TokenProtectedRoute>
          </ConnectedRouter>
        </Provider>
      );
    });

    expect(await screen.findByText('Children')).toBeInTheDocument();
  });
});
