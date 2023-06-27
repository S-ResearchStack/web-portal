import { createSelector } from '@reduxjs/toolkit';

import { RootState } from 'src/modules/store';

import { userRolesListFromApi } from 'src/modules/auth/userRole';
import { decodeAuthToken } from 'src/modules/auth/utils';
import { signout } from 'src/modules/auth/auth.slice.signout';

export const getUserDataFromAuthToken = (authToken: string | undefined) => {
  if (!authToken) {
    return {};
  }

  try {
    const { email, roles } = decodeAuthToken(authToken);
    return {
      email,
      roles: userRolesListFromApi(roles),
    };
  } catch (err) {
    console.error(`Failed to decode jwt ${err}`);

    signout();

    return {};
  }
};

export const authTokenPayloadSelector = createSelector(
  (state: RootState) => state.auth.authToken,
  (authToken) => getUserDataFromAuthToken(authToken)
);
