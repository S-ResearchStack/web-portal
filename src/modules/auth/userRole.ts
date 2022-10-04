export type UserRole = {
  role: 'team-admin' | 'researcher' | 'project-owner';
  projectId?: string;
};

export type RoleType = UserRole['role'];

export const allowedRoleTypes: Readonly<RoleType[]> = [
  'team-admin',
  'researcher',
  'project-owner',
] as const;

export const isValidRoleType = (rt: string): rt is RoleType =>
  allowedRoleTypes.includes(rt as RoleType);

const globalRoleTypes: Readonly<RoleType[]> = ['team-admin'] as const;

export const isGlobalRoleType = (role: RoleType) => globalRoleTypes.includes(role);

export const roleFromApi = (roleStr: string) => {
  const [projectId, role] = (roleStr.includes(':') ? roleStr : `:${roleStr}`).split(':');
  if (!isValidRoleType(role)) {
    console.warn(`Invalid role ${roleStr}`);
    return undefined;
  }
  if (!isGlobalRoleType(role as RoleType) && !projectId) {
    console.warn(`Project required for role ${roleStr}`);
    return undefined;
  }

  return {
    role,
    projectId: projectId || undefined,
  } as UserRole;
};

export const rolesListFromApi = (roles: string[]): UserRole[] =>
  roles.map(roleFromApi).filter(Boolean) as UserRole[];

export const roleToApi = (role: UserRole) =>
  isGlobalRoleType(role.role) ? role.role : `${role.projectId}:${role.role}`;

export const getRoleForStudy = (
  roles: UserRole[],
  studyId: string | undefined
): UserRole | undefined =>
  roles.find((r) => isGlobalRoleType(r.role)) || roles.find((r) => r.projectId === studyId);

export const getRoleLabel = (role: UserRole) =>
  ({ 'team-admin': 'Team Admin', researcher: 'Researcher', 'project-owner': 'Project Owner' }[
    role.role
  ]);

export const getRoleFunction = (role: RoleType) =>
  role === 'researcher' ? 'principal_investigator' : 'study_operator';
