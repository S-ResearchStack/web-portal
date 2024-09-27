// TODO: additional role types (System admin, System manager, Researcher ?)

export type RoleType =
  | 'team-admin'
  | 'studyAdmin'
  | 'studyManager'
  | 'studyResearcher'

export type UserRole = {
  roles: RoleType[];
  projectId?: string;
};

const globalRoleTypes: Readonly<RoleType[]> = ['team-admin'] as const;

export const allowedRoleTypes: Readonly<RoleType[]> = [
  'team-admin',
  'studyAdmin',
  'studyManager',
  'studyResearcher'
] as const;

export const viewRoleTypes: Readonly<RoleType[]> = [
  'studyAdmin',
  'studyManager',
  'studyResearcher'
] as const;

export const roleLabelsMap: Record<RoleType, string> = {
  'team-admin': 'System Admin',
  'studyAdmin': 'Study Admin',
  'studyManager': 'Study Manager',
  'studyResearcher': 'Study Researcher'
};

export const rolePriorityMap: Record<RoleType, number> = {
  'team-admin': -1,
  'studyAdmin': 0,
  'studyManager': 1,
  'studyResearcher': 2
}

export const isValidRoleType = (rt: string): rt is RoleType =>
  allowedRoleTypes.includes(rt as RoleType);

export const isGlobalRoleType = (role: RoleType) => globalRoleTypes.includes(role);

export const isTeamAdmin = (rt: RoleType[] | undefined) => !!rt?.includes('team-admin');

// TODO: disable multiple roles
export const isStudyAdmin =  (rt: RoleType[] | undefined) => !!rt?.includes('studyAdmin');
export const isStudyManager = (rt: RoleType[] | undefined) => !!rt?.includes('studyManager');
export const isDataScientist = (rt: RoleType[] | undefined) => !!rt?.includes('studyResearcher');

export const userRolesListFromApi = (roleStr: string[]) => {
  const result: UserRole[] = [];
  let isUserAdmin = false;

  // TODO: reconfigure after backend implementation
  if(!roleStr) {
    result.push({ projectId: undefined, roles: ['team-admin' as RoleType] })
    return result
  }

  [...roleStr].forEach((r) => {
    const [projectId, role] = (r.includes('_') ? r : `_${r}`).split('_') as [
      string | undefined,
      RoleType
    ];
    if (isValidRoleType(role) && projectId) {
      const userRole = result.find((ur) => ur.projectId === projectId);
      if (userRole) {
        if (!userRole.roles.includes(role)) {
          userRole.roles.push(role);
        }
      } else {
        result.push({
          projectId,
          roles: [role],
        });
      }
    }
    if (isGlobalRoleType(role) && !projectId) {
      isUserAdmin = true;
      result.push({
        projectId: undefined,
        roles: [role],
      });
    }
    if (!isValidRoleType(role)) {
      console.warn(`Invalid role ${r}`);
    }
    if (!isGlobalRoleType(role) && !projectId) {
      console.warn(`Project required for role ${r}`);
    }
  });

  if (isUserAdmin) {
    result.forEach(({ roles }) => {
      if (!roles.includes('team-admin')) {
        roles.push('team-admin');
      }
    });
  }

  return result;
};

export const roleToApi = (ur: UserRole) =>
  ur.roles.map((r) => (isGlobalRoleType(r) ? r : `${ur.projectId}:${r}`));

export const getRolesForStudy = (
  userRoles: UserRole[],
  studyId: string | undefined
): UserRole | undefined => {
  if (userRoles.length === 1) {
    const { roles, projectId } = userRoles[0];
    if (roles.length === 1 && roles[0] === 'team-admin' && projectId === undefined) {
      return userRoles[0];
    }
  }
  return userRoles.find(({ projectId }) => projectId === studyId);
};

export const getRoleLabels = (
  roles: RoleType[] | undefined
): { roleLabels: string; rolesCount: number } => {
  const filteredRoles = roles?.filter((r) => viewRoleTypes.includes(r));

  let roleLabels = '';

  if (filteredRoles?.length && roles?.length) {
    roleLabels = filteredRoles.map((r) => roleLabelsMap[r]).join(';\n');
  }

  return { roleLabels, rolesCount: filteredRoles?.length || 0 };
};

export type MembersAccessActions =
  | 'allowEdit'
  | 'allowRemoveMember'
  | 'allowMgmtAccess'
  | 'allowInvite';

export const getAccessByRole = (
  roles: RoleType[] | undefined,
  mgmtAccess: boolean
): Record<MembersAccessActions, boolean> => {
  const fullAccessRoles = ['team-admin', 'studyAdmin', 'studyManager'];
  const isFullAccessRole = roles?.some((r) => fullAccessRoles.includes(r));

  if (!roles || !roles.length) {
    console.warn(`Invalid user role`);
    return {
      allowEdit: false,
      allowRemoveMember: false,
      allowMgmtAccess: false,
      allowInvite: false,
    };
  }
  if (isFullAccessRole) {
    return {
      allowEdit: true,
      allowRemoveMember: true,
      allowMgmtAccess: true,
      allowInvite: true,
    };
  }
  return {
    allowEdit: false,
    allowRemoveMember: false,
    allowMgmtAccess: false,
    allowInvite: mgmtAccess,
  };
};

export const getViewRoleByPriority = (roles: RoleType[]) => {
  let currentRole = '';
  const viewRoles = roles.filter((r) => viewRoleTypes.includes(r));
  if(isStudyAdmin(viewRoles)) {
    currentRole = 'studyAdmin'
  } else if (isStudyManager(viewRoles)) {
    currentRole = 'studyManager'
  } else if (isDataScientist(viewRoles)) {
    currentRole = 'studyResearcher'
  }

  return currentRole;
};
