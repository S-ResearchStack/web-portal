export type RoleType =
  | 'team-admin'
  | 'principal-investigator'
  | 'research-assistant'
  | 'data-scientist'
  | 'study-creator';

export type UserRole = {
  roles: RoleType[];
  projectId?: string;
};

const globalRoleTypes: Readonly<RoleType[]> = ['team-admin'] as const;

export const allowedRoleTypes: Readonly<RoleType[]> = [
  'team-admin',
  'principal-investigator',
  'research-assistant',
  'data-scientist',
  'study-creator',
] as const;

export const viewRoleTypes: Readonly<RoleType[]> = [
  'principal-investigator',
  'research-assistant',
  'data-scientist',
] as const;

export const roleLabelsMap: Record<RoleType, string> = {
  'team-admin': 'Team Admin',
  'principal-investigator': 'Principal Investigator',
  'research-assistant': 'Research Assistant',
  'data-scientist': 'Data Scientist',
  'study-creator': 'Study Creator',
};

export const isValidRoleType = (rt: string): rt is RoleType =>
  allowedRoleTypes.includes(rt as RoleType);

export const isGlobalRoleType = (role: RoleType) => globalRoleTypes.includes(role);

export const isTeamAdmin = (rt: RoleType[] | undefined) => !!rt?.includes('team-admin');

export const isDataScientist = (rt: RoleType[] | undefined) =>
  rt?.length === 1 && rt[0] === 'data-scientist';

export const isStudyCreator = (rt: RoleType[] | undefined) => !!rt?.includes('study-creator');

export const userRolesListFromApi = (roleStr: string[]) => {
  const result: UserRole[] = [];
  let isUserAdmin = false;

  [...roleStr].forEach((r) => {
    const [projectId, role] = (r.includes(':') ? r : `:${r}`).split(':') as [
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
  const fullAccessRoles = ['team-admin', 'study-creator', 'principal-investigator'];
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

  if (viewRoles.includes('principal-investigator')) {
    currentRole = 'principal-investigator';
  } else if (viewRoles.includes('research-assistant')) {
    currentRole = 'research-assistant';
  } else if (isDataScientist(viewRoles)) {
    currentRole = 'data-scientist';
  }

  return currentRole;
};
