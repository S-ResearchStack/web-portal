import { request } from './apiService';
import { Response } from './executeRequest';
import * as API from './models';
import { SqlRequest, SqlResponse } from './models/sql';
import { GetTableColumnsRow, GetTableListRow } from './models';

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

export const signin = (body: API.SigninRequest) =>
  request<API.SigninRequest, API.SigninResponse>({
    path: '/account-service/signin',
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

const getParticipantsSqlBase = ({ sleep, bp }: { sleep?: boolean; bp?: boolean }) => [
  `with`,
  `  hr_values as (`,
  `    select hr.user_id as user_id,`,
  `           avg(hr.bpm) as avg_hr_bpm`,
  `    from heartrates as hr`,
  `    join user_profiles up on hr.user_id = up.user_id`,
  `    where date(hr.time) = date(up.last_synced_at)`,
  `    group by hr.user_id`,
  `    ),`,
  `  step_values as (`,
  `    select steps.user_id as user_id,`,
  `           sum(steps.count) as total_steps`,
  `    from steps`,
  `    join user_profiles up on steps.user_id = up.user_id`,
  `    where date(steps.end_time) = date(up.last_synced_at)`,
  `    group by steps.user_id`,
  `    )`,
  ...(sleep
    ? [
        `  ,sleep_values as (`,
        `    select user_id,`,
        `           avg(date_diff('minute', start_time, end_time)) as avg_sleep_mins`,
        `    from sleepsessions`,
        `    group by user_id`,
        `    )`,
      ]
    : []),
  ...(bp
    ? [
        `  ,bp_values as (`,
        `    select bp.user_id as user_id,`,
        `           avg(bp.systolic) as avg_bp_systolic,`,
        `           avg(bp.diastolic) as avg_bp_diastolic`,
        `    from blood_pressures as bp`,
        `    join user_profiles up on bp.user_id = up.user_id`,
        `    where date(bp.time) = date(up.last_synced_at)`,
        `    group by bp.user_id`,
        `    )`,
      ]
    : []),
  `select`,
  `  up.user_id as user_id,`,
  `  json_extract_scalar(profile, '$.age') as age,`,
  `  json_extract_scalar(profile, '$.gender') as gender,`,
  `  json_extract_scalar(profile, '$.email') as email,`,
  `  last_synced_at as last_synced,`,
  `  hr_values.avg_hr_bpm as avg_hr_bpm,`,
  `  step_values.total_steps as steps`,
  sleep ? `  ,sleep_values.avg_sleep_mins as avg_sleep_mins` : '',
  bp ? `  ,bp_values.avg_bp_systolic as avg_bp_systolic` : '',
  bp ? `  ,bp_values.avg_bp_diastolic as avg_bp_diastolic` : '',
  `from user_profiles as up`,
  `left join hr_values on hr_values.user_id = up.user_id`,
  `left join step_values on step_values.user_id = up.user_id`,
  sleep ? `left join sleep_values on sleep_values.user_id = up.user_id` : '',
  bp ? `left join bp_values on bp_values.user_id = up.user_id` : '',
];

export const getParticipants = ({
  projectId,
  limit,
  offset,
  sort,
}: API.GetParticipantListRequest & ProjectIdParams) =>
  sqlRequest<API.ParticipantListItemSqlRow>({
    projectId,
    sql: [
      ...getParticipantsSqlBase({}),
      `order by ${sort.column} ${sort.direction} offset ${offset} limit ${limit}`,
    ],
  });

export const getParticipantsTotalItems = ({ projectId }: ProjectIdParams) =>
  sqlRequest<API.ParticipantListTotalItemsSqlRow>({
    projectId,
    sql: `select count(*) as total from user_profiles`,
  });

export const getParticipant = ({ projectId, id }: API.GetParticipantRequest & ProjectIdParams) =>
  sqlRequest<API.ParticipantListItemSqlRow>({
    projectId,
    sql: [...getParticipantsSqlBase({ sleep: true, bp: true }), `where up.user_id = '${id}'`],
  });

export const getParticipantHeartRates = ({
  projectId,
  startTime,
  endTime,
}: ProjectIdParams & API.GetParticipantHeartRateRequest) =>
  sqlRequest<API.ParticipantHeartRateSqlRow>({
    projectId,
    sql: [
      `select hr.user_id, hr.time, hr.bpm as bpm, json_extract_scalar(up.profile, '$.age') as age, json_extract_scalar(up.profile, '$.gender') as gender`,
      `from heartrates hr`,
      `join user_profiles up on up.user_id = hr.user_id`,
      `where hr.time >= TIMESTAMP '${startTime}' and hr.time <= TIMESTAMP '${endTime}'`,
    ],
  });

export const getAverageParticipantHeartRate = ({
  projectId,
  startTime,
  endTime,
}: ProjectIdParams & API.GetAverageParticipantHeartRateRequest) =>
  sqlRequest<API.AverageParticipantHeartRateSqlRow>({
    projectId,
    sql: [
      `select hr.user_id, max(hr.time) as last_synced, avg(hr.bpm) as avg_bpm, json_extract_scalar(up.profile, '$.age') as age, json_extract_scalar(up.profile, '$.gender') as gender`,
      `from heartrates hr`,
      `join user_profiles up on up.user_id = hr.user_id`,
      `where hr.time >= TIMESTAMP '${startTime}' and hr.time <= TIMESTAMP '${endTime}'`,
      `group by hr.user_id, up.profile`,
    ],
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

export const getTaskItemResults = ({
  projectId,
  id,
  revisionId,
}: ProjectIdParams & { id: string; revisionId: number }) =>
  sqlRequest<API.TaskItemResultsSqlRow>({
    projectId,
    sql: [
      `select ir.id as id, ir.task_id as task_id, ir.revision_id as revision_id, ir.user_id as user_id, item_name, result,`,
      `json_extract_scalar(up.profile, '$.age') as age, json_extract_scalar(up.profile, '$.gender') as gender`,
      `from item_results ir`,
      `join user_profiles up on up.user_id = ir.user_id`,
      `where ir.task_id = '${id}' and ir.revision_id = ${revisionId}`,
    ],
  });

export const getTaskCompletionTime = ({
  projectId,
  id,
  revisionId,
}: ProjectIdParams & { id: string; revisionId: number }) =>
  sqlRequest<API.TaskCompletionTimeSqlRow>({
    projectId,
    sql: [
      `select avg(date_diff('millisecond', started_at, submitted_at)) as avg_completion_time_ms`,
      `from task_results `,
      `where task_id = '${id}' and revision_id = ${revisionId}`,
    ],
  });

export const getTaskRespondedUsersCount = ({ projectId }: ProjectIdParams) =>
  sqlRequest<API.TaskRespondedUsersCountSqlRow>({
    projectId,
    sql: [
      `select task_id, count(distinct(tr.user_id)) as num_users_responded from task_results tr`,
      `join user_profiles up on up.user_id = tr.user_id`,
      `group by task_id`,
    ],
  });

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getParticipantsTimeZones = ({ projectId }: ProjectIdParams) =>
  request<void, string[]>({
    path: `/participants/list`,
    method: 'GET',
  });

export const getTablesList = (projectId: string) =>
  sqlRequest<GetTableListRow>({
    projectId,
    sql: `show tables`,
  });

export const getTableColumns = (projectId: string, tableId: string) =>
  sqlRequest<GetTableColumnsRow>({
    projectId,
    sql: `describe ${tableId}`,
  });

export const executeDataQuery = (projectId: string, sql: string) =>
  baseSqlRequest<unknown>({
    projectId,
    sql,
  });
