import { request } from './apiService';
import { Response } from './executeRequest';
import * as API from './models';
import { SqlRequest, SqlResponse } from './models/sql';
import { GetTablesResponse } from './models';
import { GraphQlRequest, GraphQlResponse } from './models/graphql';

export type ProjectIdParams = { projectId: string };

type SqlRequestParams = {
  projectId: string;
  sql: string | string[];
};

const baseSqlRequest = <R>({ projectId, sql }: SqlRequestParams) =>
  request<SqlRequest, SqlResponse<R>>({
    path: `/api/projects/${projectId}/sql`,
    method: 'POST',
    body: {
      sql: (Array.isArray(sql) ? sql.join(' ') : sql).replaceAll(/ {2,}/g, ' '),
    },
  });

const sqlRequest = async <R>(params: SqlRequestParams): Promise<Response<R[]>> => {
  const res = await baseSqlRequest<R>(params);

  return {
    ...res,
    get data() {
      return res.data?.data || null;
    },
  };
};

type GraphQlRequestParams = {
  projectId: string;
  query: string;
};

const baseGraphQlRequest = <D>({ projectId, query }: GraphQlRequestParams) =>
  request<GraphQlRequest, GraphQlResponse<D>>({
    path: `/api/projects/${projectId}/graphql`,
    method: 'POST',
    body: {
      query,
      variables: {},
    },
  });

const graphQlRequest = async <D>(params: GraphQlRequestParams): Promise<Response<D>> => {
  const res = await baseGraphQlRequest<D>(params);

  return {
    ...res,
    get data() {
      return res?.data?.data;
    },
  };
};

export const signin = (body: API.SigninRequest) =>
  request<API.SigninRequest, API.SigninResponse>({
    path: '/account-service/signin',
    method: 'POST',
    noAuth: true,
    body,
  });

export const signUp = (body: API.SignUpRequest) =>
  request<API.SignUpRequest, void>({
    path: '/account-service/signup',
    method: 'POST',
    noAuth: true,
    body,
  });

export const verifyEmail = (body: API.VerifyEmailRequest) =>
  request<API.VerifyEmailRequest, API.SigninResponse>({
    path: '/account-service/user/email/verify',
    method: 'POST',
    noAuth: true,
    body,
  });

export const resendVerification = (body: API.ResendVerificationEmailRequest) =>
  request<API.ResendVerificationEmailRequest, void>({
    path: '/account-service/verification',
    method: 'POST',
    noAuth: true,
    body,
  });

export const resetPassword = (body: API.ResetPasswordRequest) =>
  request<API.ResetPasswordRequest, void>({
    path: '/account-service/user/password/reset',
    method: 'POST',
    noAuth: true,
    body,
  });

export const getStudies = () =>
  request<void, API.StudyListResponse>({
    path: '/api/projects',
  });

export const createStudy = (body: API.CreateStudyRequest) =>
  request<API.CreateStudyRequest, void>({
    path: '/api/projects',
    method: 'POST',
    body,
  });

export const getUsers = ({ projectId }: { projectId?: string } = {}) =>
  request<void, API.GetUsersResponse>({
    path: '/account-service/users',
    query: { projectId },
  });

export const inviteUser = (body: API.InviteUserRequest) =>
  request<API.InviteUserRequest, void>({
    path: '/account-service/invitations',
    method: 'POST',
    body,
  });

// TODO: check path
export const removeUser = (body: API.RemoveUserRequest) =>
  request<API.RemoveUserRequest, void>({
    path: '/account-service/remove',
    method: 'DELETE',
    body,
  });

export const updateUserRole = (body: API.UpdateUserRoleRequest) =>
  request<API.UpdateUserRoleRequest, void>({
    path: '/account-service/user/roles',
    method: 'PUT',
    body,
  });

export const removeUserRole = (body: API.RemoveUserRoleRequest) =>
  request<API.RemoveUserRoleRequest, void>({
    path: '/account-service/user/roles/remove',
    method: 'POST',
    body,
  });

export const refreshToken = (body: API.RefreshTokenBody) =>
  request<API.RefreshTokenBody, API.RefreshTokenBody>({
    path: '/account-service/token/refresh',
    method: 'POST',
    body,
  });

export const getSurveyResponsesByAge = () =>
  request<void, API.SurveyResponsesByAgeResponse>({
    path: '/survey/by-gender',
  });

export const getSurveyResponsesByGender = () =>
  request<void, API.SurveyResponsesByGenderResponse>({
    path: '/survey/by-age',
  });

export const getEligibilityQualifications = () =>
  request<void, API.EligibilityQualificationsResponse>({
    path: '/eligibility-qualifications',
  });

export const getAvgHeartRateFluctuations = () =>
  request<void, API.AvgHeartRateFluctuationsResponse>({
    path: '/avg-heart-rate-fluctuations',
  });

export const getHealthDataOverview = ({
  projectId,
  limit,
  offset,
  sort,
}: API.HealthDataOverviewParams & ProjectIdParams) =>
  graphQlRequest<API.HealthDataOverviewResponse>({
    projectId,
    query: `{
  healthDataOverview(orderByColumn: ${sort.column}, orderBySort: ${sort.direction}, offset: ${offset}, limit: ${limit}, includeAttributes: ["email"]) {
    userId
    profiles { key value }
    latestAverageHR
    latestTotalStep
    lastSyncTime
  }
}`,
  });

export const getHealthDataOverviewForUser = ({
  projectId,
  userId,
}: { userId: string } & ProjectIdParams) =>
  graphQlRequest<API.HealthDataOverviewOfUserResponse>({
    projectId,
    query: `{
  healthDataOverviewOfUser(userId: "${userId}") {
    userId
    latestAverageHR
    latestAverageSystolicBP
    latestAverageDiastolicBP
    latestTotalStep
    lastSyncTime
    averageSleep
  }
}`,
  });

export const getUserProfilesCount = ({ projectId }: ProjectIdParams) =>
  graphQlRequest<API.CountTableRowsResponse>({
    projectId,
    query: '{ count(tableName: "user_profiles") }',
  });

export const getParticipantHeartRates = ({
  projectId,
  startTime,
  endTime,
}: ProjectIdParams & API.GetParticipantHeartRateRequest) =>
  graphQlRequest<API.RawHealthDataResponse>({
    projectId,
    query: `{
  rawHealthData(from: "${startTime}", to: "${endTime}", includeAttributes: ["gender"]) {
    userId
    profiles { key value }
    healthData { heartRates { time bpm } }
  }
}`,
  });

export const getAverageParticipantHeartRate = ({
  projectId,
  startTime,
  endTime,
}: ProjectIdParams & API.GetAverageParticipantHeartRateRequest) =>
  graphQlRequest<API.AverageHealthDataResponse>({
    projectId,
    query: `{
  averageHealthData(from: "${startTime}", to: "${endTime}", includeAttributes: ["gender", "age"]) {
    userId
    profiles { key value }
    averageHR
    lastSyncTime
  }
}`,
  });

export const getAverageStepCount = ({ projectId }: ProjectIdParams) =>
  sqlRequest<API.AverageStepCountSqlRow>({
    projectId,
    sql: [
      `with`,
      `  steps_per_day as (`,
      `    select steps.user_id as user_id,`,
      `       sum(steps.count) as total_steps,`,
      `       date(end_time) as day,`,
      `       json_extract_scalar(up.profile, '$.gender') as gender`,
      `    from steps`,
      `    join user_profiles up on up.user_id = steps.user_id`,
      `    where end_time < now()`,
      `    group by steps.user_id, date(end_time), json_extract_scalar(up.profile, '$.gender')`,
      `  )`,
      `select avg(spd.total_steps) as steps,`,
      `  spd.gender,`,
      `  dow(spd.day) as day_of_week`,
      `from steps_per_day as spd`,
      `group by spd.gender, dow(spd.day)`,
    ],
  });

export const getTasks = ({ projectId }: ProjectIdParams) =>
  request<void, API.TaskListResponse>({
    path: `/api/projects/${projectId}/tasks`,
  });

export const getTask = ({ projectId, id }: ProjectIdParams & { id: string }) =>
  request<void, [API.Task]>({
    path: `/api/projects/${projectId}/tasks/${id}`,
  });

export const createTask = ({ projectId }: ProjectIdParams) =>
  request<void, API.CreateTaskResponse>({
    method: 'POST',
    path: `/api/projects/${projectId}/tasks`,
  });

export const updateTask = (
  { projectId, id, revisionId }: ProjectIdParams & { id: string; revisionId: number },
  body: API.TaskUpdate
) =>
  request<API.TaskUpdate, void>({
    path: `/api/projects/${projectId}/tasks/${id}`,
    method: 'PATCH',
    body,
    query: {
      revision_id: revisionId,
    },
  });

export const getTaskItemResults = ({ projectId, id }: ProjectIdParams & { id: string }) =>
  graphQlRequest<API.SurveyResponseResponse>({
    projectId,
    query: `{
  surveyResponse(taskId: "${id}", includeAttributes: ["age", "gender"]) {
    itemName
    userId
    result
    profiles { key value }
  }
}`,
  });

export const getTaskCompletionTime = ({ projectId, id }: ProjectIdParams & { id: string }) =>
  graphQlRequest<API.TaskResultsResponse>({
    projectId,
    query: `{
  taskResults(taskId: "${id}") {
    taskId
    completionTime { averageInMS }
  }
}`,
  });

export const getTaskRespondedUsersCount = ({ projectId }: ProjectIdParams) =>
  graphQlRequest<API.TaskResultsResponse>({
    projectId,
    query: `{
  taskResults {
    taskId
    numberOfRespondedUser { count }
  }
}`,
  });

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getParticipantsTimeZones = ({ projectId }: ProjectIdParams) =>
  request<void, string[]>({
    path: `/participants/list`,
    method: 'GET',
  });

export const getTablesList = (projectId: string) =>
  graphQlRequest<GetTablesResponse>({
    projectId,
    query: `{
  tables { name }
}`,
  });

export const getTableColumns = (projectId: string, tableId: string) =>
  graphQlRequest<GetTablesResponse>({
    projectId,
    query: `{
  tables(nameFilter: "${tableId}") { name columns { name type } }
}`,
  });

export const executeDataQuery = (projectId: string, sql: string) =>
  baseSqlRequest<unknown>({
    projectId,
    sql,
  });
