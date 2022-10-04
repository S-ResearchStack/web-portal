import { FailedConnectionError } from 'src/modules/api/executeRequest';
import { showSnackbar } from 'src/modules/snackbar/snackbar.slice';
import { AppDispatch, store } from 'src/modules/store/store';

const applyDefaultApiErrorHandlers = (e: unknown): boolean => {
  if (e instanceof FailedConnectionError) {
    (store.dispatch as AppDispatch)(
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
