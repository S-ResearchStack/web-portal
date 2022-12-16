import { clearAuth } from 'src/modules/auth/auth.slice';
import { reset } from 'src/modules/studies/studies.slice';
import { AppThunk } from 'src/modules/store';
import { STORAGE_TOKEN_KEY, STORAGE_REFRESH_TOKEN_KEY } from 'src/modules/auth/utils';

export const signout = (): AppThunk => (dispatch) => {
  localStorage.removeItem(STORAGE_TOKEN_KEY);
  localStorage.removeItem(STORAGE_REFRESH_TOKEN_KEY);
  dispatch(clearAuth());
  dispatch(reset());
};
