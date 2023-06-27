import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppThunk, ErrorType, RootState, useAppDispatch, WithLoading } from 'src/modules/store';
import applyDefaultApiErrorHandlers from 'src/modules/api/applyDefaultApiErrorHandlers';
import API from 'src/modules/api';
import { handleTokensReceived } from 'src/modules/auth/auth.slice';
import { Path } from 'src/modules/navigation/store';
import { push } from 'connected-react-router';

export type ResetPasswordState = WithLoading;

export const resetPasswordInitialState: ResetPasswordState = {};

export const resetPasswordSlice = createSlice({
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
  ({
    email,
    password,
    resetToken,
  }: {
    email: string;
    password: string;
    resetToken: string;
  }): AppThunk<Promise<void>> =>
  async (dispatch) => {
    try {
      dispatch(resetPasswordSlice.actions.requestResetPasswordInit());
      const res = await API.resetPassword({
        password,
        resetToken,
      });
      const { jwt, refreshToken, profile } = res.data;

      await dispatch(handleTokensReceived(jwt, refreshToken, profile, true));

      dispatch(resetPasswordSlice.actions.requestResetPasswordSuccess());
      dispatch(push(`${Path.ResetPasswordComplete}?email=${encodeURIComponent(email)}`));
    } catch (e) {
      dispatch(resetPasswordSlice.actions.requestResetPasswordFailure(String(e)));
      applyDefaultApiErrorHandlers(e, dispatch);
    }
  };

const resetPasswordSelector = (state: RootState): ResetPasswordState =>
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
