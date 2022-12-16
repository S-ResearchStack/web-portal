import { AppDispatch } from 'src/modules/store';
import { store } from 'src/modules/store/store';
import API from 'src/modules/api';

import { signout } from './auth.slice.signout';

API.setAuthProvider({
  getBearerToken() {
    return store.getState().auth.authToken;
  },
  onUnauthorizedError() {
    // eslint-disable-next-line prefer-destructuring
    const dispatch: AppDispatch = store.dispatch;
    dispatch(signout());
  },
});
