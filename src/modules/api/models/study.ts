export type StudyId = {
  value: string;
};

export type Study = {
  id: StudyId;
  name: string;
  info: {
    color?: string;
  };
  isOpen: boolean;
  createdAt: string;
};

export type StudyListResponse = Study[];

export type CreateStudyRequest = Pick<Study, 'name' | 'info'>;

type UserInvitation = {
  email: string;
  roles: string[];
  mgmtAccess: boolean;
};

export type InviteUsersRequest = UserInvitation[];

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
  mgmtAccess: boolean;
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

export type DropoutTimePeriod = 'allTime' | 'month' | 'week' | 'day';

type DropoutPeriodData = Record<DropoutTimePeriod, { withdrawals: number; trend?: number }>;

export type ParticipantDropoutData = {
  periods: DropoutPeriodData;
  enrolledAt: number;
};
