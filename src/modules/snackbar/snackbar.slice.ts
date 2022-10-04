import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import _isNumber from 'lodash/isNumber';
import _uniqueId from 'lodash/uniqueId';

import { RootState, AppThunk } from 'src/modules/store';

const DURATION_MS = 4000;
const SNACK_BAR_PREFIX = 'snackbar_';

type SnackbarInstance = {
  id: string;
  text: string;
  actionLabel?: string;
  hideTimeoutId: number;
  duration?: number;
};

type SnackbarState = {
  currentSnackbar?: SnackbarInstance;
  actionTriggeredSnackbarId?: string;
};

const initialState: SnackbarState = {};

export const snackbarSlice = createSlice({
  name: 'snackbar',
  initialState,
  reducers: {
    setCurrentSnackbar(state, { payload: s }: PayloadAction<SnackbarInstance | undefined>) {
      state.currentSnackbar = s;
    },
    setActionTriggeredSnackbarId(state, { payload: snackbarId }: PayloadAction<string>) {
      state.actionTriggeredSnackbarId = snackbarId;
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

    const hideTimeoutId = window.setTimeout(
      () => {
        dispatch(clearCurrentSnackbar());
      },
      _isNumber(s.duration) ? s.duration : DURATION_MS
    );

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
    dispatch(clearCurrentSnackbar());
    dispatch(setActionTriggeredSnackbarId(snackbarId));
  };

export const currentSnackbarSelector = (state: RootState) =>
  state.snackbar.currentSnackbar as Omit<SnackbarInstance, 'hideTimeoutId'>;

export const actionTriggeredSnackbarIdSelector = (state: RootState) =>
  state.snackbar.actionTriggeredSnackbarId;

export default snackbarSlice.reducer;
