import { FailedConnectionError, GENERIC_SERVER_ERROR_TEXT } from 'src/modules/api/executeRequest';
import { showSnackbar } from 'src/modules/snackbar/snackbar.slice';
import type { AppDispatch } from 'src/modules/store/store';

const applyDefaultApiErrorHandlers = (
  e: unknown,
  dispatch: AppDispatch,
  showGenericServerError = true
): boolean => {
  console.error(e);

  if (e instanceof FailedConnectionError) {
    dispatch(
      showSnackbar({
        id: e.name,
        text: e.message,
      })
    );
    return true;
  }

  if (showGenericServerError) {
    dispatch(
      showSnackbar({
        text: GENERIC_SERVER_ERROR_TEXT,
        showErrorIcon: true,
      })
    );
  }

  return false;
};

export default applyDefaultApiErrorHandlers;
