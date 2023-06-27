import { getAccessByRole, getViewRoleByPriority, isStudyCreator, isTeamAdmin } from './userRole';

describe('userRole', () => {
  describe('isTeamAdmin', () => {
    it('should detect if has team-admin role', () => {
      expect(isTeamAdmin(['principal-investigator', 'team-admin'])).toBeTrue();
      expect(isTeamAdmin(['team-admin'])).toBeTrue();
      expect(isTeamAdmin(['study-creator'])).toBeFalse();
      expect(isTeamAdmin(['study-creator', 'data-scientist'])).toBeFalse();
    });

    it('[NEGATIVE] should return false if no roles', () => {
      expect(isTeamAdmin([])).toBeFalse();
      expect(isTeamAdmin(undefined)).toBeFalse();
    });
  });

  describe('isStudyCreator', () => {
    it('should detect if has study-creator role', () => {
      expect(isStudyCreator(['principal-investigator', 'study-creator'])).toBeTrue();
      expect(isStudyCreator(['study-creator'])).toBeTrue();
      expect(isStudyCreator(['team-admin'])).toBeFalse();
      expect(isStudyCreator(['team-admin', 'data-scientist'])).toBeFalse();
    });

    it('[NEGATIVE] should return false if no roles', () => {
      expect(isStudyCreator([])).toBeFalse();
      expect(isStudyCreator(undefined)).toBeFalse();
    });
  });

  describe('getAccessByRole', () => {
    it('should handle permissions based on role', () => {
      expect(getAccessByRole(['research-assistant', 'team-admin'], true)).toEqual({
        allowEdit: true,
        allowRemoveMember: true,
        allowMgmtAccess: true,
        allowInvite: true,
      });
      expect(getAccessByRole(['study-creator'], true)).toEqual({
        allowEdit: true,
        allowRemoveMember: true,
        allowMgmtAccess: true,
        allowInvite: true,
      });
      expect(getAccessByRole(['principal-investigator'], true)).toEqual({
        allowEdit: true,
        allowRemoveMember: true,
        allowMgmtAccess: true,
        allowInvite: true,
      });
      expect(getAccessByRole(['research-assistant'], false)).toEqual({
        allowEdit: false,
        allowRemoveMember: false,
        allowMgmtAccess: false,
        allowInvite: false,
      });
      expect(getAccessByRole(['data-scientist'], false)).toEqual({
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
      expect(
        getViewRoleByPriority(['study-creator', 'principal-investigator', 'research-assistant'])
      ).toEqual('principal-investigator');
      expect(getViewRoleByPriority(['study-creator', 'team-admin', 'research-assistant'])).toEqual(
        'research-assistant'
      );
      expect(getViewRoleByPriority(['study-creator', 'data-scientist'])).toEqual('data-scientist');
    });
    it('[NEGATIVE] should return empty label if no view roles', () => {
      expect(getViewRoleByPriority([])).toEqual('');
      expect(getViewRoleByPriority(['team-admin'])).toEqual('');
    });
  });
});
