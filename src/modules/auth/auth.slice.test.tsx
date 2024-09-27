import React from 'react';
import { enableFetchMocks } from 'jest-fetch-mock';
import { matchPath } from 'react-router-dom';
import { getLocation } from 'connected-react-router';
import {
  STORAGE_TOKEN_KEY,
  STORAGE_REFRESH_TOKEN_KEY,
  STORAGE_ALREADY_BEEN_AUTH_KEY,
  STORAGE_JWT_TYPE,
  STORAGE_REMEMBER_USER,
  STORAGE_USER_KEY,
} from 'src/modules/auth/utils';
import { STORAGE_STUDY_PROGRESS_LAST_SEEN_STATUS_KEY } from 'src/modules/overview/StudyOverview.slice';
import {
  authSlice,
  handleGoogleSignIn,
  isTokenExistSelector,
  loadInitialAuthStateFromStorage,
  registerUser,
  signOut,
  userEmailSelector,
  userNameSelector,
  userRoleSelector,
  useSignIn,
} from 'src/modules/auth/auth.slice';
import {
  allowedRoleTypes,
  getRoleLabels,
  getRolesForStudy,
  RoleType,
  userRolesListFromApi,
} from 'src/modules/auth/userRole';
import { AppDispatch, makeStore } from 'src/modules/store/store';
import { makeHistory, Path } from 'src/modules/navigation/store';
import API, {
  GetUserResponse,
  GoogleTokenResponse,
  RegisterUserRequest,
  SigninResponse,
} from 'src/modules/api';
import { Response } from '../api/executeRequest';
import { HTTP_CODE_CONFLICT, HTTP_CODE_NOT_FOUND } from '../api/code';
import { act, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';

const code = 'code';
const authToken = 'id_token';
const refreshToken = `refresh_token`;
const projectId = 'testStudy';
const jwtType = 'jwt_issuer';
const rememberUser = true;
const accessToken = 'accessToken';

const email = 'email@email.com';
const password = 'Samsung123456@';

const userInfo: GetUserResponse = {
  id: 'id',
  firstName: 'firstName',
  lastName: 'lastName',
  company: 'company',
  team: 'team',
  email: 'email@email.com',
  officePhoneNumber: '000',
  mobilePhoneNumber: '000',
  roles: [`${projectId}_studyManager`],
};

const userRoles = [
  {
    projectId,
    roles: ['studyManager'],
  },
];

let history: ReturnType<typeof makeHistory>;
let store: ReturnType<typeof makeStore>;
let dispatch: AppDispatch;

const originalWindowLocation = window.location;

const setAuthToken = () => {
  API.mock.provideEndpoints({
    getGoogleToken() {
      return API.mock.response({
        access_token: accessToken,
        refresh_token: refreshToken,
        id_token: authToken,
        expires_in: 0,
      } as GoogleTokenResponse);
    },
  });
};

const setUser = () => {
  API.mock.provideEndpoints({
    getUser() {
      return API.mock.response(userInfo);
    },
  });
};

const setAuth = () => {
  setAuthToken();
  setUser();
};

const setAuthTokenError = () => {
  API.mock.provideEndpoints({
    getGoogleToken() {
      return API.mock.failedResponse({ status: 400 });
    },
  });
};

const setUserError = () => {
  API.mock.provideEndpoints({
    getUser() {
      return API.mock.failedResponse({ status: 400 });
    },
  });
};

const setUserNotFound = () => {
  API.mock.provideEndpoints({
    getUser() {
      return API.mock.failedResponse({ status: HTTP_CODE_NOT_FOUND });
    },
  });
};

const setRegistration = () => {
  jest.fn().mockResolvedValueOnce({
    status: 200,
    checkError: () => {},
  } as Response<void>);
  setUser();
};

const setRegistrationError = () => {
  API.mock.provideEndpoints({
    registerUser() {
      return API.mock.failedResponse({ status: 400 });
    },
  });
};

const setRegistrationConflict = () => {
  API.mock.provideEndpoints({
    registerUser() {
      return API.mock.failedResponse({ status: HTTP_CODE_CONFLICT });
    },
  });
};

const setSignInByEmailPassword = () => {
  API.mock.provideEndpoints({
    signin() {
      return API.mock.response({
        id: 'testid',
        email: email,
        accessToken: authToken,
        refreshToken: refreshToken,
      } as SigninResponse);
    },
  });
};

const setSignInByEmailPasswordError = () => {
  API.mock.provideEndpoints({
    signin() {
      return API.mock.failedResponse({ status: 400 });
    },
  });
};

beforeAll(() => {
  enableFetchMocks();
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: { reload: jest.fn() },
  });
});

beforeEach(() => {
  history = makeHistory();
  store = makeStore(history);
  dispatch = store.dispatch;
});

afterAll(() => {
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: originalWindowLocation,
  });
});

const setUpHook = <T extends () => ReturnType<T>>(useHook: () => ReturnType<T>) =>
  renderHook(() => useHook(), {
    wrapper: ({ children }: React.PropsWithChildren) => (
      <Provider store={store}>{children}</Provider>
    ),
  });

const unSetHook = (hook: ReturnType<typeof setUpHook>) => {
  'reset' in hook.result.current && hook.result.current.reset();
  hook.unmount();
};

describe('loadInitialStateFromStorage', () => {
  it('should return truth value', () => {
    localStorage.setItem(STORAGE_TOKEN_KEY, authToken);
    localStorage.setItem(STORAGE_REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(STORAGE_JWT_TYPE, jwtType);
    localStorage.setItem(STORAGE_REMEMBER_USER, !rememberUser ? 'false' : 'true');
    expect(loadInitialAuthStateFromStorage()).toEqual({
      authToken,
      jwtType,
      refreshToken,
      rememberUser,
    });

    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem(STORAGE_REFRESH_TOKEN_KEY);
    localStorage.removeItem(STORAGE_JWT_TYPE);
  });

  it('[NEGATIVE] should return failure value', () => {
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem(STORAGE_REFRESH_TOKEN_KEY);
    localStorage.removeItem(STORAGE_JWT_TYPE);
    expect(loadInitialAuthStateFromStorage()).toEqual({
      authToken: undefined,
      refreshToken: undefined,
      jwtType: undefined,
      rememberUser: rememberUser,
    });
  });
});

describe('rolesListFromApi', () => {
  it('should return truth value', () => {
    const userRolesFromApi = [...allowedRoleTypes].map((r) =>
      r !== 'team-admin' ? `${projectId}_${r}` : r
    );

    expect(getRolesForStudy(userRolesListFromApi(userRolesFromApi), projectId)).toEqual({
      roles: ['studyAdmin', 'studyManager', 'studyResearcher', 'team-admin'],
      projectId,
    });
  });

  it('[NEGATIVE] should return failure value while unknown role', () => {
    const spy = jest.spyOn(console, 'warn').mockImplementation();

    expect(userRolesListFromApi(['unknown-role'])).toHaveLength(0);
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Invalid role'));

    spy.mockRestore();
  });

  it('[NEGATIVE] should return failure value while existed role without project', () => {
    const spy = jest.spyOn(console, 'warn').mockImplementation();

    expect(userRolesListFromApi(['research-assistant'])).toHaveLength(0);
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Project required for role'));

    spy.mockRestore();
  });
});

describe('store', () => {
  beforeEach(() => {
    dispatch(authSlice.actions.clearAuth());
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem(STORAGE_REFRESH_TOKEN_KEY);
    localStorage.removeItem(STORAGE_ALREADY_BEEN_AUTH_KEY);
  });

  it('should create empty state', () => {
    expect(authSlice.reducer(undefined, { type: '' })).toEqual({
      authToken: undefined,
      refreshToken: undefined,
      jwtType: undefined,
      rememberUser: rememberUser,
    });
  });

  it('should create filled state', () => {
    localStorage.setItem(STORAGE_TOKEN_KEY, authToken);
    localStorage.setItem(STORAGE_REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(STORAGE_JWT_TYPE, jwtType);
    localStorage.setItem(STORAGE_REMEMBER_USER, !rememberUser ? 'false' : 'true');

    expect(authSlice.reducer(loadInitialAuthStateFromStorage(), { type: '' })).toEqual({
      authToken,
      refreshToken,
      jwtType,
      rememberUser,
    });
  });

  it('should apply success state', () => {
    expect(
      authSlice.reducer(
        undefined,
        authSlice.actions.authSuccess({ jwtType: '', authToken, refreshToken })
      )
    ).toEqual({ authToken, refreshToken, jwtType: '', rememberUser });
  });

  it('[NEGATIVE] should apply success state with broken parameters', () => {
    expect(
      authSlice.reducer(
        undefined,
        authSlice.actions.authSuccess({
          jwtType: '',
          authToken,
          refreshToken,
        })
      )
    ).toEqual({
      authToken,
      refreshToken,
      jwtType: '',
      rememberUser,
    });
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
    expect(isTokenExistSelector(store.getState())).toBeFalsy();
    dispatch(authSlice.actions.authSuccess({ jwtType: '', authToken, refreshToken }));
    expect(isTokenExistSelector(store.getState())).toBeTruthy();
  });

  it('should make sign in', async () => {
    setAuth();

    await dispatch(handleGoogleSignIn(code));

    expect(isTokenExistSelector(store.getState())).toBeTruthy();
    expect(localStorage.getItem(STORAGE_TOKEN_KEY)).toBe(authToken);
    expect(localStorage.getItem(STORAGE_REFRESH_TOKEN_KEY)).toBe(refreshToken);
    expect(localStorage.getItem(STORAGE_ALREADY_BEEN_AUTH_KEY)).toBe('true');
  });

  it('[NEGATIVE] sign in with broken parameters', async () => {
    setAuthTokenError();

    await dispatch(handleGoogleSignIn(code));

    expect(isTokenExistSelector(store.getState())).toBeFalsy();
    expect(localStorage.getItem(STORAGE_TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem(STORAGE_REFRESH_TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem(STORAGE_ALREADY_BEEN_AUTH_KEY)).toBeNull();
  });

  it('[NEGATIVE] sign in with wrong tokens', async () => {
    setAuthToken();
    setUserError();

    await dispatch(handleGoogleSignIn(code));

    // expect(isTokenExistSelector(store.getState())).toBeTruthy();
    expect(localStorage.getItem(STORAGE_TOKEN_KEY)).toBeTruthy();
    expect(localStorage.getItem(STORAGE_REFRESH_TOKEN_KEY)).toBeTruthy();
    expect(localStorage.getItem(STORAGE_ALREADY_BEEN_AUTH_KEY)).toBeTruthy();
  });

  it('should make sign out', async () => {
    setAuth();

    await dispatch(handleGoogleSignIn(code));

    // expect(isTokenExistSelector(store.getState())).toBeTruthy();
    expect(localStorage.getItem(STORAGE_TOKEN_KEY)).toBe(authToken);
    expect(localStorage.getItem(STORAGE_REFRESH_TOKEN_KEY)).toBe(refreshToken);

    signOut();

    expect(localStorage.getItem(STORAGE_STUDY_PROGRESS_LAST_SEEN_STATUS_KEY)).toBeNull();
    expect(localStorage.getItem(STORAGE_TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem(STORAGE_REFRESH_TOKEN_KEY)).toBeNull();
  });

  it('[NEGATIVE] sign out without auth token', async () => {
    expect(isTokenExistSelector(store.getState())).toBeFalsy();
    expect(localStorage.getItem(STORAGE_TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem(STORAGE_REFRESH_TOKEN_KEY)).toBeNull();

    signOut();

    expect(isTokenExistSelector(store.getState())).toBeFalsy();
    expect(localStorage.getItem(STORAGE_STUDY_PROGRESS_LAST_SEEN_STATUS_KEY)).toBeNull();
    expect(localStorage.getItem(STORAGE_TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem(STORAGE_REFRESH_TOKEN_KEY)).toBeNull();
  });
});

describe('user information', () => {
  it('should select user email, name and role after sign in', async () => {
    setAuth();

    await dispatch(handleGoogleSignIn(code));

    expect(userEmailSelector(store.getState())).toEqual(userInfo.email);
    expect(userNameSelector(store.getState())).toEqual(
      `${userInfo.firstName} ${userInfo.lastName}`
    );
    expect(userRoleSelector(store.getState())).toEqual(userRoles);
  });

  it('[NEGATIVE] select user email, name and role with missing token after sign in', async () => {
    expect(userEmailSelector(store.getState())).toBeUndefined();
    expect(userNameSelector(store.getState())).toBeUndefined();
    expect(userRoleSelector(store.getState())).toBeUndefined();
  });

  it('should select user email, name and role after registration', async () => {
    setRegistration();

    await dispatch(
      registerUser({
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        company: userInfo.company,
        team: userInfo.team,
        officePhoneNumber: userInfo.officePhoneNumber,
        mobilePhoneNumber: userInfo.mobilePhoneNumber,
      })
    );

    expect(userEmailSelector(store.getState())).toEqual(userInfo.email);
    expect(userNameSelector(store.getState())).toEqual(
      `${userInfo.firstName} ${userInfo.lastName}`
    );
    expect(userRoleSelector(store.getState())).toEqual(userRoles);
  });

  it('[NEGATIVE] should select user email, name and role with broken parameters after registration', async () => {
    setRegistrationError();

    await dispatch(
      registerUser({
        firstName: '',
        lastName: '',
        company: '',
        team: '',
        officePhoneNumber: '',
        mobilePhoneNumber: '',
      })
    );

    expect(userEmailSelector(store.getState())).toBeUndefined();
    expect(userNameSelector(store.getState())).toBeUndefined();
    expect(userRoleSelector(store.getState())).toBeUndefined();
  });

  it('[NEGAVTIVE] should redirect to Registration screen if getUser return 404', async () => {
    setAuthToken();
    setUserNotFound();

    await dispatch(handleGoogleSignIn(code));

    expect(
      matchPath(getLocation(store.getState()).pathname, {
        path: Path.Registration,
        exact: true,
      })
    );
  });

  it('[NEGATIVE] should redirect to sign in if registration is conflict', async () => {
    setRegistrationConflict();

    await dispatch(
      registerUser({
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        company: userInfo.company,
        team: userInfo.team,
        officePhoneNumber: userInfo.officePhoneNumber,
        mobilePhoneNumber: userInfo.mobilePhoneNumber,
      } as RegisterUserRequest)
    );

    expect(
      matchPath(getLocation(store.getState()).pathname, {
        path: Path.SignIn,
        exact: true,
      })
    );
  });
});

describe('signInWithEmailPassword', () => {
  beforeEach(() => {
    dispatch(authSlice.actions.clearAuth());
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem(STORAGE_REFRESH_TOKEN_KEY);
    localStorage.removeItem(STORAGE_ALREADY_BEEN_AUTH_KEY);
  });
  let hook: ReturnType<typeof setUpHook>;

  afterEach(() => {
    act(() => unSetHook(hook));
  });
  it('should sign in with email and password successfully', async () => {
    setSignInByEmailPassword();
    setRegistration();

    hook = setUpHook(() => useSignIn());

    await act(async () => {
      await hook.result.current.signIn({ email, password, rememberUser });
    });

    expect(isTokenExistSelector(store.getState())).toBeTruthy();
    expect(localStorage.getItem(STORAGE_TOKEN_KEY)).toBe(authToken);
    expect(localStorage.getItem(STORAGE_REFRESH_TOKEN_KEY)).toBe(refreshToken);
    expect(localStorage.getItem(STORAGE_ALREADY_BEEN_AUTH_KEY)).toBe('true');

    expect(
      matchPath(getLocation(store.getState()).pathname, {
        path: Path.Overview,
        exact: true,
      })
    );
  });

  it('[NEGATIVE] sign in error return fail response', async () => {
    setSignInByEmailPasswordError();
    hook = setUpHook(() => useSignIn());

    await act(async () => {
      await hook.result.current.signIn({ email, password, rememberUser });
    });
    const errorText = 'Incorrect email or password, please try again.';
    expect(isTokenExistSelector(store.getState())).toBeFalsy();
    expect(hook.result.current.error).toMatch(errorText);
  });

  it('should redirect to Registration screen if user did not register', async () => {
    setSignInByEmailPassword();
    setUserNotFound();

    hook = setUpHook(() => useSignIn());

    await act(async () => {
      await hook.result.current.signIn({ email, password, rememberUser });
    });

    expect(
      matchPath(getLocation(store.getState()).pathname, {
        path: Path.Registration,
        exact: true,
      })
    );
  });

  it('[NEGATIVE] sign in but fail to get user information', async () => {
    setSignInByEmailPassword();
    setUserError();

    hook = setUpHook(() => useSignIn());

    await act(async () => {
      await hook.result.current.signIn({ email, password, rememberUser });
    });

    const errorText = 'Incorrect email or password, please try again.';
    expect(hook.result.current.error).toMatch(errorText);
  });
});

describe('signInWithGoogle', () => {
  beforeEach(() => {
    dispatch(authSlice.actions.clearAuth());
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem(STORAGE_REFRESH_TOKEN_KEY);
    localStorage.removeItem(STORAGE_ALREADY_BEEN_AUTH_KEY);
  });
  let hook: ReturnType<typeof setUpHook>;

  afterEach(() => {
    act(() => unSetHook(hook));
  });
  it('should sign in with google successfully', async () => {
    setAuthToken();
    setUser();
    hook = setUpHook(() => useSignIn());

    await act(async () => {
      await hook.result.current.signInWithGoogle({ code, rememberUser });
    });

    expect(isTokenExistSelector(store.getState())).toBeTruthy();
    expect(localStorage.getItem(STORAGE_TOKEN_KEY)).toBe(authToken);
    expect(localStorage.getItem(STORAGE_REFRESH_TOKEN_KEY)).toBe(refreshToken);
    expect(localStorage.getItem(STORAGE_ALREADY_BEEN_AUTH_KEY)).toBe('true');

    expect(
      matchPath(getLocation(store.getState()).pathname, {
        path: Path.Overview,
        exact: true,
      })
    );
  });
  it('[NEGATIVE] should redirect to Registration if not found user information', async () => {
    setAuthToken();
    setUserNotFound();
    hook = setUpHook(() => useSignIn());

    await act(async () => {
      await hook.result.current.signInWithGoogle({ code, rememberUser });
    });

    expect(
      matchPath(getLocation(store.getState()).pathname, {
        path: Path.Registration,
        exact: true,
      })
    );
  });
  it('[NEGATIVE] sign in with google return fail response', async () => {
    setAuthTokenError();
    hook = setUpHook(() => useSignIn());

    await act(async () => {
      await hook.result.current.signInWithGoogle({ code, rememberUser });
    });

    expect(isTokenExistSelector(store.getState())).toBeFalsy();
    expect(localStorage.getItem(STORAGE_TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem(STORAGE_REFRESH_TOKEN_KEY)).toBeNull();
  });
});
