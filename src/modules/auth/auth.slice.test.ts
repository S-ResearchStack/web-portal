import { getLocation } from 'connected-react-router';
import { matchPath } from 'react-router-dom';

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
  signin,
  userNameSelector,
} from 'src/modules/auth/auth.slice';
import { allowedRoleTypes, rolesListFromApi } from 'src/modules/auth/userRole';
import { AppDispatch, store } from 'src/modules/store/store';
import { Path } from 'src/modules/navigation/store';
import { currentSnackbarSelector, hideSnackbar } from 'src/modules/snackbar/snackbar.slice';
import { authTokenPayloadSelector } from 'src/modules/auth/auth.slice.authTokenPayloadSelector';
import { userRoleSelector } from 'src/modules/auth/auth.slice.userRoleSelector';

// eslint-disable-next-line prefer-destructuring
const dispatch: AppDispatch = store.dispatch;
const authToken =
  'e30=.eyJlbWFpbCI6InVzZXJuYW1lQHNhbXN1bmcuY29tIiwicm9sZXMiOlsidGVhbS1hZG1pbiJdfQ==';
const refreshToken = `refresh.${authToken}`;
const userInfo = { email: 'username@samsung.com', password: 'any', roles: ['team-admin'] };
const projectId = 'project-id';

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
        password: userInfo.password,
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
          password: 'userInfo.password',
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
        password: userInfo.password,
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
          password: 'userInfo.password',
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
        password: userInfo.password,
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
        password: userInfo.password,
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
        password: userInfo.password,
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
        password: userInfo.password,
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
        password: userInfo.password,
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
        password: userInfo.password,
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
        password: userInfo.password,
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
