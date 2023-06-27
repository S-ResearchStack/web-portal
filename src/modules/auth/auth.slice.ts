import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { push } from 'connected-react-router';
import { useSelector } from 'react-redux';

import API, {
  ResendVerificationEmailRequest,
  SigninResponse,
  SignUpRequest,
  UserProfile,
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

import {
  authTokenPayloadSelector,
  getUserDataFromAuthToken,
} from './auth.slice.authTokenPayloadSelector';
import { roleToApi, isGlobalRoleType, allowedRoleTypes, userRolesListFromApi } from './userRole';
import {
  decodeAuthToken,
  STORAGE_TOKEN_KEY,
  STORAGE_REFRESH_TOKEN_KEY,
  STORAGE_ALREADY_BEEN_AUTH_KEY,
  STORAGE_USER_NAME_KEY,
} from './utils';
import { MOCK_ACCOUNT_ID } from '../study-settings/utils';

const isValidEmail = (v: string) => v.includes('samsung');

const isDuplicateEmail = (v: string) => v.includes('duplicate');

const signinSuccessMock = ({ email }: { email: string }) => {
  let roles = ['team-admin'];

  const roleFromEmail = allowedRoleTypes.find((r) => email.includes(r));
  if (roleFromEmail) {
    roles = isGlobalRoleType(roleFromEmail)
      ? [roleFromEmail]
      : mockStudyIds.map((projectId) => roleToApi({ roles: [roleFromEmail], projectId })).flat();
  }

  const header = window.btoa(JSON.stringify({}));
  const payload = window.btoa(
    JSON.stringify({
      email,
      roles,
      sub: MOCK_ACCOUNT_ID,
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
      name: 'Samuel',
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
    if (body.resetToken) {
      return signinSuccessMock({ email: 'success@samsung.com' });
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
  userName?: string;
}

export const getStateFromAuthToken = (authToken: string) => {
  try {
    const { roles } = decodeAuthToken(authToken);
    return {
      authToken,
      userRoles: userRolesListFromApi(roles),
    };
  } catch {
    return undefined;
  }
};

export const loadInitialStateFromStorage = (): AuthState => {
  const authToken = localStorage.getItem(STORAGE_TOKEN_KEY) || undefined;
  const refreshToken = localStorage.getItem(STORAGE_REFRESH_TOKEN_KEY) || undefined;
  const userName = localStorage.getItem(STORAGE_USER_NAME_KEY) || undefined;

  return { authToken, refreshToken, userName };
};

const initialState: AuthState = {
  ...loadInitialStateFromStorage(),
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authSuccess(
      _,
      { payload }: PayloadAction<{ authToken: string; refreshToken: string; userName: string }>
    ) {
      return {
        ...getStateFromAuthToken(payload.authToken),
        refreshToken: payload.refreshToken,
        userName: payload.userName,
      };
    },
    clearAuth(state) {
      state.authToken = undefined;
      state.refreshToken = undefined;
    },
    setUserName(state, { payload }: PayloadAction<string>) {
      state.userName = payload;
    },
  },
});

export const { authSuccess } = authSlice.actions;

const signUpInitialState: WithLoading = {};

const signUpSlice = createSlice({
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

const signUpSelector = (state: RootState) => state[signUpSlice.name];

const HTTP_CODE_CONFLICT = 409;

const signUp =
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
      dispatch(authSlice.actions.setUserName(data.profile.name || data.email));
    } catch (e) {
      dispatch(signUpSlice.actions.signUpFailure(String(e)));
      applyDefaultApiErrorHandlers(e, dispatch);
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

export const handleTokensReceived =
  (
    authToken: string,
    refreshToken: string,
    profile: UserProfile | undefined,
    rememberUser = false
  ): AppThunk<Promise<void>> =>
  async (dispatch) => {
    const userName = profile?.name || getUserDataFromAuthToken(authToken).email || '';
    if (rememberUser) {
      localStorage.setItem(STORAGE_TOKEN_KEY, authToken);
      localStorage.setItem(STORAGE_REFRESH_TOKEN_KEY, refreshToken);
      localStorage.setItem(STORAGE_USER_NAME_KEY, userName);
    } else {
      localStorage.removeItem(STORAGE_TOKEN_KEY);
      localStorage.removeItem(STORAGE_REFRESH_TOKEN_KEY);
      localStorage.removeItem(STORAGE_USER_NAME_KEY);
    }

    localStorage.setItem(STORAGE_ALREADY_BEEN_AUTH_KEY, 'true');

    dispatch(authSuccess({ authToken, refreshToken, userName }));
  };

const verifyEmailSlice = createDataSlice({
  name: 'useVerifyEmail',
  fetchData: async (params: VerifyEmailRequest, dispatch) => {
    const response = await API.verifyEmail(params);
    response.checkError();
    const { jwt, refreshToken, profile } = response.data;
    await (dispatch as AppDispatch)(handleTokensReceived(jwt, refreshToken, profile, true));
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
      tokenPayload.roles?.some((r: { roles: string[] }) => r.roles.includes('team-admin')) &&
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
    const { jwt, refreshToken, profile } = res.data;

    await dispatch(handleTokensReceived(jwt, refreshToken, profile, rememberUser));
    await dispatch(redirectToStudyScreenByRole());

    profile.name && dispatch(authSlice.actions.setUserName(profile.name));
  };

export const activateAccount =
  ({
    name,
    password,
    resetToken,
  }: {
    name: string;
    password: string;
    resetToken: string;
  }): AppThunk<Promise<void>> =>
  async (dispatch) => {
    try {
      const res = await API.resetPassword({
        password,
        resetToken,
        profile: {
          name,
          status: 'active',
        },
      });

      const { jwt, refreshToken, profile } = res.data;
      await dispatch(handleTokensReceived(jwt, refreshToken, profile, true));
      await dispatch(redirectToStudyScreenByRole());
    } catch (err) {
      applyDefaultApiErrorHandlers(err, dispatch);
    }
  };

export const updateTokens = (): AppThunk<Promise<void>> => async (dispatch, getState) => {
  const {
    authToken: actualAuthToken,
    refreshToken: actualRefreshToken,
    userName,
  } = getState().auth;

  if (!actualAuthToken || !actualRefreshToken) {
    return;
  }

  const { jwt, refreshToken } = (
    await API.refreshToken({ jwt: actualAuthToken, refreshToken: actualRefreshToken })
  ).data;

  dispatch(
    handleTokensReceived(
      jwt,
      refreshToken,
      { name: userName },
      !!localStorage.getItem(STORAGE_TOKEN_KEY)
    )
  );
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
      applyDefaultApiErrorHandlers(err, dispatch);
    }
  };

export const isAlreadyBeenAuthorized = () => !!localStorage.getItem(STORAGE_ALREADY_BEEN_AUTH_KEY);

export const isAuthorizedSelector = (state: RootState) => !!state.auth.authToken;

export const userEmailSelector = createSelector(authTokenPayloadSelector, (pl) => pl?.email);

export const userNameSelector = createSelector(
  (state: RootState) => state.auth,
  (auth) => auth.userName
);

export default {
  [authSlice.name]: authSlice.reducer,
  [signUpSlice.name]: signUpSlice.reducer,
  [verifyEmailSlice.name]: verifyEmailSlice.reducer,
};
