import { getLocation } from 'connected-react-router';
import { matchPath } from 'react-router-dom';
import React from 'react';
import { Provider } from 'react-redux';
import { act, renderHook, waitFor } from '@testing-library/react';
import { enableFetchMocks } from 'jest-fetch-mock';

import {
  decodeAuthToken,
  STORAGE_TOKEN_KEY,
  STORAGE_REFRESH_TOKEN_KEY,
} from 'src/modules/auth/utils';
import { signout } from 'src/modules/auth/auth.slice.signout';
import {
  activateAccount,
  authSlice,
  getStateFromAuthToken,
  isAuthorizedSelector,
  loadInitialStateFromStorage,
  resendVerificationEmail,
  signin,
  SUCCESS_CONFIRMATION_MESSAGE,
  userNameSelector,
  useSignUp,
  useVerifyEmail,
} from 'src/modules/auth/auth.slice';
import { allowedRoleTypes, rolesListFromApi } from 'src/modules/auth/userRole';
import { AppDispatch, makeStore } from 'src/modules/store/store';
import { makeHistory, Path } from 'src/modules/navigation/store';
import { currentSnackbarSelector, hideSnackbar } from 'src/modules/snackbar/snackbar.slice';
import { authTokenPayloadSelector } from 'src/modules/auth/auth.slice.authTokenPayloadSelector';
import { userRoleSelector } from 'src/modules/auth/auth.slice.userRoleSelector';
import { maskEndpointAsFailure } from 'src/modules/api/mock';

// eslint-disable-next-line prefer-destructuring
const authToken =
  'e30=.eyJlbWFpbCI6InVzZXJuYW1lQHNhbXN1bmcuY29tIiwicm9sZXMiOlsidGVhbS1hZG1pbiJdfQ==';
const wrongPassword = 'wrongpwd';
const refreshToken = `refresh.${authToken}`;
const userInfo = { email: 'username@samsung.com', testPassword: 'any', roles: ['team-admin'] };
const projectId = 'project-id';

let history: ReturnType<typeof makeHistory>;
let store: ReturnType<typeof makeStore>;
let dispatch: AppDispatch;

beforeAll(() => {
  enableFetchMocks();
});

beforeEach(() => {
  history = makeHistory();
  store = makeStore(history);
  dispatch = store.dispatch;
});

describe('decodeAuthToken', () => {
  it('should return truth value', () => {
    expect(decodeAuthToken(authToken)).toEqual({
      email: userInfo.email,
      roles: userInfo.roles,
    });
  });

  it('[NEGATIVE] should call with broken parameters', () => {
    expect.assertions(1);
    try {
      decodeAuthToken('authToken');
    } catch (e) {
      expect(String(e)).toMatch(/InvalidTokenError/);
    }
  });
});

describe('loadInitialStateFromStorage', () => {
  it('should return truth value', () => {
    localStorage.setItem(STORAGE_TOKEN_KEY, authToken);
    localStorage.setItem(STORAGE_REFRESH_TOKEN_KEY, refreshToken);
    expect(loadInitialStateFromStorage()).toEqual({ authToken, refreshToken });

    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem(STORAGE_REFRESH_TOKEN_KEY);
  });

  it('[NEGATIVE] should return failure value', () => {
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem(STORAGE_REFRESH_TOKEN_KEY);
    expect(loadInitialStateFromStorage()).toEqual({
      authToken: undefined,
      refreshToken: undefined,
    });
  });
});

describe('rolesListFromApi', () => {
  it('should return truth value', () => {
    const userRolesFromApi = [...allowedRoleTypes].map((r) =>
      r !== 'team-admin' ? `${projectId}:${r}` : r
    );

    expect(rolesListFromApi(userRolesFromApi)).toEqual([
      { role: 'team-admin', projectId: undefined },
      { role: 'researcher', projectId: 'project-id' },
      { role: 'project-owner', projectId: 'project-id' },
    ]);
  });

  it('[NEGATIVE] should return failure value while unknown role', () => {
    const spy = jest.spyOn(console, 'warn').mockImplementation();

    expect(rolesListFromApi(['unknown-role'])).toHaveLength(0);
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Invalid role'));

    spy.mockRestore();
  });

  it('[NEGATIVE] should return failure value while existed role without project', () => {
    const spy = jest.spyOn(console, 'warn').mockImplementation();

    expect(rolesListFromApi(['researcher'])).toHaveLength(0);
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Project required for role'));

    spy.mockRestore();
  });
});

describe('getStateFromAuthToken', () => {
  it('should return truth value', () => {
    expect({ ...getStateFromAuthToken(authToken), refreshToken }).toEqual({
      authToken,
      refreshToken,
      userRoles: rolesListFromApi(userInfo.roles),
      username: userInfo.email,
    });
  });

  it('[NEGATIVE] should return value with broken parameters', () => {
    expect({ ...getStateFromAuthToken('authToken'), refreshToken: 'refreshToken' }).toEqual({
      refreshToken: 'refreshToken',
    });
  });
});

describe('store', () => {
  beforeEach(() => {
    dispatch(authSlice.actions.clearAuth());
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem(STORAGE_REFRESH_TOKEN_KEY);
  });

  it('should create empty state', () => {
    expect(authSlice.reducer(undefined, { type: '' })).toEqual({
      authToken: undefined,
      refreshToken: undefined,
    });
  });

  it('should create filled state', () => {
    localStorage.setItem(STORAGE_TOKEN_KEY, authToken);
    localStorage.setItem(STORAGE_REFRESH_TOKEN_KEY, refreshToken);

    expect(authSlice.reducer(loadInitialStateFromStorage(), { type: '' })).toEqual({
      authToken,
      refreshToken,
    });
  });

  it('[NEGATIVE] should create filled state with broken auth token', () => {
    localStorage.setItem(STORAGE_TOKEN_KEY, 'authToken');
    localStorage.setItem(STORAGE_REFRESH_TOKEN_KEY, 'refreshToken');

    expect(authSlice.reducer(loadInitialStateFromStorage(), { type: '' })).toEqual({
      authToken: 'authToken',
      refreshToken: 'refreshToken',
    });
  });

  it('should apply success state', () => {
    expect(
      authSlice.reducer(undefined, authSlice.actions.authSuccess({ authToken, refreshToken }))
    ).toEqual({ ...getStateFromAuthToken(authToken), refreshToken });
  });

  it('[NEGATIVE] should apply success state with broken parameters', () => {
    expect(
      authSlice.reducer(
        undefined,
        authSlice.actions.authSuccess({ authToken: 'authToken', refreshToken: 'refreshToken' })
      )
    ).toEqual({ authToken: getStateFromAuthToken('authToken'), refreshToken: 'refreshToken' });
  });

  it('should clear state', () => {
    const emptyState = authSlice.reducer({ authToken, refreshToken }, { type: '' });

    expect(emptyState).toEqual({ authToken, refreshToken });

    expect(authSlice.reducer(emptyState, authSlice.actions.clearAuth())).toEqual({
      authToken: undefined,
      refreshToken: undefined,
    });
  });

  it('should check authorized state', () => {
    expect(isAuthorizedSelector(store.getState())).toBeFalsy();
    dispatch(authSlice.actions.authSuccess({ authToken, refreshToken }));
    expect(isAuthorizedSelector(store.getState())).toBeTruthy();
  });

  it('[NEGATIVE] should check authorized state with broken token', () => {
    expect(isAuthorizedSelector(store.getState())).toBeFalsy();
    dispatch(
      authSlice.actions.authSuccess({ authToken: 'authToken', refreshToken: 'refreshToken' })
    );
    expect(isAuthorizedSelector(store.getState())).toBeFalsy();
  });

  it('should make sign in without remember', async () => {
    await dispatch(
      signin({
        email: userInfo.email,
        password: userInfo.testPassword,
      })
    );

    expect(isAuthorizedSelector(store.getState())).toBeTruthy();
    expect(localStorage.getItem(STORAGE_TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem(STORAGE_REFRESH_TOKEN_KEY)).toBeNull();
    expect(
      matchPath(getLocation(store.getState()).pathname, {
        path: Path.Root,
        exact: true,
      })
    ).not.toBeNull();
  });

  it('[NEGATIVE] should make sign in without remember and with broken parameters', async () => {
    expect.assertions(3);
    try {
      await dispatch(
        signin({
          email: 'userInfo.email',
          password: wrongPassword,
        })
      );
    } catch (e) {
      expect(String(e)).toMatch(/Status\scode\s401/);
      expect(localStorage.getItem(STORAGE_TOKEN_KEY)).toBeNull();
      expect(localStorage.getItem(STORAGE_REFRESH_TOKEN_KEY)).toBeNull();
    }
  });

  it('should make sign in with remember', async () => {
    await dispatch(
      signin({
        email: userInfo.email,
        password: userInfo.testPassword,
        rememberUser: true,
      })
    );

    expect(isAuthorizedSelector(store.getState())).toBeTruthy();
    expect(localStorage.getItem(STORAGE_TOKEN_KEY)).toBe(authToken);
    expect(localStorage.getItem(STORAGE_REFRESH_TOKEN_KEY)).toBe(refreshToken);
  });

  it('[NEGATIVE] should make sign in with remember and with broken parameters', async () => {
    expect.assertions(3);
    try {
      await dispatch(
        signin({
          email: 'userInfo.email',
          password: wrongPassword,
          rememberUser: true,
        })
      );
    } catch (e) {
      expect(String(e)).toMatch(/Status\scode\s401/);
      expect(localStorage.getItem(STORAGE_TOKEN_KEY)).toBeNull();
      expect(localStorage.getItem(STORAGE_REFRESH_TOKEN_KEY)).toBeNull();
    }
  });

  it('should make sign in with failure state', async () => {
    const pendedSignInAction = dispatch(
      signin({
        email: 'invalid@email.com',
        password: userInfo.testPassword,
        rememberUser: true,
      })
    );

    await expect(pendedSignInAction).rejects.toThrow('Status code 401');
    expect(isAuthorizedSelector(store.getState())).toBeFalsy();
  });

  it('should make sign out', async () => {
    await dispatch(
      signin({
        email: userInfo.email,
        password: userInfo.testPassword,
        rememberUser: true,
      })
    );

    expect(isAuthorizedSelector(store.getState())).toBeTruthy();
    expect(localStorage.getItem(STORAGE_TOKEN_KEY)).toBe(authToken);
    expect(localStorage.getItem(STORAGE_REFRESH_TOKEN_KEY)).toBe(refreshToken);

    dispatch(signout());

    expect(isAuthorizedSelector(store.getState())).toBeFalsy();
    expect(localStorage.getItem(STORAGE_TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem(STORAGE_REFRESH_TOKEN_KEY)).toBeNull();
  });

  it('[NEGATIVE] should make sign out without auth token', async () => {
    expect(isAuthorizedSelector(store.getState())).toBeFalsy();
    expect(localStorage.getItem(STORAGE_TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem(STORAGE_REFRESH_TOKEN_KEY)).toBeNull();

    dispatch(signout());

    expect(isAuthorizedSelector(store.getState())).toBeFalsy();
    expect(localStorage.getItem(STORAGE_TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem(STORAGE_REFRESH_TOKEN_KEY)).toBeNull();
  });

  it('should activate account', async () => {
    await dispatch(
      activateAccount({
        email: userInfo.email,
        name: userInfo.email.split('@')[0],
        password: userInfo.testPassword,
        resetToken: 'reset-token',
      })
    );

    expect(isAuthorizedSelector(store.getState())).toBeTruthy();
  });

  it('[NEGATIVE] should activate account with failure', async () => {
    await dispatch(
      activateAccount({
        email: userInfo.email,
        name: userInfo.email.split('@')[0],
        password: userInfo.testPassword,
        resetToken: '',
      })
    );

    expect(isAuthorizedSelector(store.getState())).toBeFalsy();
    expect(currentSnackbarSelector(store.getState()).text).toMatch('Failed to activate account');

    dispatch(hideSnackbar());

    await dispatch(
      activateAccount({
        email: 'invalid@email.com',
        name: userInfo.email.split('@')[0],
        password: userInfo.testPassword,
        resetToken: 'reset-token',
      })
    );

    expect(isAuthorizedSelector(store.getState())).toBeFalsy();
    expect(currentSnackbarSelector(store.getState()).text).toMatch('Failed to activate account');

    dispatch(hideSnackbar());
  });

  it('should select payload of authorize token', async () => {
    await dispatch(
      signin({
        email: userInfo.email,
        password: userInfo.testPassword,
      })
    );

    expect(authTokenPayloadSelector(store.getState())).toEqual({
      email: userInfo.email,
      roles: [{ role: 'team-admin', projectId: undefined }],
    });
  });

  it('[NEGATIVE] should select payload of authorize token with missing token', async () => {
    expect(authTokenPayloadSelector(store.getState())).toEqual({});
  });

  it('should select user name and role', async () => {
    await dispatch(
      signin({
        email: userInfo.email,
        password: userInfo.testPassword,
      })
    );

    expect(userNameSelector(store.getState())).toEqual(userInfo.email.split('@')[0]);
    expect(userRoleSelector(store.getState())).toEqual({
      role: 'team-admin',
      projectId: undefined,
    });
  });

  it('[NEGATIVE] should select user name and role with missing token', async () => {
    expect(userNameSelector(store.getState())).toBeUndefined();
    expect(userRoleSelector(store.getState())).toBeUndefined();
  });
});

describe('useSignUp', () => {
  const setUpHook = () =>
    renderHook(() => useSignUp(), {
      wrapper: ({ children }: React.PropsWithChildren<unknown>) => (
        <Provider store={store}>{children}</Provider>
      ),
    });

  const unSetHook = (hook: ReturnType<typeof setUpHook>) => {
    hook.unmount();
  };

  let hook: ReturnType<typeof setUpHook>;

  beforeEach(() => {
    localStorage.setItem('API_URL', 'https://samsung.com/');
  });

  afterEach(() => {
    act(() => unSetHook(hook));
  });

  it('should send a credentials', async () => {
    hook = setUpHook();

    expect(hook.result.current.isLoading).toBeFalsy();
    expect(hook.result.current.error).toBeUndefined();

    act(() => {
      hook.result.current.signUp({
        email: 'example@samsung.com',
        password: userInfo.testPassword,
        profile: {
          name: 'UserName',
        },
      });
    });

    expect(hook.result.current).toMatchObject({
      isLoading: true,
    });

    await waitFor(() => expect(hook.result.current.isLoading).toBeFalsy());
    await waitFor(() => expect(hook.result.current.error).toBeFalsy());

    expect(hook.result.current.error).toBeUndefined();
  });

  it('[NEGATIVE] should send credentials with an error', async () => {
    hook = setUpHook();

    expect(hook.result.current.isLoading).toBeFalsy();
    expect(hook.result.current.error).toBeUndefined();

    await act(async () => {
      await maskEndpointAsFailure('signUp', async () => {
        await hook.result.current.signUp({
          email: 'example@samsung.com',
          password: userInfo.testPassword,
          profile: {
            name: 'UserName',
          },
        });
      });
    });

    expect(hook.result.current.isLoading).toBeFalsy();
    expect(hook.result.current.error).not.toBeUndefined();
  });
});

describe('useVerifyEmail', () => {
  const setUpHook = (args: { token: string }) =>
    renderHook(
      (etchArgs: { token: string }) =>
        useVerifyEmail({
          fetchArgs: etchArgs || args,
        }),
      {
        wrapper: ({ children }: React.PropsWithChildren<unknown>) => (
          <Provider store={store}>{children}</Provider>
        ),
      }
    );

  const unSetHook = (hook: ReturnType<typeof setUpHook>) => {
    hook.unmount();
  };

  let hook: ReturnType<typeof setUpHook>;

  beforeEach(() => {
    localStorage.setItem('API_URL', 'https://samsung.com/');
  });

  afterEach(() => {
    act(() => unSetHook(hook));
  });

  it('should verify email', async () => {
    hook = setUpHook({
      token: 'token',
    });

    expect(hook.result.current).toMatchObject({
      isLoading: true,
    });

    await waitFor(() => expect(hook.result.current.isLoading).toBeFalsy());

    expect(hook.result.current.error).toBeUndefined();
  });

  it('[NEGATIVE] should verify email with an error', async () => {
    hook = setUpHook({
      token: 'token',
    });

    await act(async () => {
      await maskEndpointAsFailure('verifyEmail', async () => {
        await hook.result.current.fetch({
          token: 'token1',
        });
      });
    });

    await waitFor(() => expect(hook.result.current.isLoading).toBeFalsy());

    expect(hook.result.current.error).not.toBeUndefined();
  });
});

describe('resendVerificationEmail', () => {
  it('should send request', async () => {
    await dispatch(resendVerificationEmail({ email: 'example@samsung.com' }));

    expect(currentSnackbarSelector(store.getState())).toMatchObject({
      text: SUCCESS_CONFIRMATION_MESSAGE,
    });
  });

  it('[NEGATIVE] should send a request and catch an error', async () => {
    const failureMessage = 'failed';

    await maskEndpointAsFailure(
      'resendVerification',
      async () => {
        await dispatch(resendVerificationEmail({ email: 'example@samsung.com' }));
      },
      { message: failureMessage }
    );

    expect(currentSnackbarSelector(store.getState())).toMatchObject({
      text: `Error: ${failureMessage}`,
    });
  });
});
