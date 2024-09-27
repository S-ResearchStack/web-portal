import { AppDispatch } from "../store";
import { store } from "../store/store";
import applyDefaultApiErrorHandlers from "./applyDefaultApiErrorHandlers";
import { FailedConnectionError } from "./executeRequest";

let dispatch: AppDispatch;

beforeEach(() => {
  dispatch = store.dispatch;
});

const throwNewFailedConnectionError = () => {
  throw new FailedConnectionError('Error');
}

describe('applyDefaultApiErrorHandlers', () => {
  jest.mock('src/modules/snackbar/snackbar.slice', () => ({
    showSnackbar: jest.fn()
  }));

  it('should handle FailedConnectionError', async () => {
    expect.assertions(1);
    try {
      throwNewFailedConnectionError();
    } catch (error) {
      const isOk = applyDefaultApiErrorHandlers(error, dispatch);

      expect(isOk).toBeTruthy();
    }
  });

  it('[NEGATIVE] should handle generic errors with showGenericServerError true', async () => {
    const error = new Error('Something went wrong');
    const isOk = applyDefaultApiErrorHandlers(error, dispatch, true);

    expect(isOk).toBeFalsy();
  });

  it('[NEGATIVE] should handle generic errors with showGenericServerError false', async () => {
    const error = new Error('Something went wrong');
    const isOk = applyDefaultApiErrorHandlers(error, dispatch);

    expect(isOk).toBeFalsy();

  });
});