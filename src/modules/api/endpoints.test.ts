import {
  registerUser,
  getStudies,
  getDataTypes,
  getStudy,
  getStudyDashboard,
  getStudyDataFolders,
  getStudyDataFiles,
  getStudyDataCount,
  getSubjectInfoList,
  getSubjectInfoListCount,
  getSessionInfoList,
  getSessionInfoListCount,
  getSessionMetaInfo,
  getTaskInfoList,
  getTaskInfoListCount,
  getRawDataInfo,
  getRawDataInfoCount,
  getStudyDataFileInfo,
  getStudyDataFileInfoList,
  getStudyDataFileInfoListCount,
  addStudyDataFileInfo,
  setSubjectStatus,
  getFileDownloadUrls,
  createStudy,
  updateStudy,
  getBlobFile,
  setStudyRequirement,
  getUser,
  inviteUser,
  getUsers,
  inviteUsers,
  updateUserRole,
  removeUserRole,
  getSurveys,
  getActivities,
  getEducations,
  getSurvey,
  getActivity,
  getEducation,
  createSurvey,
  createActivity,
  createEducation,
  updateSurvey,
  updateActivity,
  updateEducation,
  deleteEducation,
  getPaticipantSuggestions,
  getResearcherSuggestions,
  getLabVisits,
  createLabVisit,
  updateLabVisit,
  getUploadUrl,
  uploadStorageObject,
  getDownloadStudyDataUrl,
  getDownloadSubjectDataUrl,
  getStudyDataFileUploadUrl,
  signin,
  signup,
  refreshToken,
  getGoogleToken,
  refreshGoogleToken,
  getListDatabase,
  getListTable,
  executeChartDataQuery,
  createDashboard,
  updateDashboard,
  deleteDashboard,
  getDashboard,
  getDashboardList,
  createChart,
  updateChart,
  deleteChart,
  getChart,
  getChartList,
} from 'src/modules/api/endpoints';

const endpoints = [
  registerUser,
  getStudies,
  getDataTypes,
  getStudy,
  getStudyDashboard,
  getStudyDataFolders,
  getStudyDataFiles,
  getStudyDataCount,
  getSubjectInfoList,
  getSubjectInfoListCount,
  getSessionInfoList,
  getSessionInfoListCount,
  getSessionMetaInfo,
  getTaskInfoList,
  getTaskInfoListCount,
  getRawDataInfo,
  getRawDataInfoCount,
  getStudyDataFileInfo,
  getStudyDataFileInfoList,
  getStudyDataFileInfoListCount,
  addStudyDataFileInfo,
  setSubjectStatus,
  getFileDownloadUrls,
  createStudy,
  updateStudy,
  getBlobFile,
  setStudyRequirement,
  getUser,
  inviteUser,
  getUsers,
  inviteUsers,
  updateUserRole,
  removeUserRole,
  refreshToken,
  getSurveys,
  getActivities,
  getEducations,
  getSurvey,
  getActivity,
  getEducation,
  createSurvey,
  createActivity,
  createEducation,
  updateSurvey,
  updateActivity,
  updateEducation,
  deleteEducation,
  getPaticipantSuggestions,
  getResearcherSuggestions,
  getLabVisits,
  createLabVisit,
  updateLabVisit,
  getUploadUrl,
  uploadStorageObject,
  getDownloadStudyDataUrl,
  getDownloadSubjectDataUrl,
  getStudyDataFileUploadUrl,
  signin,
  signup,
  getGoogleToken,
  refreshGoogleToken,
  getListDatabase,
  getListTable,
  executeChartDataQuery,
  createDashboard,
  updateDashboard,
  deleteDashboard,
  getDashboard,
  getDashboardList,
  createChart,
  updateChart,
  deleteChart,
  getChart,
  getChartList,
] as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EndpointType = (...args: any) => any;
type EndpointTuple<T extends EndpointType> = [T, Parameters<T>];
type Endpoints<T extends readonly EndpointType[]> = EndpointTuple<T[number]>[];

const studyId = 'study-id';
const id = 'test';
const page = 0;
const size = 10;
const invalidPage = Number('_');
const invalidSize = Number('_');
const url = 'https://test';
const file = new File(['test'], 'test-file.txt');

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
  [registerUser, []],
  [getStudies, []],
  [getDataTypes, []],
  [getStudy, [{ studyId }]],
  [getStudyDashboard, [{ studyId }]],
  [getStudyDataFolders, [{ studyId, parentId: 'test', page: invalidPage, size }]],
  [getStudyDataFiles, [{ studyId, parentId: 'test', page, size: invalidSize }]],
  [getStudyDataCount, [{ studyId, parentId: 'test' }]],
  [getSubjectInfoList, [{ studyId, includeTaskRecord: true, page, size }]],
  [getSubjectInfoListCount, [{ studyId }]],
  [getSessionInfoList, [{ studyId, subjectNumber: 'test', page, size }]],
  [getSessionInfoListCount, [{ studyId, subjectNumber: 'test' }]],
  [getSessionMetaInfo, [{ studyId, subjectNumber: 'test', sessionId: 'test' }]],
  [getTaskInfoList, [{ studyId, subjectNumber: 'test', sessionId: 'test', page, size }]],
  [getTaskInfoListCount, [{ studyId, subjectNumber: 'test', sessionId: 'test' }]],
  [getRawDataInfo, [{ studyId, subjectNumber: 'test', sessionId: 'test', taskId: 'test', page, size }]],
  [getRawDataInfoCount, [{ studyId, subjectNumber: 'test', sessionId: 'test', taskId: 'test' }]],
  [getStudyDataFileInfo, [{ studyId, subjectNumber: 'test', sessionId: 'test', taskId: 'test', fileName: 'test' }]],
  [getStudyDataFileInfoList, [{ studyId, subjectNumber: 'test', sessionId: 'test', taskId: 'test', page, size }]],
  [getStudyDataFileInfoListCount, [{ studyId, subjectNumber: 'test', sessionId: 'test', taskId: 'test' }]],
  // [addStudyDataFileInfo, [{ studyId, subjectNumber: 'test', sessionId: 'test', taskId: 'test', fileType: 'test', fileName: 'test', publicAccess: true }]],
  [setSubjectStatus, [{ studyId, subjectNumber: 'test' }]],
  [getFileDownloadUrls, [{ studyId, filePaths: ['test'] }]],
  [createStudy, []],
  [updateStudy, [{ studyId }]],
  [getBlobFile, ['fileUrl']],
  [setStudyRequirement, [{ studyId }, {}]],
  [getUser, []],
  [inviteUser, []],
  [getUsers, [{ studyId }]],
  [inviteUsers, []],
  [updateUserRole, ['1', { studyId, role: 'team-admin' }]],
  [removeUserRole, ['1', { studyId }]],
  [refreshToken, []],
  [getSurveys, [{ studyId }]],
  [getActivities, [{ studyId }]],
  [getEducations, [{ studyId }]],
  [getSurvey, [{ studyId, id }]],
  [getActivity, [{ studyId, id }]],
  [getEducation, [{ studyId, educationId: id }]],
  [createSurvey, [{ studyId }]],
  [createActivity, [{ studyId }]],
  [createEducation, [{ studyId }]],
  [updateSurvey, [{ studyId, id }]],
  [updateActivity, [{ studyId, id }]],
  [updateEducation, [{ studyId, educationId: id }]],
  [deleteEducation, [{ studyId, educationId: id }]],
  [getPaticipantSuggestions, [{ studyId }]],
  [getResearcherSuggestions, [{ studyId }]],
  [getLabVisits, [{ studyId, sort: { column: 'id', direction: 'asc' }, filter: { page, size } }]],
  [createLabVisit, [{ studyId }]],
  [updateLabVisit, [{ studyId }]],
  [getUploadUrl, [{ studyId }, { filePath: 'test' }]],
  [uploadStorageObject, [{ signedUrl: url, blob: file }]],
  [getDownloadStudyDataUrl, [{ studyId }]],
  [getDownloadSubjectDataUrl, [{ studyId, subjectNumber: 'test' }]],
  [getStudyDataFileUploadUrl, [{ studyId, subjectNumber: 'test', sessionId: 'test', taskId: 'test', fileName: 'test', publicAccess: true }]],
  [signin, []],
  [signup, []],
  [getGoogleToken, ['code']],
  [refreshGoogleToken, []],
  [getListDatabase, [{ studyId }]],
  [getListTable, [{ studyId, database: 'test' }]],
  [executeChartDataQuery, [{ studyId }, { database: 'test', query: 'select * from table' }]],
  [createDashboard, [{ studyId }]],
  [updateDashboard, [{ studyId, id }]],
  [deleteDashboard, [{ studyId, id }]],
  [getDashboard, [{ studyId, id }]],
  [getDashboardList, [{ studyId }]],
  [createChart, [{ studyId, dashboardId: id }]],
  [updateChart, [{ studyId, dashboardId: id, id }]],
  [deleteChart, [{ studyId, dashboardId: id, id }]],
  [getChart, [{ studyId, dashboardId: id, id }]],
  [getChartList, [{ studyId, dashboardId: id }]],
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
