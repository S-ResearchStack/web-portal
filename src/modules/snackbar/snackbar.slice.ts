import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import _isNumber from 'lodash/isNumber';
import _uniqueId from 'lodash/uniqueId';

import { RootState, AppThunk } from 'src/modules/store';

const DEFAULT_DURATION_MS = 4000;
const SNACK_BAR_PREFIX = 'snackbar_';

export type SnackbarInstance = {
  id: string;
  text: string;
  actionLabel?: string;
  hideTimeoutId: number;
  duration?: number;
  showErrorIcon?: boolean;
  showCloseIcon?: boolean;
  showSuccessIcon?: boolean;
  onClose?: () => void;
};

type SnackbarState = {
  currentSnackbar?: SnackbarInstance;
  actionTriggeredSnackbarId?: string;
  actionTs?: number;
};

const initialState: SnackbarState = {};

export const snackbarSlice = createSlice({
  name: 'snackbar',
  initialState,
  reducers: {
    setCurrentSnackbar(state, { payload: s }: PayloadAction<SnackbarInstance | undefined>) {
      state.currentSnackbar = s;
    },
    setActionTriggeredSnackbarId(
      state,
      { payload: { snackbarId, ts } }: PayloadAction<{ snackbarId: string; ts: number }>
    ) {
      state.actionTriggeredSnackbarId = snackbarId;
      state.actionTs = ts;
    },
  },
});

const { setCurrentSnackbar, setActionTriggeredSnackbarId } = snackbarSlice.actions;

const clearCurrentSnackbar = (): AppThunk => (dispatch, getStore) => {
  const { currentSnackbar } = getStore().snackbar;
  if (currentSnackbar) {
    clearTimeout(currentSnackbar.hideTimeoutId);
    dispatch(setCurrentSnackbar(undefined));
  }
};

export const showSnackbar =
  (
    s: Omit<SnackbarInstance, 'id' | 'hideTimeoutId'> & Partial<Pick<SnackbarInstance, 'id'>>
  ): AppThunk<string> =>
  (dispatch, getStore) => {
    const id =
      typeof s.id === 'string' ? `${SNACK_BAR_PREFIX}${s.id}` : _uniqueId(SNACK_BAR_PREFIX);

    const { currentSnackbar } = getStore().snackbar;

    if (currentSnackbar?.id === id) {
      return id;
    }

    dispatch(clearCurrentSnackbar());

    let hideTimeoutId = -1;
    if (s.duration !== 0) {
      hideTimeoutId = window.setTimeout(
        () => {
          dispatch(clearCurrentSnackbar());
        },
        _isNumber(s.duration) ? s.duration : DEFAULT_DURATION_MS
      );
    }

    dispatch(
      setCurrentSnackbar({
        ...s,
        id,
        hideTimeoutId,
      })
    );

    return id;
  };

export const snackbarActionTriggered =
  (snackbarId: string): AppThunk =>
  (dispatch) => {
    dispatch(setActionTriggeredSnackbarId({ snackbarId, ts: Date.now() }));
  };

export const hideSnackbar = (): AppThunk => (dispatch) => {
  dispatch(clearCurrentSnackbar());
};

export const currentSnackbarSelector = (state: RootState) =>
  state.snackbar.currentSnackbar as Omit<SnackbarInstance, 'hideTimeoutId'>;

export const actionTriggeredSnackbarIdSelector = (state: RootState) =>
  state.snackbar.actionTriggeredSnackbarId;

export const actionTriggeredSnackbarTsSelector = (state: RootState) => state.snackbar.actionTs;

export default snackbarSlice.reducer;
