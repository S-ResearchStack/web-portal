import {
  signin,
  signUp,
  verifyEmail,
  resendVerification,
  resetPassword,
  forgotPassword,
  getStudies,
  createStudy,
  getUsers,
  inviteUsers,
  updateUserRole,
  removeUserRole,
  refreshToken,
  getHealthDataOverview,
  getHealthDataParticipantIds,
  getHealthDataOverviewForUser,
  getUserProfilesCount,
  getParticipantHeartRates,
  getAverageParticipantHeartRate,
  getTasks,
  getActivities,
  getTaskRespondedUsersCount,
  getTask,
  getActivityTask,
  getEducationPublication,
  createTask,
  createActivityTask,
  updateTask,
  updateActivityTask,
  updateEducationPublication,
  getSurveyTaskItemResults,
  getActivityTaskItemResults,
  getTaskCompletionTime,
  getTablesList,
  getTableColumns,
  executeDataQuery,
  getLabVisitsList,
  getParticipantDropout,
  getParticipantEnrollment,
  createLabVisit,
  updateLabVisit,
  getPublications,
  createPublication,
  getStorageObjects,
  getStorageObjectUploadUrl,
  uploadStorageObject,
  deleteStorageObject,
  downloadStorageObject,
  getStorageObjectDownloadUrl,
  streamDownloadStorageObject,
} from 'src/modules/api/endpoints';

const endpoints = [
  signin,
  signUp,
  verifyEmail,
  resendVerification,
  resetPassword,
  forgotPassword,
  getStudies,
  createStudy,
  getUsers,
  inviteUsers,
  updateUserRole,
  removeUserRole,
  refreshToken,
  getHealthDataOverview,
  getHealthDataParticipantIds,
  getHealthDataOverviewForUser,
  getUserProfilesCount,
  getParticipantHeartRates,
  getAverageParticipantHeartRate,
  getTasks,
  getActivities,
  getTaskRespondedUsersCount,
  getTask,
  getActivityTask,
  getEducationPublication,
  createTask,
  createActivityTask,
  updateTask,
  updateActivityTask,
  updateEducationPublication,
  getSurveyTaskItemResults,
  getActivityTaskItemResults,
  getTaskCompletionTime,
  getTablesList,
  getTableColumns,
  executeDataQuery,
  getLabVisitsList,
  getParticipantDropout,
  getParticipantEnrollment,
  createLabVisit,
  updateLabVisit,
  getPublications,
  createPublication,
  getStorageObjects,
  getStorageObjectUploadUrl,
  uploadStorageObject,
  deleteStorageObject,
  downloadStorageObject,
  getStorageObjectDownloadUrl,
  streamDownloadStorageObject,
] as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EndpointType = (...args: any) => any;
type EndpointTuple<T extends EndpointType> = [T, Parameters<T>];
type Endpoints<T extends readonly EndpointType[]> = EndpointTuple<T[number]>[];

const testEmail = 'hello@samsung.com';
const testPassword = 'pa55w0rd';
const testProjectId = 'project-id';

const responseData = {
  test: 'test',
};

function mockFetch(isErrorRequest = false, isBrokenData = false) {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ...(isErrorRequest
        ? {
            ok: false,
            status: 500,
          }
        : {
            ok: true,
            status: 200,
          }),
      headers: {},
      blob: () => Promise.resolve(isBrokenData ? null : responseData),
      json: () => Promise.resolve(isBrokenData ? null : responseData),
    })
  ) as unknown as typeof fetch;
}

beforeAll(() => {
  localStorage.setItem('API_URL', 'https://samsung.com/');
});

const endpointsList: Endpoints<typeof endpoints> = [
  [signin, [{ email: testEmail, password: testPassword }]],
  [
    signUp,
    [{ email: 'example@samsung.com', password: testPassword, profile: { name: 'username' } }],
  ],
  [verifyEmail, [{ token: 'token' }]],
  [resendVerification, [{ email: testEmail, password: testPassword }]],
  [resetPassword, [{ password: testPassword, resetToken: '12' }]],
  [forgotPassword, [{ email: testEmail }]],
  [getStudies, []],
  [
    createStudy,
    [
      {
        name: 'test',
        info: { color: '#fff' },
      },
    ],
  ],
  [getUsers, [{ projectId: testProjectId }]],
  [inviteUsers, [[{ email: testEmail, roles: ['team-admin'], mgmtAccess: false }]]],
  [updateUserRole, [{ accountId: '1', roles: ['team-admin'] }]],
  [removeUserRole, [{ accountId: '1', roles: ['team-admin'] }]],
  [refreshToken, [{ jwt: 'jwt-token', refreshToken: 'refresh-token' }]],
  [
    getHealthDataOverview,
    [
      {
        projectId: testProjectId,
        limit: 10,
        offset: 10,
        sort: { column: 'EMAIL', direction: 'DESC' },
      },
    ],
  ],
  [getHealthDataParticipantIds, [{ projectId: testProjectId, limit: 10 }]],
  [getHealthDataOverviewForUser, [{ projectId: testProjectId, id: 'id' }]],
  [getUserProfilesCount, [{ projectId: testProjectId }]],
  [
    getParticipantHeartRates,
    [
      {
        projectId: testProjectId,
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
      },
    ],
  ],
  [
    getAverageParticipantHeartRate,
    [
      {
        projectId: testProjectId,
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
      },
    ],
  ],
  [getTasks, [{ projectId: testProjectId }]],
  [getActivities, [{ projectId: testProjectId }]],
  [getTaskRespondedUsersCount, [{ projectId: testProjectId }]],
  [getTask, [{ projectId: testProjectId, id: 'id' }]],
  [getActivityTask, [{ projectId: testProjectId, id: 'id' }]],
  [getEducationPublication, [{ projectId: testProjectId, id: 'id' }]],
  [createTask, [{ projectId: testProjectId }]],
  [createActivityTask, [{ projectId: testProjectId }]],
  [updateTask, [{ projectId: testProjectId, id: 'id' }]],
  [updateActivityTask, [{ projectId: testProjectId, id: 'id' }]],
  [updateEducationPublication, [{ projectId: testProjectId, id: 'id' }]],
  [getSurveyTaskItemResults, [{ projectId: testProjectId, id: 'id' }]],
  [getActivityTaskItemResults, [{ projectId: testProjectId, id: 'id' }]],
  [getTaskCompletionTime, [{ projectId: testProjectId, id: 'id' }]],
  [getTablesList, []],
  [getTableColumns, [testProjectId, 'id']],
  [executeDataQuery, [testProjectId, 'select * from table']],
  [getLabVisitsList, [{ projectId: testProjectId }]],
  [getParticipantDropout, [testProjectId]],
  [getParticipantEnrollment, [testProjectId]],
  [createLabVisit, [{ projectId: testProjectId }]],
  [updateLabVisit, [{ projectId: testProjectId }]],
  [getPublications, [{ projectId: testProjectId }]],
  [createPublication, [{ projectId: testProjectId }]],
  [getStorageObjects, [{ projectId: testProjectId }]],
  [getStorageObjectUploadUrl, [{ projectId: testProjectId, objectName: 'test' }]],
  [uploadStorageObject, [{}]],
  [deleteStorageObject, [{ projectId: testProjectId, objectName: 'test' }]],
  [downloadStorageObject, [{ projectId: testProjectId, objectName: 'test' }]],
  [getStorageObjectDownloadUrl, [{ projectId: testProjectId, objectName: 'test' }]],
  [streamDownloadStorageObject, [{ projectId: testProjectId, objectName: 'test' }]],
];

for (const endpoint of endpointsList) {
  // eslint-disable-next-line @typescript-eslint/no-loop-func
  describe(`${endpoint[0].name}`, () => {
    beforeAll(() => {
      mockFetch(false);
    });

    it('should execute successfully request', async () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const response = await endpoint[0].apply(null, endpoint[1]);
      expect(() => response.data).not.toThrow();
    });
  });
}

for (const endpoint of endpointsList) {
  // eslint-disable-next-line @typescript-eslint/no-loop-func
  describe(`[NEGATIVE] ${endpoint[0].name} error`, () => {
    beforeAll(() => {
      mockFetch(true);
    });

    it('[NEGATIVE] should execute failure request', async () => {
      expect.assertions(1);
      try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const response = await endpoint[0].apply(null, endpoint[1]);
        response.data;
      } catch (err) {
        expect(String(err)).toMatch(/status code 500/);
      }
    });
  });
}

for (const endpoint of endpointsList) {
  // eslint-disable-next-line @typescript-eslint/no-loop-func
  describe(`[NEGATIVE] ${endpoint[0].name} error`, () => {
    beforeAll(() => {
      mockFetch(false, true);
    });

    it('[NEGATIVE] should execute request with broken response data', async () => {
      expect.assertions(1);
      try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const response = await endpoint[0].apply(null, endpoint[1]);
        expect(response.data).toBeNil();
      } catch (e) {
        // do nothing
      }
    });
  });
}
