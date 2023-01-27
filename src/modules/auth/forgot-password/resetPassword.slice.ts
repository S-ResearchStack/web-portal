import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppThunk, ErrorType, RootState, useAppDispatch, WithLoading } from 'src/modules/store';
import applyDefaultApiErrorHandlers from 'src/modules/api/applyDefaultApiErrorHandlers';
import * as API from 'src/modules/api/models';
import Api from 'src/modules/api';
import { redirectToStudyScreenByRole } from 'src/modules/auth/auth.slice';

type PasswordRecoveryState = WithLoading;

export const resetPasswordInitialState: PasswordRecoveryState = {};

const resetPasswordSlice = createSlice({
  name: 'resetPassword',
  initialState: resetPasswordInitialState,
  reducers: {
    requestResetPasswordInit(state) {
      state.isLoading = true;
      state.error = undefined;
    },
    requestResetPasswordSuccess(state) {
      state.isLoading = false;
    },
    requestResetPasswordFailure(state, { payload }: PayloadAction<ErrorType>) {
      state.isLoading = false;
      state.error = payload;
    },
  },
});

const requestResetPassword =
  (body: Omit<API.ResetPasswordRequest, 'profile'>): AppThunk<Promise<void>> =>
  async (dispatch) => {
    try {
      dispatch(resetPasswordSlice.actions.requestResetPasswordInit());
      await Api.resetPassword(body);
      // TODO: set auth token
      dispatch(resetPasswordSlice.actions.requestResetPasswordSuccess());
      await dispatch(redirectToStudyScreenByRole());
    } catch (e) {
      dispatch(resetPasswordSlice.actions.requestResetPasswordFailure(String(e)));
      applyDefaultApiErrorHandlers(e, dispatch);
    }
  };

export const resetPasswordSelector = (state: RootState): PasswordRecoveryState =>
  state[resetPasswordSlice.name];

export const useResetPassword = () => {
  const state = useSelector(resetPasswordSelector);
  const dispatch = useAppDispatch();

  const resetPassword = useCallback(
    (payload: Parameters<typeof requestResetPassword>[0]) => {
      if (!payload.email || !payload.password || !payload.resetToken || state.isLoading) {
        return;
      }

      dispatch(requestResetPassword(payload));
    },
    [state.isLoading, dispatch]
  );

  return {
    ...state,
    resetPassword,
  };
};

export default {
  [resetPasswordSlice.name]: resetPasswordSlice.reducer,
};
