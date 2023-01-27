import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { push } from 'connected-react-router';
import { useSelector } from 'react-redux';
import _isObject from 'lodash/isObject';

import API, {
  ResendVerificationEmailRequest,
  SigninResponse,
  SignUpRequest,
  VerifyEmailRequest,
} from 'src/modules/api';
import applyDefaultApiErrorHandlers from 'src/modules/api/applyDefaultApiErrorHandlers';
import { Path } from 'src/modules/navigation/store';
import { showSnackbar } from 'src/modules/snackbar/snackbar.slice';
import { mockStudyIds } from 'src/modules/studies/studies.slice.mock';
import {
  AppDispatch,
  AppThunk,
  ErrorType,
  RootState,
  useAppDispatch,
  WithLoading,
} from 'src/modules/store';
import createDataSlice from 'src/modules/store/createDataSlice';
import { SWITCH_STUDY_SEARCH_PARAM } from 'src/modules/main-layout/constants';

import { authTokenPayloadSelector } from './auth.slice.authTokenPayloadSelector';
import { rolesListFromApi, roleToApi, isGlobalRoleType, allowedRoleTypes } from './userRole';
import {
  decodeAuthToken,
  STORAGE_TOKEN_KEY,
  STORAGE_REFRESH_TOKEN_KEY,
  STORAGE_ALREADY_BEEN_AUTH_KEY,
} from './utils';

const isValidEmail = (v: string) => v.includes('samsung');

const isDuplicateEmail = (v: string) => v.includes('duplicate');

const signinSuccessMock = ({ email }: { email: string }) => {
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
    profile: {
      name: email.split('@')[0],
      status: 'active',
    },
  });
};

API.mock.provideEndpoints({
  signin({ email }) {
    if (isValidEmail(email)) {
      return signinSuccessMock({ email });
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
  signUp(body) {
    if (isDuplicateEmail(body.email)) {
      return API.mock.failedResponse({
        status: 409,
      });
    }

    return API.mock.response(undefined);
  },
  verifyEmail() {
    return signinSuccessMock({ email: 'success-verification@samsung.com' });
  },
  resendVerification() {
    return API.mock.response(undefined);
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

const signUpInitialState: WithLoading = {};

export const signUpSlice = createSlice({
  name: 'signUp',
  initialState: signUpInitialState,
  reducers: {
    signUpInit(state) {
      state.isLoading = true;
      state.error = undefined;
    },
    signUpSuccess(state) {
      state.isLoading = false;
    },
    signUpFailure(state, { payload }: PayloadAction<ErrorType>) {
      state.error = payload;
      state.isLoading = false;
    },
  },
});

export const signUpSelector = (state: RootState) => state[signUpSlice.name];

const HTTP_CODE_CONFLICT = 409;

export const signUp =
  (data: SignUpRequest): AppThunk =>
  async (dispatch) => {
    try {
      dispatch(signUpSlice.actions.signUpInit());
      const { status, checkError } = await API.signUp(data);
      let redirectPath = Path.AccountConfirm;
      if (status === HTTP_CODE_CONFLICT) {
        redirectPath = Path.SignIn;
      } else {
        checkError();
      }
      dispatch(push(`${redirectPath}?email=${encodeURIComponent(data.email)}`));
      dispatch(signUpSlice.actions.signUpSuccess());
    } catch (e) {
      dispatch(signUpSlice.actions.signUpFailure(String(e)));
      if (!applyDefaultApiErrorHandlers(e, dispatch)) {
        dispatch(showSnackbar({ text: String(e), showErrorIcon: true }));
      }
    }
  };

export const useSignUp = () => {
  const dispatch = useAppDispatch();
  const signUpState = useSelector(signUpSelector);
  return {
    ...signUpState,
    signUp: async (...data: Parameters<typeof signUp>) => dispatch(signUp(...data)),
  };
};

const handleTokensReceived =
  (authToken: string, refreshToken: string, rememberUser = false): AppThunk<Promise<void>> =>
  async (dispatch) => {
    if (rememberUser) {
      localStorage.setItem(STORAGE_TOKEN_KEY, authToken);
      localStorage.setItem(STORAGE_REFRESH_TOKEN_KEY, refreshToken);
    } else {
      localStorage.removeItem(STORAGE_TOKEN_KEY);
      localStorage.removeItem(STORAGE_REFRESH_TOKEN_KEY);
    }

    localStorage.setItem(STORAGE_ALREADY_BEEN_AUTH_KEY, 'true');

    dispatch(authSuccess({ authToken, refreshToken }));
  };

const verifyEmailSlice = createDataSlice({
  name: 'useVerifyEmail',
  fetchData: async (params: VerifyEmailRequest, dispatch) => {
    const response = await API.verifyEmail(params);
    const { jwt, refreshToken } = response.data;
    await (dispatch as AppDispatch)(handleTokensReceived(jwt, refreshToken, false));
    return {};
  },
});

export const redirectToStudyScreenByRole =
  (): AppThunk<Promise<void>> => async (dispatch, getState) => {
    let isStudiesExists = false;
    let isStudiesHaveError = false;

    try {
      const { data } = await API.getStudies();
      isStudiesExists = !!data.length;
    } catch (e) {
      isStudiesHaveError = true;
    }

    const tokenPayload = authTokenPayloadSelector(getState());

    if (
      tokenPayload.roles?.some((r: { role: string }) => r.role === 'team-admin') &&
      !isStudiesExists &&
      !isStudiesHaveError
    ) {
      dispatch(push(Path.CreateStudy));
    } else {
      dispatch(push([Path.Overview, SWITCH_STUDY_SEARCH_PARAM].join('?')));
    }
  };

export const useVerifyEmail = verifyEmailSlice.hook;

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
  async (dispatch) => {
    const res = await API.signin({ email, password });
    const { jwt, refreshToken } = res.data;

    await dispatch(handleTokensReceived(jwt, refreshToken, rememberUser));
    await dispatch(redirectToStudyScreenByRole());
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

export const SUCCESS_CONFIRMATION_MESSAGE = 'Email resent.';

export const resendVerificationEmail =
  (body: ResendVerificationEmailRequest): AppThunk<Promise<void>> =>
  async (dispatch) => {
    try {
      (await API.resendVerification(body)).checkError();
      // TODO: temporary solution for interface response
      dispatch(
        showSnackbar({
          text: SUCCESS_CONFIRMATION_MESSAGE,
        })
      );
    } catch (err) {
      if (!applyDefaultApiErrorHandlers(err, dispatch)) {
        dispatch(
          showSnackbar({
            text: _isObject(err) ? err.toString() : 'Failed to resend email',
            showErrorIcon: true,
          })
        );
      }
    }
  };

export const isAlreadyBeenAuthorized = () => !!localStorage.getItem(STORAGE_ALREADY_BEEN_AUTH_KEY);

export const isAuthorizedSelector = (state: RootState) => !!state.auth.authToken;

export const userNameSelector = createSelector(
  authTokenPayloadSelector,
  (pl) => pl?.email?.split('@')[0] || pl?.email
);

export default {
  [authSlice.name]: authSlice.reducer,
  [signUpSlice.name]: signUpSlice.reducer,
  [verifyEmailSlice.name]: verifyEmailSlice.reducer,
};
