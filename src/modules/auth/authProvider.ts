import { AppDispatch } from 'src/modules/store';
import { store } from 'src/modules/store/store';
import API from 'src/modules/api';

import { signout } from './auth.slice';

API.setAuthProvider({
  getBearerToken() {
    return store.getState().auth.authToken;
  },
  onUnauthorizedError() {
    (store.dispatch as AppDispatch)(signout());
  },
});
