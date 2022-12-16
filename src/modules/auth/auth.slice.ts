import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { push } from 'connected-react-router';

import API, { SigninResponse } from 'src/modules/api';
import applyDefaultApiErrorHandlers from 'src/modules/api/applyDefaultApiErrorHandlers';
import { Path } from 'src/modules/navigation/store';
import { showSnackbar } from 'src/modules/snackbar/snackbar.slice';
import { AppThunk, RootState } from 'src/modules/store';
import { mockStudyIds } from 'src/modules/studies/studies.slice.mock';

import { authTokenPayloadSelector } from './auth.slice.authTokenPayloadSelector';
import { rolesListFromApi, roleToApi, isGlobalRoleType, allowedRoleTypes } from './userRole';
import { decodeAuthToken, STORAGE_TOKEN_KEY, STORAGE_REFRESH_TOKEN_KEY } from './utils';

const isValidEmail = (v: string) => v.includes('samsung');

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
        refreshToken: `refresh.${jwt}`,
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
  refreshToken(req) {
    const appendUpdated = (token: string) => [token, 'updated'].join('_');

    return API.mock.response({
      jwt: req.jwt,
      refreshToken: appendUpdated(req.refreshToken),
    });
  },
});

interface AuthState {
  authToken?: string;
  refreshToken?: string;
}

export const getStateFromAuthToken = (authToken: string) => {
  try {
    const { roles, email } = decodeAuthToken(authToken);
    return {
      authToken,
      userRoles: rolesListFromApi(roles),
      username: email,
    };
  } catch {
    return undefined;
  }
};

export const loadInitialStateFromStorage = (): AuthState => {
  const authToken = localStorage.getItem(STORAGE_TOKEN_KEY) || undefined;
  const refreshToken = localStorage.getItem(STORAGE_REFRESH_TOKEN_KEY) || undefined;

  return { authToken, refreshToken };
};

const initialState: AuthState = {
  ...loadInitialStateFromStorage(),
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authSuccess(_, { payload }: PayloadAction<{ authToken: string; refreshToken: string }>) {
      return { ...getStateFromAuthToken(payload.authToken), refreshToken: payload.refreshToken };
    },
    clearAuth(state) {
      state.authToken = undefined;
      state.refreshToken = undefined;
    },
  },
});

export const { authSuccess, clearAuth } = authSlice.actions;

const handleTokensReceived =
  (authToken: string, refreshToken: string, rememberUser?: boolean): AppThunk<Promise<void>> =>
  async (dispatch) => {
    if (rememberUser) {
      localStorage.setItem(STORAGE_TOKEN_KEY, authToken);
      localStorage.setItem(STORAGE_REFRESH_TOKEN_KEY, refreshToken);
    } else {
      localStorage.removeItem(STORAGE_TOKEN_KEY);
      localStorage.removeItem(STORAGE_REFRESH_TOKEN_KEY);
    }

    dispatch(authSuccess({ authToken, refreshToken }));
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
    const { jwt, refreshToken } = res.data;

    dispatch(handleTokensReceived(jwt, refreshToken, rememberUser));

    const tokenPayload = authTokenPayloadSelector(getState());
    const isFirstTime = false; // TODO: need to have API or make it defined somehow

    if (tokenPayload.roles?.some((r: { role: string }) => r.role === 'team-admin') && isFirstTime) {
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

export const updateTokens = (): AppThunk<Promise<void>> => async (dispatch, getState) => {
  const { authToken: actualAuthToken, refreshToken: actualRefreshToken } = getState().auth;

  if (!actualAuthToken || !actualRefreshToken) {
    return;
  }

  const { jwt, refreshToken } = (
    await API.refreshToken({ jwt: actualAuthToken, refreshToken: actualRefreshToken })
  ).data;

  dispatch(handleTokensReceived(jwt, refreshToken, !!localStorage.getItem(STORAGE_TOKEN_KEY)));
};

export const isAuthorizedSelector = (state: RootState) => !!state.auth.authToken;

export const userNameSelector = createSelector(
  authTokenPayloadSelector,
  (pl) => pl?.email?.split('@')[0] || pl?.email
);

export default authSlice.reducer;
