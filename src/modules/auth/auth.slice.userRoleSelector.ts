import { createSelector } from '@reduxjs/toolkit';
import { useSelector } from 'react-redux';

import { getRolesForStudy } from 'src/modules/auth/userRole';
import { selectedStudyIdSelector } from 'src/modules/studies/studies.slice';
import { userRoleSelector } from "src/modules/auth/auth.slice";

export const userRoleForStudySelector = createSelector(
  [userRoleSelector, selectedStudyIdSelector],
  (roles, selectedStudyId) => getRolesForStudy(roles || [], selectedStudyId)
);

export const isStudyResearcher = () => {
  const userRoles = useSelector(userRoleForStudySelector)?.roles;
  return !!userRoles && !!userRoles.includes('studyResearcher');
};
