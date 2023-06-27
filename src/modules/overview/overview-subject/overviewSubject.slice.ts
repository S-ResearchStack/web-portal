import createDataSlice from 'src/modules/store/createDataSlice';
import API from 'src/modules/api';
import {
  healthDataOverviewListMock,
  transformHealthDataOverviewItemFromApi,
} from 'src/modules/overview/participantsList.slice';

API.mock.provideEndpoints({
  getHealthDataOverviewForUser({ userId }) {
    const user = healthDataOverviewListMock.find((u) => u.userId === userId);
    if (!user) {
      return API.mock.failedResponse({ status: 404 });
    }
    return API.mock.response({ healthDataOverviewOfUser: user });
  },
});

export type GetOverviewSubjectParams = { id: string; studyId: string };

export const overviewSubjectSlice = createDataSlice({
  name: 'overview/subject',
  fetchData: async ({ id, studyId }: GetOverviewSubjectParams) => {
    const { data } = await API.getHealthDataOverviewForUser({
      projectId: studyId,
      userId: id,
    });

    return transformHealthDataOverviewItemFromApi(data.healthDataOverviewOfUser || {});
  },
});

export const useOverviewSubject = overviewSubjectSlice.hook;

export default {
  [overviewSubjectSlice.name]: overviewSubjectSlice.reducer,
};
