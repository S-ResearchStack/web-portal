import { createSelector } from '@reduxjs/toolkit';

import { authTokenPayloadSelector } from 'src/modules/auth/auth.slice.authTokenPayloadSelector';
import { getRoleForStudy } from 'src/modules/auth/userRole';
import { selectedStudyIdSelector } from 'src/modules/studies/studies.slice';

export const userRoleSelector = createSelector(
  [authTokenPayloadSelector, selectedStudyIdSelector],
  (pl, selectedStudyId) => getRoleForStudy(pl.roles || [], selectedStudyId)
);
