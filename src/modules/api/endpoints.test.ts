import {
  createStudy,
  createTask,
  executeDataQuery,
  getAverageParticipantHeartRate,
  getAverageStepCount,
  getAvgHeartRateFluctuations,
  getEligibilityQualifications,
  getParticipant,
  getParticipantHeartRates,
  getParticipants,
  getParticipantsTimeZones,
  getParticipantsTotalItems,
  getStudies,
  getSurveyResponsesByAge,
  getSurveyResponsesByGender,
  getTableColumns,
  getTablesList,
  getTask,
  getTaskCompletionTime,
  getTaskItemResults,
  getTaskRespondedUsersCount,
  getTasks,
  getUsers,
  inviteUser,
  removeUser,
  removeUserRole,
  resetPassword,
  signin,
  updateTask,
  updateUserRole,
} from 'src/modules/api/endpoints';

const endpoints = [
  signin,
  resetPassword,
  getStudies,
  createStudy,
  getUsers,
  inviteUser,
  removeUser,
  updateUserRole,
  removeUserRole,
  getSurveyResponsesByAge,
  getSurveyResponsesByGender,
  getEligibilityQualifications,
  getAvgHeartRateFluctuations,
  getParticipants,
  getParticipantsTotalItems,
  getParticipant,
  getParticipantHeartRates,
  getAverageParticipantHeartRate,
  getAverageStepCount,
  getTasks,
  getTask,
  createTask,
  updateTask,
  getTaskItemResults,
  getTaskCompletionTime,
  getTaskRespondedUsersCount,
  getParticipantsTimeZones,
  getTablesList,
  getTableColumns,
  executeDataQuery,
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EndpointType = (...args: any) => any;
type EndpointTuple<T extends EndpointType> = [T, Parameters<T>];
type Endpoints<T extends EndpointType[]> = EndpointTuple<T[number]>[];

const email = 'hello@samsung.com';
const password = 'pa55w0rd';
const projectId = 'project-id';

const responseData = {
  test: 'test',
};

function mockFetch(isErrorRequest = false) {
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
      blob: () => Promise.resolve(responseData),
      json: () => Promise.resolve(responseData),
    })
  ) as unknown as typeof fetch;
}

beforeAll(() => {
  localStorage.setItem('API_URL', 'https://samsung.com/');
});

const endpointsList: Endpoints<typeof endpoints> = [
  [signin, [{ email, password }]],
  [resetPassword, [{ email, password, resetToken: '12' }]],
  [getStudies, []],
  [createStudy, [{ name: 'test', info: { color: '#fff' } }]],
  [getUsers, [{ projectId }]],
  [inviteUser, [{ email, roles: ['team-admin'] }]],
  [removeUser, [{ accountId: '1', roles: ['team-admin'] }]],
  [updateUserRole, [{ accountId: '1', roles: ['team-admin'] }]],
  [removeUserRole, [{ accountId: '1', roles: ['team-admin'] }]],
  [getSurveyResponsesByAge, []],
  [getSurveyResponsesByGender, []],
  [getEligibilityQualifications, []],
  [getAvgHeartRateFluctuations, []],
  [
    getParticipants,
    [{ projectId, limit: 10, offset: 10, sort: { column: 'steps', direction: 'desc' } }],
  ],
  [getParticipantsTotalItems, [{ projectId }]],
  [getParticipant, [{ projectId, id: 'id' }]],
  [
    getParticipantHeartRates,
    [{ projectId, startTime: new Date().toISOString(), endTime: new Date().toISOString() }],
  ],
  [
    getAverageParticipantHeartRate,
    [{ projectId, startTime: new Date().toISOString(), endTime: new Date().toISOString() }],
  ],
  [getAverageStepCount, [{ projectId }]],
  [getTasks, [{ projectId }]],
  [getTask, [{ projectId, id: 'id' }]],
  [createTask, [{ projectId }]],
  [updateTask, [{ projectId, revisionId: 1, id: 'id' }]],
  [getTaskItemResults, [{ projectId, revisionId: 1, id: 'id' }]],
  [getTaskCompletionTime, [{ projectId, revisionId: 1, id: 'id' }]],
  [getTaskRespondedUsersCount, [{ projectId }]],
  [getParticipantsTimeZones, [{ projectId }]],
  [getTablesList, [projectId]],
  [getTableColumns, [projectId, 'id']],
  [executeDataQuery, [projectId, 'select * from table']],
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
