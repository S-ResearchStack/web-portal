import { AppDispatch, store } from 'src/modules/store/store';
import API from 'src/modules/api';

import {signOut, updateTokens} from './auth.slice';

API.setAuthProvider({
  getTokenType() {
    return store.getState().auth.jwtType;
  },
  getBearerToken() {
    return store.getState().auth.authToken;
  },
  refreshBearerToken: async () => {
    await (store.dispatch as AppDispatch)(updateTokens());
  },
  onUnauthorizedError() {
    signOut();
  },
});
