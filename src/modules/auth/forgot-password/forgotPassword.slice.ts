import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppThunk, ErrorType, RootState, useAppDispatch, WithLoading } from 'src/modules/store';
import waitFor from 'src/common/utils/waitFor';
import applyDefaultApiErrorHandlers from 'src/modules/api/applyDefaultApiErrorHandlers';

type PasswordRecoveryState = WithLoading;

export const passwordRecoveryInitialState: PasswordRecoveryState = {};

const passwordRecoverySlice = createSlice({
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
    requestRecoveryPasswordFailure(state, { payload }: PayloadAction<ErrorType>) {
      state.isLoading = false;
      state.error = payload;
    },
  },
});

// prettier-ignore
const requestRecoveryPassword =
  // eslint-disable-next-line
  (body: { email: string }): AppThunk<Promise<void>> =>
  async (dispatch) => {
    try {
      dispatch(passwordRecoverySlice.actions.requestRecoveryPasswordInit());
      await waitFor(1000);
      dispatch(passwordRecoverySlice.actions.requestRecoveryPasswordSuccess());
    } catch (e) {
      dispatch(passwordRecoverySlice.actions.requestRecoveryPasswordFailure(String(e)));
      applyDefaultApiErrorHandlers(e, dispatch);
    }
  };

export const passwordRecoverySelector = (state: RootState): PasswordRecoveryState =>
  state[passwordRecoverySlice.name];

export const usePasswordRecovery = () => {
  const state = useSelector(passwordRecoverySelector);
  const dispatch = useAppDispatch();

  const recoveryPassword = useCallback(
    async (payload: Parameters<typeof requestRecoveryPassword>[0]) => {
      if (!payload.email || state.isLoading) {
        return;
      }

      await dispatch(requestRecoveryPassword(payload));
    },
    [state.isLoading, dispatch]
  );

  return {
    ...state,
    recoveryPassword,
  };
};

export default {
  [passwordRecoverySlice.name]: passwordRecoverySlice.reducer,
};
