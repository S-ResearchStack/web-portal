import { createSelector } from '@reduxjs/toolkit';

import { RootState } from 'src/modules/store';

import { rolesListFromApi } from 'src/modules/auth/userRole';
import {
  decodeAuthToken,
  STORAGE_TOKEN_KEY,
  STORAGE_REFRESH_TOKEN_KEY,
} from 'src/modules/auth/utils';

export const authTokenPayloadSelector = createSelector(
  (state: RootState) => state.auth.authToken,
  (authToken) => {
    if (!authToken) {
      return {};
    }

    try {
      const { email, roles } = decodeAuthToken(authToken);
      return {
        email,
        roles: rolesListFromApi(roles),
      };
    } catch (err) {
      console.error(`Failed to decode jwt ${err}`);

      // TODO: better way to sign out?
      // we can use dispatch from store directly, but for now it's fine as is
      localStorage.removeItem(STORAGE_TOKEN_KEY);
      localStorage.removeItem(STORAGE_REFRESH_TOKEN_KEY);
      window.location.reload();

      return {};
    }
  }
);
