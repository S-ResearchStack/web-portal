import { createSelector } from '@reduxjs/toolkit';

import { authTokenPayloadSelector } from 'src/modules/auth/auth.slice.authTokenPayloadSelector';
import { getRolesForStudy } from 'src/modules/auth/userRole';
import { selectedStudyIdSelector } from 'src/modules/studies/studies.slice';

export const userRoleSelector = createSelector(
  [authTokenPayloadSelector, selectedStudyIdSelector],
  (pl, selectedStudyId) => getRolesForStudy(pl?.roles || [], selectedStudyId)
);
