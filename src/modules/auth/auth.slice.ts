import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { push } from 'connected-react-router';
import jwtDecode from 'jwt-decode';
import API, { SigninResponse } from 'src/modules/api';
import applyDefaultApiErrorHandlers from 'src/modules/api/applyDefaultApiErrorHandlers';
import { Path } from 'src/modules/navigation/store';
import { showSnackbar } from 'src/modules/snackbar/snackbar.slice';
import { AppThunk, RootState } from 'src/modules/store';
import {
  mockStudyIds,
  selectedStudyIdSelector,
  studiesSlice,
} from 'src/modules/studies/studies.slice';
import {
  getRoleForStudy,
  rolesListFromApi,
  roleToApi,
  isGlobalRoleType,
  allowedRoleTypes,
} from './userRole';

export const STORAGE_TOKEN_KEY = 'auth_token';

const isValidEmail = (v: string) => v.includes('samsung');

type AuthTokenPayload = {
  email: string;
  roles: string[];
};

export const decodeAuthToken = (jwt: string): AuthTokenPayload => jwtDecode<AuthTokenPayload>(jwt);

API.mock.provideEndpoints({
  signin({ email }) {
    if (isValidEmail(email)) {
      let roles = ['team-admin'];

      const roleFromEmail = allowedRoleTypes.find((r) => email.includes(r));
      if (roleFromEmail) {
        roles = isGlobalRoleType(roleFromEmail)
          ? [roleFromEmail]
          : mockStudyIds.map((projectId) => roleToApi({ role: roleFromEmail, projectId }));
      }

      const header = window.btoa(JSON.stringify({}));
      const payload = window.btoa(
        JSON.stringify({
          email,
          roles,
        })
      );
      const jwt = `${header}.${payload}`;
      return API.mock.response<SigninResponse>({
        id: email,
        jwt,
        email,
        roles,
      });
    }

    return API.mock.failedResponse({
      status: 401,
    });
  },
  resetPassword(body) {
    if (isValidEmail(body.email) && body.resetToken) {
      return API.mock.response(undefined);
    }

    return API.mock.failedResponse({
      status: 401,
    });
  },
});

interface AuthState {
  authToken?: string;
}

export const getStateFromAuthToken = (authToken: string) => {
  const { roles, email } = decodeAuthToken(authToken);
  return {
    authToken,
    userRoles: rolesListFromApi(roles),
    username: email,
  };
};

export const loadInitialStateFromStorage = (): AuthState => {
  const authToken = localStorage.getItem(STORAGE_TOKEN_KEY) || undefined;

  return { authToken };
};

const initialState: AuthState = {
  ...loadInitialStateFromStorage(),
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authSuccess(_, { payload }: PayloadAction<{ authToken: string }>) {
      return getStateFromAuthToken(payload.authToken);
    },
    clearAuth(state) {
      state.authToken = undefined;
    },
  },
});

const { authSuccess, clearAuth } = authSlice.actions;

export const authTokenPayloadSelector = createSelector(
  (state: RootState) => state.auth.authToken,
  (authToken) => {
    if (!authToken) {
      return {};
    }

    try {
      const { email, roles } = decodeAuthToken(authToken);
      return {
        email,
        roles: rolesListFromApi(roles),
      };
    } catch (err) {
      console.error(`Failed to decode jwt ${err}`);

      // TODO: better way to sign out?
      // we can use dispatch from store directly, but for now it's fine as is
      localStorage.removeItem(STORAGE_TOKEN_KEY);
      window.location.reload();

      return {};
    }
  }
);

export const signout = (): AppThunk => (dispatch) => {
  localStorage.removeItem(STORAGE_TOKEN_KEY);
  dispatch(clearAuth());
  dispatch(studiesSlice.actions.reset());
};

export const signin =
  ({
    email,
    password,
    rememberUser,
  }: {
    email: string;
    password: string;
    rememberUser?: boolean;
  }): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    const res = await API.signin({ email, password });
    const { jwt: authToken } = res.data;

    const isFirstTime = false; // TODO: need to have API or make it defined somehow

    if (rememberUser) {
      localStorage.setItem(STORAGE_TOKEN_KEY, authToken);
    } else {
      localStorage.removeItem(STORAGE_TOKEN_KEY);
    }

    dispatch(authSuccess({ authToken }));

    const tokenPayload = authTokenPayloadSelector(getState());

    if (tokenPayload.roles?.some((r) => r.role === 'team-admin') && isFirstTime) {
      dispatch(push(Path.CreateStudy));
    } else {
      dispatch(push(Path.Root));
    }
  };

export const activateAccount =
  ({
    email,
    name,
    password,
    resetToken,
  }: {
    email: string;
    name: string;
    password: string;
    resetToken: string;
  }): AppThunk<Promise<void>> =>
  async (dispatch) => {
    try {
      const res = await API.resetPassword({
        email,
        password,
        resetToken,
        profile: {
          name,
          status: 'active',
        },
      });
      res.checkError();

      await dispatch(signin({ email, password, rememberUser: true }));
    } catch (err) {
      if (!applyDefaultApiErrorHandlers(err, dispatch)) {
        dispatch(showSnackbar({ text: 'Failed to activate account' }));
      }
    }
  };

export const isAuthorizedSelector = (state: RootState) => !!state.auth.authToken;

export const userNameSelector = createSelector(
  authTokenPayloadSelector,
  (pl) => pl?.email?.split('@')[0] || pl?.email
);

export const userRoleSelector = createSelector(
  [authTokenPayloadSelector, selectedStudyIdSelector],
  (pl, selectedStudyId) => getRoleForStudy(pl.roles || [], selectedStudyId)
);

export default authSlice.reducer;
