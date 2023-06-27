import { request } from './apiService';
import executeRequest, { Response } from './executeRequest';
import * as API from './models';
import {
  ActivityTaskType,
  CreatePublicationSliceFetchArgs,
  EducationListSliceFetchArgs,
  GetStorageObjectDownloadUrlResponse,
  GetTablesResponse,
  LabVisitItemResponse,
  LabVisitListResponse,
  LabVisitSaveItemRequest,
} from './models';
import { SqlRequest, SqlResponse } from './models/sql';
import { GraphQlRequest, GraphQlResponse } from './models/graphql';
import { ParticipantEnrollmentPeriod } from '../overview/participantEnrollment.slice';
import { LabVisitListFetchArgs } from '../study-management/participant-management/lab-visit/labVisit.slice';
import {
  LabVisitParticipantSuggestionItemRequest,
  LabVisitParticipantSuggestionResponse,
} from './models/labVisit';

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
  request<API.ResetPasswordRequest, API.SigninResponse>({
    path: '/account-service/user/password/reset',
    method: 'POST',
    noAuth: true,
    body,
  });

export const forgotPassword = (body: API.ForgotPasswordRequest) =>
  request<API.ForgotPasswordRequest, void>({
    path: '/account-service/user/password/forgot',
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

export const inviteUsers = (body: API.InviteUsersRequest) =>
  request<API.InviteUsersRequest, void>({
    path: '/account-service/invitations',
    method: 'POST',
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
    noAuth: true,
    body,
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
    latestAverageSystolicBP
    latestAverageDiastolicBP
    latestTotalStep
    lastSyncTime
    averageSleep
    latestAverageSPO2
    latestAverageBG
    latestAverageRR
  }
}`,
  });

export const getHealthDataParticipantIds = ({
  projectId,
  limit,
}: LabVisitParticipantSuggestionItemRequest & ProjectIdParams) =>
  graphQlRequest<LabVisitParticipantSuggestionResponse>({
    projectId,
    query: `{
  healthDataOverview(offset: 0, limit: ${limit}, includeAttributes: ["email"]) {
    userId
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
    latestAverageSPO2
    latestAverageBG
    latestAverageRR
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

export const getTasks = ({ projectId }: ProjectIdParams) =>
  request<void, API.TaskListResponse>({
    path: `/api/projects/${projectId}/tasks`,
    query: {
      type: 'SURVEY',
    },
  });

export const getActivities = ({ projectId }: ProjectIdParams) =>
  request<void, API.ActivityListResponse>({
    path: `/api/projects/${projectId}/tasks`,
    query: {
      type: 'ACTIVITY',
    },
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

export const getTask = ({ projectId, id }: ProjectIdParams & { id: string }) =>
  request<void, [API.Task]>({
    path: `/api/projects/${projectId}/tasks/${id}`,
    query: {
      type: 'SURVEY',
    },
  });

export const getActivityTask = ({ projectId, id }: ProjectIdParams & { id: string }) =>
  request<void, [API.ActivityTask]>({
    path: `/api/projects/${projectId}/tasks/${id}`,
    query: {
      type: 'ACTIVITY',
    },
  });

export const getEducationPublication = ({ projectId, id }: ProjectIdParams & { id: string }) =>
  request<void, [API.Publication]>({
    path: `/api/projects/${projectId}/education/${id}`,
  });

export const createTask = ({ projectId }: ProjectIdParams) =>
  request<{ type: 'SURVEY' }, API.CreateTaskResponse>({
    method: 'POST',
    path: `/api/projects/${projectId}/tasks`,
    body: {
      type: 'SURVEY',
    },
  });

export const createActivityTask = ({ projectId }: ProjectIdParams & { type: ActivityTaskType }) =>
  request<{ type: 'ACTIVITY' }, API.CreateTaskResponse>({
    method: 'POST',
    path: `/api/projects/${projectId}/tasks`,
    body: {
      type: 'ACTIVITY',
    },
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
    keepalive: true,
  });

export const updateActivityTask = (
  { projectId, id, revisionId }: ProjectIdParams & { id: string; revisionId: number },
  body: API.ActivityTaskUpdate
) =>
  request<API.ActivityTaskUpdate, void>({
    path: `/api/projects/${projectId}/tasks/${id}`,
    method: 'PATCH',
    body,
    query: {
      revision_id: revisionId,
    },
    keepalive: true,
  });

export const updateEducationPublication = (
  { projectId, id, revisionId }: ProjectIdParams & { id: string; revisionId: number },
  body: API.Publication
) =>
  request<API.Publication, void>({
    path: `/api/projects/${projectId}/education/${id}`,
    method: 'PATCH',
    body,
    query: {
      revision_id: revisionId,
    },
  });

export const getSurveyTaskItemResults = ({ projectId, id }: ProjectIdParams & { id: string }) =>
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

export const getActivityTaskItemResults = ({ projectId, id }: ProjectIdParams & { id: string }) =>
  graphQlRequest<API.SurveyResponseResponse>({
    projectId,
    query: `{
  surveyResponse(taskId: "${id}", includeAttributes: ["age", "gender"]) {
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

export const getLabVisitsList = ({ projectId }: LabVisitListFetchArgs) =>
  request<LabVisitListFetchArgs, LabVisitListResponse>({
    path: `/api/projects/${projectId}/in-lab-visits`,
  });

export const getParticipantDropout = (id: API.StudyId) =>
  request<API.StudyId, API.ParticipantDropoutData>({
    path: `/api/studies/${id}/dropout`,
    body: id,
  });

export const getParticipantEnrollment = (period?: ParticipantEnrollmentPeriod) =>
  request<void, API.ParticipantEnrollmentResponse>({
    path: '/participant-enrollment',
    query: { period },
  });

export const createLabVisit = ({ projectId, ...body }: LabVisitSaveItemRequest & ProjectIdParams) =>
  request<LabVisitSaveItemRequest, Required<LabVisitItemResponse>>({
    method: 'POST',
    path: `/api/projects/${projectId}/in-lab-visits`,
    body,
  });

export const updateLabVisit = ({ projectId, ...body }: LabVisitSaveItemRequest & ProjectIdParams) =>
  request<LabVisitSaveItemRequest, Required<LabVisitItemResponse>>({
    method: 'PATCH',
    path: `/api/projects/${projectId}/in-lab-visits/${body.id}`,
    body,
  });

export const getPublications = ({ projectId }: EducationListSliceFetchArgs) =>
  request<void, API.EducationListResponse>({
    method: 'GET',
    path: `/api/education/${projectId}`,
  });

export const createPublication = ({ projectId, source }: CreatePublicationSliceFetchArgs) =>
  request<API.CreatePublicationRequestBody, API.CreatePublicationResponse>({
    method: 'POST',
    path: `/api/education/${projectId}/publications`,
    body: { source },
  });

export const getStorageObjects = ({
  projectId,
  path,
}: API.GetStorageObjectsParams & ProjectIdParams) =>
  request<void, API.GetStorageObjectsResponse>({
    method: 'GET',
    path: `/cloud-storage/projects/${projectId}/list`,
    query: { path },
  });

export const getStorageObjectUploadUrl = ({
  projectId,
  objectName,
}: API.GetStorageObjectUploadUrlParams & ProjectIdParams) =>
  request<void, API.GetStorageObjectUploadUrlResponse>({
    method: 'GET',
    path: `/cloud-storage/projects/${projectId}/upload-url`,
    query: {
      object_name: objectName,
    },
    readResponseAsText: true,
  });

export const uploadStorageObject = ({ signedUrl, blob }: { signedUrl: string; blob: File }) =>
  executeRequest<File, void>({
    url: signedUrl,
    method: 'PUT',
    body: blob,
  });

export const deleteStorageObject = ({
  projectId,
  objectName,
}: API.DeleteStorageObjectParams & ProjectIdParams) =>
  request<void, void>({
    method: 'DELETE',
    path: `/cloud-storage/projects/${projectId}/delete`,
    query: { object_name: objectName },
  });

export const downloadStorageObject = ({
  projectId,
  objectName,
}: API.DownloadStoragetObjectParams & ProjectIdParams) =>
  request<void, Blob>({
    method: 'GET',
    path: `/cloud-storage/projects/${projectId}/download`,
    query: { object_name: objectName },
    readResponseAsBlob: true,
  });

export const getStorageObjectDownloadUrl = ({
  projectId,
  objectName,
  expiresAfterSeconds,
}: API.GetStorageObjectDownloadUrlParams & ProjectIdParams) =>
  request<void, GetStorageObjectDownloadUrlResponse>({
    method: 'GET',
    path: `/cloud-storage/projects/${projectId}/download-url`,
    query: {
      object_name: objectName,
      url_duration: expiresAfterSeconds,
    },
    readResponseAsText: true,
  });

export const streamDownloadStorageObject = ({
  projectId,
  objectName,
}: API.DownloadStoragetObjectParams & ProjectIdParams) =>
  request<void, ReadableStream>({
    method: 'GET',
    path: `/cloud-storage/projects/${projectId}/download`,
    query: { object_name: objectName },
    readResponseAsStream: true,
  });
