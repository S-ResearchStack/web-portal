import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { push } from 'connected-react-router';
import { useSelector } from 'react-redux';

import API, {
  SignUpRequest,
  GetUserResponse,
  RegisterUserRequest,
  ResendVerificationEmailRequest,
  VerifyEmailRequest,
} from 'src/modules/api';
import { Path } from 'src/modules/navigation/store';
import {
  AppThunk,
  ErrorType,
  RootState,
  WithLoading,
  useAppDispatch,
} from 'src/modules/store';
import { SWITCH_STUDY_SEARCH_PARAM } from 'src/modules/main-layout/constants';

import { HTTP_CODE_CONFLICT, HTTP_CODE_NOT_FOUND } from "src/modules/api/code";
import applyDefaultApiErrorHandlers from "src/modules/api/applyDefaultApiErrorHandlers";
import { transformUserFromApi } from "src/modules/auth/auth.mapper";
import {
  STORAGE_JWT_TYPE,
  STORAGE_TOKEN_KEY,
  STORAGE_REFRESH_TOKEN_KEY,
  STORAGE_ALREADY_BEEN_AUTH_KEY,
  STORAGE_USER_KEY, STORAGE_ALREADY_BEEN_USER_KEY, STORAGE_SHOW_STUDIES, STORAGE_REMEMBER_USER
} from './utils';
import { UserRole } from './userRole';
import { showSnackbar } from '../snackbar/snackbar.slice';
import { STORAGE_STUDY_PROGRESS_LAST_SEEN_STATUS_KEY } from "src/modules/overview/StudyOverview.slice";

import './auth.mock';
import createDataSlice from '../store/createDataSlice';

// TODO: Do we need to support auto sign-in ?
export const loadInitialAuthStateFromStorage = (): AuthState => {
  const jwtType = localStorage.getItem(STORAGE_JWT_TYPE) || undefined;
  const authToken = localStorage.getItem(STORAGE_TOKEN_KEY) || undefined;
  const refreshToken = localStorage.getItem(STORAGE_REFRESH_TOKEN_KEY) || undefined;
  const rememberUser = localStorage.getItem(STORAGE_REMEMBER_USER) || undefined;

  return { jwtType, authToken, refreshToken, rememberUser: rememberUser !== 'false' };
};

export const loadInitialUserStateFormStorage = (): User => {
  const json = sessionStorage.getItem(STORAGE_USER_KEY) || undefined
  const user = json && JSON.parse(json)
  // if user is undefined, do not return 'undefined'
  // just return the user state which has undefined fields
  return { ...user }
}

interface AuthState {
  jwtType?: string;
  authToken?: string;
  refreshToken?: string;
  rememberUser?: boolean;
  email?: string;
}

const initialState: AuthState = {
  ...loadInitialAuthStateFromStorage(),
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authSuccess(state, { payload }: PayloadAction<AuthState>) {
      return {
        ...state,
        ...payload,
      };
    },
    clearAuth(state) {
      state.authToken = undefined;
      state.refreshToken = undefined;
    },
  },
});

export const { authSuccess } = authSlice.actions;

const signInInitialState: WithLoading = {};

const signInSlice = createSlice({
  name: 'signIn',
  initialState: signInInitialState,
  reducers: {
    signInInit(state) {
      state.isLoading = true;
      state.error = undefined;
    },
    signInSuccess(state) {
      state.isLoading = false;
    },
    signInFailure(state, { payload }: PayloadAction<ErrorType>) {
      state.error = payload;
      state.isLoading = false;
    },
    resetError(state) {
      state.error = undefined;
    },
  },
});

const signInSelector = (state: RootState) => state[signInSlice.name];
const signIn = ({
  email,
  password,
  rememberUser,
}: {
  email: string;
  password: string;
  rememberUser?: boolean;
}): AppThunk<Promise<void>> =>
  async (dispatch) => {
    try {
      dispatch(signInSlice.actions.signInInit());

      const jwtType = 'super-tokens';
      const res = await API.signin({ email, password });
      res.checkError()
      const { accessToken, refreshToken } = res.data;
      await dispatch(handleTokensReceived(accessToken, refreshToken, jwtType, rememberUser, email));

      const userRes = await API.getUser()

      if (userRes.status === HTTP_CODE_NOT_FOUND) {
        await dispatch(redirectToRegistrationScreen());
      } else {
        userRes.checkError()
        await dispatch(handleGetUser(userRes.data));
        await dispatch(redirectToStudyScreenByRole());
      }

      dispatch(signInSlice.actions.signInSuccess());
    } catch (e) {
      dispatch(signInSlice.actions.signInFailure('Incorrect email or password, please try again.'));
    }
  };
export const useSignIn = () => {
  const dispatch = useAppDispatch();
  const signInState = useSelector(signInSelector);
  return {
    ...signInState,
    signIn: async (...data: Parameters<typeof signIn>) => dispatch(signIn(...data)),
    signInWithGoogle: async (...data: Parameters<typeof signInWithGoogle>) => dispatch(signInWithGoogle(...data)),
    resetError: () => dispatch(signInSlice.actions.resetError()),
  };
};

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
    resetError(state) {
      state.error = undefined;
    },
  },
});

const signUpSelector = (state: RootState) => state[signUpSlice.name];
const signUp = (data: SignUpRequest): AppThunk =>
  async (dispatch) => {
    try {
      dispatch(signUpSlice.actions.signUpInit());

      const { status, checkError } = await API.signup(data);
      if (status === HTTP_CODE_CONFLICT) {
        dispatch(signUpSlice.actions.signUpFailure('This email is already registered, please use another email.'));
      } else {
        checkError();
        dispatch(showSnackbar({ text: "Sign up successfully, please sign in to continue.", showSuccessIcon: true }));
        dispatch(push(`${Path.SignIn}?email=${encodeURIComponent(data.email)}`));
        dispatch(signUpSlice.actions.signUpSuccess());
      }
    } catch (e) {
      dispatch(signUpSlice.actions.signUpFailure('Oops, something went wrong, please try again.'));
    }
  };

export const useSignUp = () => {
  const dispatch = useAppDispatch();
  const signUpState = useSelector(signUpSelector);
  return {
    ...signUpState,
    signUp: async (...data: Parameters<typeof signUp>) => dispatch(signUp(...data)),
    resetError: () => dispatch(signUpSlice.actions.resetError()),
  };
};

export interface User {
  id: string
  firstName: string
  lastName: string
  company: string
  team: string
  email: string
  officePhoneNumber: string
  mobilePhoneNumber: string
  roles?: UserRole[]
}

const userInitialState: User = {
  ...loadInitialUserStateFormStorage()
};

const userSlice = createSlice({
  name: 'user',
  initialState: userInitialState,
  reducers: {
    getUserSuccess(
      state,
      { payload }: PayloadAction<User>
    ) {
      return { ...payload }
    },
  },
});

export const handleTokensReceived =
  (
    authToken: string,
    refreshToken: string,
    jwtType: string,
    rememberUser?: boolean | false,
    email?: string,
  ): AppThunk<Promise<void>> =>
    async (dispatch) => {
      if (!rememberUser) {
        localStorage.removeItem(STORAGE_JWT_TYPE);
        localStorage.removeItem(STORAGE_TOKEN_KEY);
        localStorage.removeItem(STORAGE_REFRESH_TOKEN_KEY);
      } else {
        localStorage.setItem(STORAGE_JWT_TYPE, jwtType);
        localStorage.setItem(STORAGE_TOKEN_KEY, authToken);
        localStorage.setItem(STORAGE_REFRESH_TOKEN_KEY, refreshToken);
      }

      localStorage.setItem(STORAGE_ALREADY_BEEN_AUTH_KEY, 'true');
      localStorage.setItem(STORAGE_REMEMBER_USER, !rememberUser ? 'false' : 'true');
      dispatch(authSuccess({ jwtType, authToken, refreshToken, rememberUser, email }));
    };

export const handleGetUser = (userRes: GetUserResponse): AppThunk<Promise<void>> =>
  async (dispatch) => {
    const user = transformUserFromApi(userRes)
    sessionStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user))
    sessionStorage.setItem(STORAGE_ALREADY_BEEN_USER_KEY, 'true')

    dispatch(userSlice.actions.getUserSuccess(user))
  }

export const redirectToRegistrationScreen =
  (): AppThunk<Promise<void>> => async (dispatch) => {
    dispatch(push(Path.Registration))
  }

export const redirectToStudyScreenByRole =
  (): AppThunk<Promise<void>> => async (dispatch) => {
    sessionStorage.setItem(STORAGE_SHOW_STUDIES, 'true')
    dispatch(push(Path.Overview));
  };

export const handleGoogleSignIn = (code: string): AppThunk<Promise<void>> =>
  async (dispatch) => {
    try {
      const tokenRes = await API.getGoogleToken(code);
      tokenRes.checkError()

      const jwtType = 'google';
      const { refresh_token: refreshToken, id_token: idToken } = tokenRes.data;

      await dispatch(handleTokensReceived(idToken, refreshToken, jwtType, true));

      const userRes = await API.getUser()

      if (userRes.status === HTTP_CODE_NOT_FOUND) {
        await dispatch(redirectToRegistrationScreen());
      } else {
        userRes.checkError()
        await dispatch(handleGetUser(userRes.data));
        await dispatch(redirectToStudyScreenByRole());
      }
    } catch (e) {
      applyDefaultApiErrorHandlers(e, dispatch);
    }
  }

const signInWithGoogle = ({
  code,
  rememberUser,
}: {
  code: string;
  rememberUser?: boolean;
}): AppThunk<Promise<void>> =>
  async (dispatch) => {
    try {
      const tokenRes = await API.getGoogleToken(code);
      tokenRes.checkError()

      const jwtType = 'google';
      const { refresh_token: refreshToken, id_token: idToken } = tokenRes.data;

      await dispatch(handleTokensReceived(idToken, refreshToken, jwtType, rememberUser, '_@gmail.com'));

      const userRes = await API.getUser()

      if (userRes.status === HTTP_CODE_NOT_FOUND) {
        await dispatch(redirectToRegistrationScreen());
      } else {
        userRes.checkError()
        await dispatch(handleGetUser(userRes.data));
        await dispatch(redirectToStudyScreenByRole());
      }
    } catch (e) {
      applyDefaultApiErrorHandlers(e, dispatch);
    }
  }

export const registerUser = (data: RegisterUserRequest): AppThunk<Promise<void>> =>
  async (dispatch) => {
    try {
      dispatch(signUpSlice.actions.signUpInit());
      const { status, checkError } = await API.registerUser(data);
      checkError();

      if (status === HTTP_CODE_CONFLICT) {
        dispatch(push(Path.SignIn));
      }

      const { data: getUserData, checkError: getUserCheckError } = await API.getUser()
      getUserCheckError();

      dispatch(signUpSlice.actions.signUpSuccess());
      await dispatch(handleGetUser(getUserData));
      await dispatch(redirectToStudyScreenByRole());
    } catch (e) {
      dispatch(signUpSlice.actions.signUpFailure(String(e)));
      applyDefaultApiErrorHandlers(e, dispatch);
    }
  }

export const updateTokens = (): AppThunk<Promise<void>> => async (dispatch, getState) => {
  const {
    email,
    jwtType,
    rememberUser,
    authToken: actualAuthToken,
    refreshToken: actualRefreshToken,
  } = getState().auth;

  if (!actualAuthToken || !actualRefreshToken || !jwtType) {
    return;
  }

  if ('google' === jwtType) {
    const { id_token: idToken } = (await API.refreshGoogleToken({ refreshToken: actualRefreshToken })).data;
    await dispatch(
      handleTokensReceived(
        idToken,
        actualRefreshToken,
        jwtType,
        rememberUser,
        email,
      )
    );
  }
};

export const signOut = () => {
  localStorage.removeItem(STORAGE_JWT_TYPE);
  localStorage.removeItem(STORAGE_TOKEN_KEY);
  localStorage.removeItem(STORAGE_REFRESH_TOKEN_KEY);
  localStorage.removeItem(STORAGE_ALREADY_BEEN_AUTH_KEY)
  localStorage.removeItem(STORAGE_STUDY_PROGRESS_LAST_SEEN_STATUS_KEY);

  sessionStorage.removeItem(STORAGE_USER_KEY)
  sessionStorage.removeItem(STORAGE_ALREADY_BEEN_USER_KEY)

  sessionStorage.removeItem(STORAGE_SHOW_STUDIES)

  window.location.reload();
};

export const isAlreadyBeenAuthorized = () => !!localStorage.getItem(STORAGE_ALREADY_BEEN_AUTH_KEY);

export const isUserRegistered = () => !!sessionStorage.getItem(STORAGE_ALREADY_BEEN_USER_KEY)
export const isTokenExistSelector = (state: RootState) => !!state.auth.authToken;

export const userEmailSelector = createSelector(
  (state: RootState) => state.user,
  (user) => user.email
)
export const userEmailRegister = createSelector(
  (state: RootState) => state.auth,
  (user) => user.email
)

export const userNameSelector = createSelector(
  (state: RootState) => state.user,
  (user) => user.firstName && user.lastName && `${user.firstName} ${user.lastName}`
);

export const userRoleSelector = createSelector(
  (state: RootState) => state.user,
  (user) => user.roles
)

export default {
  [authSlice.name]: authSlice.reducer,
  [signInSlice.name]: signInSlice.reducer,
  [signUpSlice.name]: signUpSlice.reducer,
  [userSlice.name]: userSlice.reducer,
};
