import { AppDispatch, store } from 'src/modules/store/store';
import API from 'src/modules/api';

import { signout } from './auth.slice.signout';
import { updateTokens } from './auth.slice';

API.setAuthProvider({
  getBearerToken() {
    return store.getState().auth.authToken;
  },
  refreshBearerToken: async () => {
    await (store.dispatch as AppDispatch)(updateTokens());
  },
  onUnauthorizedError() {
    signout();
  },
});
