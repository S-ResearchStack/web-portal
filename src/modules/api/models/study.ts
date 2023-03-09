export type Study = {
  id: {
    value: string;
  };
  name: string;
  info: {
    color?: string;
  };
  isOpen: boolean;
};

export type StudyListResponse = Study[];

export type CreateStudyRequest = Pick<Study, 'name' | 'info'>;

export type InviteUserRequest = {
  email: string;
  roles: string[];
}[];

export type UserProfile = {
  name?: string;
  status?: string;
};

export type RemoveUserRequest = {
  accountId: string;
};

export type GetUsersUserInfo = {
  id: string;
  email: string;
  roles: string[];
  profile?: UserProfile;
};

export type GetUsersResponse = GetUsersUserInfo[];

export type UpdateUserRoleRequest = {
  accountId: string;
  roles: string[];
};

export type RemoveUserRoleRequest = {
  accountId: string;
  roles: string[];
};
