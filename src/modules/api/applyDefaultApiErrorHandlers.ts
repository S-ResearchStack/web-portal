import { FailedConnectionError } from 'src/modules/api/executeRequest';
import { showSnackbar } from 'src/modules/snackbar/snackbar.slice';
import type { AppDispatch } from 'src/modules/store/store';

const applyDefaultApiErrorHandlers = (e: unknown, dispatch: AppDispatch): boolean => {
  if (e instanceof FailedConnectionError) {
    dispatch(
      showSnackbar({
        id: e.name,
        text: e.message,
      })
    );
    return true;
  }
  return false;
};

export default applyDefaultApiErrorHandlers;
