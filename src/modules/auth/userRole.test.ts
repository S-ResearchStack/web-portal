import {
  getAccessByRole,
  getRoleLabels,
  getRolesForStudy,
  getViewRoleByPriority,
  isTeamAdmin,
  RoleType,
  userRolesListFromApi,
} from './userRole';

describe('userRole', () => {
  describe('isTeamAdmin', () => {
    it('should detect if has team-admin role', () => {
      expect(isTeamAdmin(['team-admin'])).toBeTrue();
      expect(isTeamAdmin(['studyManager'])).toBeFalse();
      expect(isTeamAdmin(['studyResearcher'])).toBeFalse();
    });

    it('[NEGATIVE] should return false if no roles', () => {
      expect(isTeamAdmin([])).toBeFalse();
      expect(isTeamAdmin(undefined)).toBeFalse();
    });
  });

  describe('getAccessByRole', () => {
    it('should handle permissions based on role', () => {
      expect(getAccessByRole(['team-admin'], true)).toEqual({
        allowEdit: true,
        allowRemoveMember: true,
        allowMgmtAccess: true,
        allowInvite: true,
      });
      expect(getAccessByRole(['studyAdmin'], true)).toEqual({
        allowEdit: true,
        allowRemoveMember: true,
        allowMgmtAccess: true,
        allowInvite: true,
      });
      expect(getAccessByRole(['studyManager'], true)).toEqual({
        allowEdit: true,
        allowRemoveMember: true,
        allowMgmtAccess: true,
        allowInvite: true,
      });
      expect(getAccessByRole(['studyResearcher'], false)).toEqual({
        allowEdit: false,
        allowRemoveMember: false,
        allowMgmtAccess: false,
        allowInvite: false,
      });
    });

    it('[NEGATIVE] should return no permissions if no roles', () => {
      expect(getAccessByRole([], false)).toEqual({
        allowEdit: false,
        allowRemoveMember: false,
        allowMgmtAccess: false,
        allowInvite: false,
      });
      expect(getAccessByRole(undefined, false)).toEqual({
        allowEdit: false,
        allowRemoveMember: false,
        allowMgmtAccess: false,
        allowInvite: false,
      });
    });
  });

  describe('getViewRoleByPriority', () => {
    it('should choose role based on priority', () => {
      expect(getViewRoleByPriority(['studyAdmin'])).toEqual('studyAdmin');
      expect(getViewRoleByPriority(['studyManager'])).toEqual('studyManager');
      expect(getViewRoleByPriority(['studyResearcher'])).toEqual('studyResearcher');
    });
    it('[NEGATIVE] should return empty label if no view roles', () => {
      expect(getViewRoleByPriority([])).toEqual('');
      expect(getViewRoleByPriority(['team-admin'])).toEqual('');
    });
  });
  describe('getRolesAndRolesLabels', () => {
    it('should get labels for roles', () => {
      const roles = ['team-admin', 'studyAdmin'] as RoleType[];
      expect(getRoleLabels(roles)).toEqual({
        roleLabels: 'Study Admin',
        rolesCount: 1,
      });
    });
    it('[NEGATIVE] getRolesForStudy if role is team-admin and projectId is not provided', () => {
      const userRolesFromApi = ['team-admin'];

      expect(getRolesForStudy(userRolesListFromApi(userRolesFromApi), undefined)).toEqual({
        roles: ['team-admin'],
        projectId: undefined,
      });
    });
  });
});
