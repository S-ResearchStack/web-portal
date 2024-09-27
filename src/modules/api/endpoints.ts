import { PaginationParams } from "src/modules/api/models/pagination";
import { isNumber } from "src/common/utils/typeCheck";
import { StudyDataType } from "src/modules/study-data/studyData.enum";
import { request, supersetRequest } from './apiService';
import executeRequest from './executeRequest';
import * as API from './models';
import {
  GetStudyDataFileUploadUrlResponse,
} from './models';
import { LabVisitListFetchArgs } from '../lab-visit/labVisit.slice';
import { StudyRequirementObject } from "../studies/ParticipationRequirement.slice";

export type ProjectIdParams = { projectId: string };
export type StudyIdParams = { studyId: string };
export type IdParams = { id: string };
export type DashboardIdParams = { dashboardId: string };

const getPaginationQuery = (params: PaginationParams): PaginationParams =>
  (isNumber(params.page) && isNumber(params.size)) ? params : {}

export const getStudies = () =>
  request<void, API.StudiesResponse>({
    path: '/studies',
    method: 'GET'
  });

export const createStudy = (body: API.CreateStudyRequest) =>
  request<API.CreateStudyRequest, void>({
    path: '/studies',
    method: 'POST',
    body,
  });

export const getStudy = ({ studyId }: StudyIdParams) =>
  request<void, API.GetStudyResponse>({
    path: `/studies/${studyId}`,
    method: 'GET',
  });

export const updateStudy = (studyId: string, body: API.UpdateStudyRequest) =>
  request<API.UpdateStudyRequest, void>({
    path: `/studies/${studyId}`,
    method: 'PATCH',
    body,
  });

export const setStudyRequirement = (studyId: string, requirement: StudyRequirementObject) =>
  request({
    path: `/studies/${studyId}/requirements`,
    method: 'POST',
    body: requirement,
  })

export const getDataTypes = () =>
  request<void, API.DataTypeResponse>({
    path: '/health-data/types',
    method: 'GET'
  })

export const getStudyDashboard = ({ studyId }: StudyIdParams) =>
  request<void, API.StudyDashboardResponse>({
    path: `/studies/${studyId}/dashboards`,
    method: 'GET'
  })

export const getStudyDataFolders = ({
  studyId, parentId, page, size
}: API.GetStudyDataRequest & PaginationParams) =>
  request<void, API.StudyDataFoldersResponse>({
    path: `/studies/${studyId}/study-data/${parentId}/children`,
    method: `GET`,
    query: {
      studyDataType: StudyDataType.FOLDER,
      ...getPaginationQuery({ page, size })
    }
  })

export const getStudyDataFiles = ({
  studyId, parentId, page, size
}: API.GetStudyDataRequest & PaginationParams) =>
  request<void, API.StudyDataFilesResponse>({
    path: `/studies/${studyId}/study-data/${parentId}/children`,
    method: `GET`,
    query: {
      studyDataType: StudyDataType.FILE,
      ...getPaginationQuery({ page, size })
    }
  })

export const getStudyDataCount = ({
  studyId, parentId, studyDataType
}: API.GetStudyDataRequest & { studyDataType: StudyDataType }) =>
  request<void, API.StudyDataCountResponse>({
    path: `/studies/${studyId}/study-data/${parentId}/children/count`,
    method: 'GET',
    query: { studyDataType }
  })

export const getSubjectInfoList = ({
  studyId,
  includeTaskRecord,
  page,
  size
}: API.GetSubjectInfoListRequest & PaginationParams) =>
  request<void, API.SubjectInfoListResponse>({
    path: `/studies/${studyId}/subjects`,
    method: 'GET',
    query: {
      includeTaskRecord,
      ...getPaginationQuery({ page, size })
    }
  });

export const getSubjectInfoListCount = ({ studyId }: API.GetSubjectInfoListRequest) =>
  request<void, API.StudyDataCountResponse>({
    path: `/studies/${studyId}/subjects/count`,
    method: 'GET',
  });

export const getSessionInfoList = ({
  studyId,
  subjectNumber,
  page,
  size
}: API.GetSessionInfoListRequest & PaginationParams) =>
  request<void, API.SessionInfoListResponse>({
    path: `/studies/${studyId}/subjects/${subjectNumber}/sessions`,
    method: 'GET',
    query: {
      ...getPaginationQuery({ page, size })
    }
  });

export const getSessionInfoListCount = ({ studyId, subjectNumber }: API.GetSessionInfoListRequest) =>
  request<void, API.StudyDataCountResponse>({
    path: `/studies/${studyId}/subjects/${subjectNumber}/sessions/count`,
    method: 'GET',
  });

export const getSessionMetaInfo = ({ studyId, subjectNumber, sessionId }: API.GetSessionMetaInfoRequest) =>
  request<void, string>({
    path: `/studies/${studyId}/subjects/${subjectNumber}/sessions/${sessionId}/metainfo`,
    method: 'GET',
  });

export const getTaskInfoList = ({
  studyId,
  subjectNumber,
  sessionId,
  page,
  size
}: API.GetTaskInfoListRequest & PaginationParams) =>
  request<void, API.TaskInfoListResponse>({
    path: `/studies/${studyId}/subjects/${subjectNumber}/sessions/${sessionId}/tasks`,
    method: 'GET',
    query: {
      ...getPaginationQuery({ page, size })
    }
  })

export const getTaskInfoListCount = ({ studyId, subjectNumber, sessionId }: API.GetTaskInfoListRequest) =>
  request<void, API.StudyDataCountResponse>({
    path: `/studies/${studyId}/subjects/${subjectNumber}/sessions/${sessionId}/tasks/count`,
    method: 'GET',
  })

export const getRawDataInfo = ({
  studyId,
  subjectNumber,
  sessionId,
  taskId,
  page,
  size
}: API.GetRawDataInfoRequest & PaginationParams) =>
  request<void, API.RawDataInfoResponse>({
    path: `/studies/${studyId}/subjects/${subjectNumber}/sessions/${sessionId}/tasks/${taskId}/rawData`,
    method: 'GET',
    query: {
      ...getPaginationQuery({ page, size })
    }
  })

export const getRawDataInfoCount = ({ studyId, subjectNumber, sessionId, taskId }: API.GetRawDataInfoRequest) =>
  request<void, API.StudyDataCountResponse>({
    path: `/studies/${studyId}/subjects/${subjectNumber}/sessions/${sessionId}/tasks/${taskId}/rawData/count`,
    method: 'GET',
  })

export const getStudyDataFileInfo = ({
  studyId,
  subjectNumber,
  sessionId,
  taskId,
  fileName
}: API.GetStudyDataFileInfoRequest) =>
  request<void, API.StudyDataFileInfoResponse>({
    path: `/studies/${studyId}/files/${fileName}`,
    method: 'GET',
    query: {
      subjectNumber,
      sessionId,
      taskId
    }
  })

export const getStudyDataFileInfoList = ({
  studyId,
  subjectNumber,
  sessionId,
  taskId,
  page,
  size
}: API.GetStudyDataFileInfoListRequest & PaginationParams) =>
  request<void, API.StudyDataFileInfoListResponse>({
    path: `/studies/${studyId}/files`,
    method: 'GET',
    query: {
      subjectNumber,
      sessionId,
      taskId,
      page,
      size
    }
  })

export const getStudyDataFileInfoListCount = ({
  studyId,
  subjectNumber,
  sessionId,
  taskId
}: API.GetStudyDataFileInfoListRequest) =>
  request<void, API.StudyDataCountResponse>({
    path: `/studies/${studyId}/files/count`,
    method: 'GET',
    query: {
      subjectNumber,
      sessionId,
      taskId
    }
  })

export const addStudyDataFileInfo = ({
  studyId,
  subjectNumber,
  sessionId,
  taskId,
  fileType,
  fileName,
  publicAccess
}: API.AddStudyDataFileInfoRequest) =>
  request<void, void>({
    path: `/studies/${studyId}/files`,
    method: "POST",
    query: {
      subjectNumber,
      sessionId,
      taskId,
      fileType,
      fileName,
      publicAccess
    }
  })

export const setSubjectStatus = ({ studyId, subjectNumber, status }: API.SetSubjectStatusRequest) =>
  request<void, void>({
    path: `/studies/${studyId}/subjects/${subjectNumber}`,
    method: 'PATCH',
    query: { status }
  })

export const getFileDownloadUrls = ({ studyId, filePaths }: API.GetFileDownloadUrlsRequest) =>
  request<string[], API.Url[]>({
    path: `/studies/${studyId}/files/download-urls`,
    method: 'POST',
    body: filePaths
  })

export const getZippedFileDownloadUrls = ({ studyId, subjectNumbers }: API.GetZippedFileDownloadUrlsRequest) =>
  request<string[], API.Url[]>({
    path: `/studies/${studyId}/zipped-files/download-urls`,
    method: 'POST',
    body: subjectNumbers
  })

export const getBlobFile = (fileUrl: string) =>
  executeRequest<void, File>({
    url: fileUrl,
    readResponseAsBlob: true
  });

export const registerUser = (body: API.RegisterUserRequest) =>
  request<API.RegisterUserRequest, void>({
    path: '/investigators',
    method: 'POST',
    body,
  })

export const getUser = () =>
  request<void, API.GetUserResponse>({
    path: '/investigators/me',
    method: 'GET',
  });

export const inviteUser = (body: API.InviteUserRequest) =>
  request<API.InviteUserRequest, void>({
    path: '/investigators/invite',
    method: 'POST',
    body,
  });

export const getUsers = ({ studyId }: StudyIdParams) =>
  request<void, API.GetUsersResponse>({
    path: '/investigators',
    method: 'GET',
    query: { studyId },
  });

export const inviteUsers = (body: API.InviteUsersRequest) =>
  request<API.InviteUsersRequest, void>({
    path: '/account-service/invitations',
    method: 'POST',
    body,
  });

export const updateUserRole = (userId: string, body: API.UpdateUserRoleRequest) =>
  request<API.UpdateUserRoleRequest, void>({
    path: `/investigators/${userId}/roles`,
    method: 'PATCH',
    body,
  });

export const removeUserRole = (userId: string, body: API.RemoveUserRoleRequest) =>
  request<API.RemoveUserRoleRequest, void>({
    path: `/investigators/${userId}/roles`,
    method: 'DELETE',
    body,
  });

export const getSurveys = ({ studyId }: StudyIdParams) =>
  request<void, API.SurveyListResponse>({
    path: `/studies/${studyId}/tasks`,
    query: {
      type: 'SURVEY',
    },
  });

export const getActivities = (
  { studyId }: StudyIdParams
) =>
  request<void, API.ActivityListResponse>({
    path: `/studies/${studyId}/tasks`,
    query: {
      type: 'ACTIVITY',
    },
  });

export const getSurvey = (
  { studyId, id }: StudyIdParams & IdParams
) =>
  request<void, API.SurveyResponse>({
    path: `/studies/${studyId}/tasks/${id}`,
  });

export const getActivity = (
  { studyId, id }: StudyIdParams & IdParams
) =>
  request<void, API.ActivityResponse>({
    path: `/studies/${studyId}/tasks/${id}`,
  });

export const createSurvey = (
  { studyId }: StudyIdParams,
  body: API.Survey
) =>
  request<API.Survey, void>({
    path: `/studies/${studyId}/tasks`,
    method: 'POST',
    body,
  });

export const createActivity = (
  { studyId }: StudyIdParams,
  body: API.Activity
) =>
  request<API.Activity, void>({
    path: `/studies/${studyId}/tasks`,
    method: 'POST',
    body,
  });

export const updateSurvey = (
  { studyId, id }: StudyIdParams & IdParams,
  body: API.Survey
) =>
  request<API.Survey, void>({
    path: `/studies/${studyId}/tasks/${id}`,
    method: 'PATCH',
    body,
    keepalive: true,
  });

export const updateActivity = (
  { studyId, id }: StudyIdParams & IdParams,
  body: API.Activity
) =>
  request<API.Activity, void>({
    path: `/studies/${studyId}/tasks/${id}`,
    method: 'PATCH',
    body,
    keepalive: true,
  });

export const getEducations = ({ studyId }: StudyIdParams) =>
  request<void, API.EducationalListResponse>({
    method: 'GET',
    path: `/studies/${studyId}/educational-contents`,
  });

export const createEducation = ({ studyId }: StudyIdParams, body: API.EducationalCreateRequest) =>
  request<API.EducationalCreateRequest, API.EducationalCreateResponse>({
    path: `/studies/${studyId}/educational-contents`,
    method: 'POST',
    body,
  });

export const getEducation = ({ studyId, educationId }: StudyIdParams & { educationId: string }) =>
  request<void, API.EducationalResponse>({
    path: `/studies/${studyId}/educational-contents/${educationId}`,
    method: 'GET',
  });

export const updateEducation = (
  { studyId, educationId }: StudyIdParams & { educationId: string },
  body: API.EducationalUpdateRequest
) =>
  request<API.EducationalUpdateRequest, void>({
    path: `/studies/${studyId}/educational-contents/${educationId}`,
    method: 'PATCH',
    body,
  });

export const deleteEducation = ({
  studyId,
  educationId,
}: StudyIdParams & { educationId: string }) =>
  request<void, void>({
    method: 'DELETE',
    path: `/studies/${studyId}/educational-contents/${educationId}`,
  });

export const getPaticipantSuggestions = ({ studyId }: StudyIdParams) =>
  request<void, API.PaticipantSuggestionListResponse>({
    path: `/studies/${studyId}/paticipants`,
  });

export const getResearcherSuggestions = ({ studyId }: StudyIdParams) =>
  request<void, API.ResearcherSuggestionListResponse>({
    path: `/studies/${studyId}/researchers`,
  });

export const getLabVisits = ({ studyId, sort, filter }: LabVisitListFetchArgs) =>
  request<void, API.LabVisitListResponse>({
    path: `/studies/${studyId}/in-lab-visits`,
    query: {
      page: filter.page,
      size: filter.size,
      sortBy: sort.column,
      orderBy: sort.direction
    }
  });

export const createLabVisit = ({ studyId }: StudyIdParams, body: API.LabVisitSaveItemRequest) =>
  request<API.LabVisitSaveItemRequest, API.LabVisitItemResponse>({
    method: 'POST',
    path: `/studies/${studyId}/in-lab-visits`,
    body,
  });

export const updateLabVisit = ({ studyId, visitId }: StudyIdParams & { visitId: number }, body: API.LabVisitSaveItemRequest) =>
  request<API.LabVisitSaveItemRequest, API.LabVisitItemResponse>({
    method: 'PATCH',
    path: `/studies/${studyId}/in-lab-visits/${visitId}`,
    body,
  });

export const getUploadUrl = ({ studyId }: StudyIdParams, query: API.GetUploadUrlParams) =>
  request<void, API.GetStorageObjectUploadUrlResponse>({
    method: 'GET',
    path: `/studies/${studyId}/files/upload-url`,
    query,
  });

export const uploadStorageObject = ({ signedUrl, blob }: { signedUrl: string; blob: File }, headers?: Record<string, string>) =>
  executeRequest<File, void>({
    url: signedUrl,
    method: 'PUT',
    body: blob,
    headers,
  });

export const getDownloadStudyDataUrl = ({
  studyId
}: API.GetStudyDataRequest) =>
  request<void, string>({
    method: 'GET',
    path: `/files/studies/${studyId}/download-url`
  })

export const getDownloadSubjectDataUrl = ({
  studyId,
  subjectNumber
}: API.GetSubjectDataRequest) =>
  request<void, string>({
    method: 'GET',
    path: `/files/studies/${studyId}/subjects/${subjectNumber}/download-url`
  })

export const getStudyDataFileUploadUrl = ({
  studyId,
  sessionId,
  subjectNumber,
  taskId,
  fileName,
  publicAccess
}: API.GetStudyDataFileUploadUrlRequest) =>
  request<void, GetStudyDataFileUploadUrlResponse>({
    method: 'GET',
    path: `/studies/${studyId}/files/upload-url`,
    query: {
      sessionId,
      subjectNumber,
      taskId,
      fileName,
      publicAccess
    }
  })

// TODO: remove explicit login logic (add to access token refresh logic)
export const loginSuperset = () =>
  supersetRequest<API.LoginSupersetRequest, API.LoginSupersetResponse>({
    method: 'POST',
    path: `/api/v1/security/login`,
    body: {
      username: process.env.SUPERSET_ID,
      password: process.env.SUPERSET_PASSWORD,
      provider: "db",
      refresh: false
    }
  });

// TODO: remove access token parameter (auto refresh)
export const getSupersetGuestToken = (accessToken: string, body: API.GetSupersetGuestTokenRequest) =>
  supersetRequest<API.GetSupersetGuestTokenRequest, API.GetSupersetGuestTokenResponse>({
    method: 'POST',
    path: `/api/v1/security/guest_token/`,
    bearerToken: accessToken,
    body
  });

export const signin = (body: API.SigninRequest) =>
  request<API.SigninRequest, API.SigninResponse>({
    path: '/auth/signin',
    method: 'POST',
    noAuth: true,
    body,
  });

export const signup = (body: API.SignUpRequest) =>
  request<API.SignUpRequest, void>({
    path: '/auth/signup',
    method: 'POST',
    noAuth: true,
    body,
  });

export const refreshToken = (body: API.RefreshTokenBody) =>
  request<API.RefreshTokenBody, API.RefreshTokenBody>({
    path: '/auth/refresh',
    method: 'POST',
    noAuth: true,
    body,
  });

export const getGoogleToken = (code: string) =>
  request<string, API.GoogleTokenResponse>({
    path: '/auth/google/token',
    method: "GET",
    noAuth: true,
    query: { code }
  });

export const refreshGoogleToken = (body: API.RefreshGoogleTokenBody) =>
  request<API.RefreshGoogleTokenBody, API.RefreshGoogleTokenResponse>({
    path: '/auth/google/token/refresh',
    method: 'POST',
    noAuth: true,
    body,
  });

export const getListDatabase = ({ studyId }: StudyIdParams,) =>
  request<void, string[]>({
    method: 'GET',
    path: `/studies/${studyId}/databases`,
  });

export const getListTable = (
  { studyId, database }: StudyIdParams & API.GetListTableRequestParam
) =>
  request<void, string[]>({
    method: 'GET',
    path: `/studies/${studyId}/databases/${database}/tables`,
  });

export const executeChartDataQuery = (
  { studyId }: StudyIdParams,
  body: API.ChartSource
) =>
  request<API.DataQueryRequest, API.DataQueryResponse>({
    method: 'POST',
    path: `/studies/${studyId}/databases/${body.database}/query`,
    body: {
      query: body.query
    },
  });

export const createDashboard = (
  { studyId }: StudyIdParams,
  body: API.AddDashboardRequest
) =>
  request<API.AddDashboardRequest, API.AddDashboardResponse>({
    method: 'POST',
    path: `/studies/${studyId}/dashboards`,
    body,
  });

export const updateDashboard = (
  { studyId, id }: StudyIdParams & IdParams,
  body: API.UpdateDashboardRequest
) =>
  request<API.UpdateDashboardRequest, void>({
    method: 'PATCH',
    path: `/studies/${studyId}/dashboards/${id}`,
    body,
  });

export const deleteDashboard = (
  { studyId, id }: StudyIdParams & IdParams
) =>
  request<void, void>({
    method: 'DELETE',
    path: `/studies/${studyId}/dashboards/${id}`,
  });

export const getDashboard = (
  { studyId, id }: StudyIdParams & IdParams
) =>
  request<void, API.ChartResponse>({
    method: 'GET',
    path: `/studies/${studyId}/dashboards/${id}`,
  });

export const getDashboardList = (
  { studyId }: StudyIdParams
) =>
  request<void, API.DashboardListResponse>({
    method: 'GET',
    path: `/studies/${studyId}/dashboards`,
  });

export const createChart = (
  { studyId, dashboardId }: StudyIdParams & DashboardIdParams,
  body: API.AddChartRequest
) =>
  request<API.AddChartRequest, API.AddChartResponse>({
    method: 'POST',
    path: `/studies/${studyId}/dashboards/${dashboardId}/charts`,
    body,
  });

export const updateChart = (
  { studyId, dashboardId, id }: StudyIdParams & DashboardIdParams & IdParams,
  body: API.UpdateChartRequest
) =>
  request<API.UpdateChartRequest, void>({
    method: 'PATCH',
    path: `/studies/${studyId}/dashboards/${dashboardId}/charts/${id}`,
    body,
  });

export const deleteChart = (
  { studyId, dashboardId, id }: StudyIdParams & DashboardIdParams & IdParams
) =>
  request<void, void>({
    method: 'DELETE',
    path: `/studies/${studyId}/dashboards/${dashboardId}/charts/${id}`,
  });

export const getChart = (
  { studyId, dashboardId, id }: StudyIdParams & DashboardIdParams & IdParams
) =>
  request<void, API.ChartResponse>({
    method: 'GET',
    path: `/studies/${studyId}/dashboards/${dashboardId}/charts/${id}`,
  });

export const getChartList = (
  { studyId, dashboardId }: StudyIdParams & DashboardIdParams
) =>
  request<void, API.ChartListResponse>({
    method: 'GET',
    path: `/studies/${studyId}/dashboards/${dashboardId}/charts`,
  });
