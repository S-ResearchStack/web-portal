import { getLocation } from 'connected-react-router';
import { matchPath } from 'react-router-dom';

import {
  activateAccount,
  authSlice,
  authTokenPayloadSelector,
  decodeAuthToken,
  getStateFromAuthToken,
  isAuthorizedSelector,
  loadInitialStateFromStorage,
  signin,
  signout,
  STORAGE_TOKEN_KEY,
  userNameSelector,
  userRoleSelector,
} from 'src/modules/auth/auth.slice';
import { allowedRoleTypes, rolesListFromApi } from 'src/modules/auth/userRole';
import { AppDispatch, store } from 'src/modules/store/store';
import { Path } from 'src/modules/navigation/store';
import { currentSnackbarSelector, hideSnackbar } from 'src/modules/snackbar/snackbar.slice';

// eslint-disable-next-line prefer-destructuring
const dispatch: AppDispatch = store.dispatch;
const authToken =
  'e30=.eyJlbWFpbCI6InVzZXJuYW1lQHNhbXN1bmcuY29tIiwicm9sZXMiOlsidGVhbS1hZG1pbiJdfQ==';
const userInfo = { email: 'username@samsung.com', password: 'any', roles: ['team-admin'] };
const projectId = 'project-id';

describe('decodeAuthToken', () => {
  it('should return truth value', () => {
    expect(decodeAuthToken(authToken)).toEqual({
      email: userInfo.email,
      roles: userInfo.roles,
    });
  });
});

describe('loadInitialStateFromStorage', () => {
  it('should return truth value', () => {
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    expect(loadInitialStateFromStorage()).toEqual({ authToken: undefined });

    localStorage.setItem(STORAGE_TOKEN_KEY, authToken);
    expect(loadInitialStateFromStorage()).toEqual({ authToken });

    localStorage.removeItem(STORAGE_TOKEN_KEY);
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

    const spy = jest.spyOn(console, 'warn').mockImplementation();

    expect(rolesListFromApi(['unknown-role'])).toHaveLength(0);
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Invalid role'));

    expect(rolesListFromApi(['researcher'])).toHaveLength(0);
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Project required for role'));

    spy.mockRestore();
  });
});

describe('getStateFromAuthToken', () => {
  it('should return truth value', () => {
    expect(getStateFromAuthToken(authToken)).toEqual({
      authToken,
      userRoles: rolesListFromApi(userInfo.roles),
      username: userInfo.email,
    });
  });
});

describe('store', () => {
  beforeEach(() => {
    dispatch(authSlice.actions.clearAuth());
    localStorage.removeItem(STORAGE_TOKEN_KEY);
  });

  it('should create empty state', () => {
    expect(authSlice.reducer(undefined, { type: '' })).toEqual({
      authToken: undefined,
    });
  });

  it('should create filled state', () => {
    localStorage.setItem(STORAGE_TOKEN_KEY, authToken);

    expect(authSlice.reducer(loadInitialStateFromStorage(), { type: '' })).toEqual({
      authToken,
    });
  });

  it('should apply success state', () => {
    expect(authSlice.reducer(undefined, authSlice.actions.authSuccess({ authToken }))).toEqual(
      getStateFromAuthToken(authToken)
    );
  });

  it('should clear state', () => {
    const emptyState = authSlice.reducer({ authToken }, { type: '' });

    expect(emptyState).toEqual({ authToken });

    expect(authSlice.reducer(emptyState, authSlice.actions.clearAuth())).toEqual({
      authToken: undefined,
    });
  });

  it('should check authorized state', () => {
    expect(isAuthorizedSelector(store.getState())).toBeFalsy();
    dispatch(authSlice.actions.authSuccess({ authToken }));
    expect(isAuthorizedSelector(store.getState())).toBeTruthy();
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
    expect(
      matchPath(getLocation(store.getState()).pathname, {
        path: Path.Root,
        exact: true,
      })
    ).not.toBeNull();
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

    dispatch(signout());

    expect(isAuthorizedSelector(store.getState())).toBeFalsy();
    expect(localStorage.getItem(STORAGE_TOKEN_KEY)).toBeNull();
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

  it('should activate account with failure', async () => {
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
});
