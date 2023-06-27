import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppThunk, ErrorType, RootState, useAppDispatch, WithLoading } from 'src/modules/store';
import applyDefaultApiErrorHandlers from 'src/modules/api/applyDefaultApiErrorHandlers';
import API from 'src/modules/api';

API.mock.provideEndpoints({
  forgotPassword(body) {
    if (body.email.includes('invalid')) {
      return API.mock.failedResponse({
        status: 404,
      });
    }
    return API.mock.response(undefined);
  },
});

type PasswordRecoveryError = {
  message: ErrorType;
  isNotFound?: boolean;
};

export type PasswordRecoveryState = Omit<WithLoading, 'error'> & {
  error?: PasswordRecoveryError;
};

export const passwordRecoveryInitialState: PasswordRecoveryState = {};

export const passwordRecoverySlice = createSlice({
  name: 'forgotPassword',
  initialState: passwordRecoveryInitialState,
  reducers: {
    requestRecoveryPasswordInit(state) {
      state.isLoading = true;
      state.error = undefined;
    },
    requestRecoveryPasswordSuccess(state) {
      state.isLoading = false;
    },
    requestRecoveryPasswordFailure(state, { payload }: PayloadAction<PasswordRecoveryError>) {
      state.isLoading = false;
      state.error = payload;
    },
    clearRecoveryPasswordError(state) {
      state.error = undefined;
    },
  },
});

const requestRecoveryPassword =
  ({ email }: { email: string }): AppThunk<Promise<boolean>> =>
  async (dispatch) => {
    try {
      dispatch(passwordRecoverySlice.actions.requestRecoveryPasswordInit());

      const res = await API.forgotPassword({
        email,
      });

      if (res.status === 404) {
        dispatch(
          passwordRecoverySlice.actions.requestRecoveryPasswordFailure({
            message: String(res.error),
            isNotFound: true,
          })
        );
        return false;
      }

      res.checkError();

      dispatch(passwordRecoverySlice.actions.requestRecoveryPasswordSuccess());
      return true;
    } catch (e) {
      dispatch(
        passwordRecoverySlice.actions.requestRecoveryPasswordFailure({ message: String(e) })
      );

      applyDefaultApiErrorHandlers(e, dispatch);
      return false;
    }
  };

const passwordRecoverySelector = (state: RootState): PasswordRecoveryState =>
  state[passwordRecoverySlice.name];

export const usePasswordRecovery = () => {
  const state = useSelector(passwordRecoverySelector);
  const dispatch = useAppDispatch();

  const sendPasswordRecoveryRequest = useCallback(
    async (payload: Parameters<typeof requestRecoveryPassword>[0]) => {
      if (!payload.email || state.isLoading) {
        return false;
      }

      const isOk = await dispatch(requestRecoveryPassword(payload));
      return isOk;
    },
    [state.isLoading, dispatch]
  );

  const clearError = useCallback(() => {
    dispatch(passwordRecoverySlice.actions.clearRecoveryPasswordError());
  }, [dispatch]);

  return {
    ...state,
    sendPasswordRecoveryRequest,
    clearError,
  };
};

export default {
  [passwordRecoverySlice.name]: passwordRecoverySlice.reducer,
};
