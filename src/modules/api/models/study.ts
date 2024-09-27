import { GetUserResponse } from "src/modules/api";

export type Study = {
  id: string;
  participationCode?: string;
  studyInfoResponse: StudyInfo;
  irbInfoResponse: IrbInfo;
  createdAt?: string;
};

export type BasicInfoObject = {
  imageURL: string,
  logoURL: string,
  name: string,
  id: string,
  description?: string,
  organization: string,
  stage: string,
  scope: string,
  period: string,
  duration: string,
  participationCode?: string,
  participationApprovalType: string,
  requirements: string[],
  investigationDevice?: string,
  referenceDevice?: string,
  startDate: string,
  endDate: string,
  totalDuration: string,
}

export type DataType = {
  name: string,
  types: string[]
}

export type StudyInfo = {
  name: string;
  description?: string;
  participationApprovalType: string;
  scope: string;
  stage: string;
  logoUrl: string;
  imageUrl: string;
  organization: string;
  duration: string;
  period: string;
  requirements?: string[];
  startDate?: string,
  endDate?: string,
};

export type StudyDashboard = {
  dashboardId: string;
  embedId: string;
}

export type IrbInfo = {
  decisionType: string;
  decidedAt: string;
  expiredAt: string;
};

export type StudiesResponse = Study[];

export type DataTypeResponse = DataType[];
export type GetStudyResponse = Study;

export type StudyDashboardResponse = StudyDashboard;

export type ParticipationApprovalType = "AUTO" | "MANUAL"
export type StudyScope = "PUBLIC" | "PRIVATE"
export type StudyStage = "CREATED" | "STARTED_OPEN" | "STARTED_CLOSED" | "STOPPED_REQUEST" | "STOPPED_FORCE" | "COMPLETED"
export type IrbDecisionType = "EXEMPT" | "APPROVED";
export type CreateStudyRequest = {
  name: string,
  id: string,
  participationCode?: string,
  description?: string,
  participationApprovalType: ParticipationApprovalType,
  scope: StudyScope,
  stage: string,
  logoUrl?: string,
  imageUrl?: string,
  organization: string,
  duration: string,
  period: string,
  requirements: string[],
  irbDecisionType: IrbDecisionType,
  irbDecidedAt?: Date,
  irbExpiredAt?: Date,
  targetSubject?: number,
  startDate?: string,
  endDate?: string,
}

export type UpdateStudyRequest = Omit<CreateStudyRequest, "id">;

export type InviteUserRequest = {
  email: string,
  studyId: string,
  role: string
}

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

export type GetUsersResponse = GetUserResponse[];

export type UpdateUserRoleRequest = {
  studyId: string,
  role: string
};

export type RemoveUserRoleRequest = {
  studyId: string
};

export type DropoutTimePeriod = 'allTime' | 'month' | 'week' | 'day';

type DropoutPeriodData = Record<DropoutTimePeriod, { withdrawals: number; trend?: number }>;

export type ParticipantDropoutData = {
  periods: DropoutPeriodData;
  enrolledAt: number;
};
