import createDataSlice from 'src/modules/store/createDataSlice';
import API from 'src/modules/api';
import {
  healthDataOverviewListMock,
  healthDataOverviewMock,
  transformHealthDataOverviewItemFromApi,
} from 'src/modules/overview/participantsList.slice';

const getHealthDataOverviewForUserMock: typeof API.getHealthDataOverviewForUser = ({ userId }) =>
  API.mock.response({
    healthDataOverviewOfUser:
      healthDataOverviewListMock.find((u) => u.userId === userId) || healthDataOverviewMock(),
  });

API.mock.provideEndpoints({
  getHealthDataOverviewForUser: getHealthDataOverviewForUserMock,
});

export type GetOverviewSubjectParams = { id: string; studyId: string };

export const overviewSubjectSlice = createDataSlice({
  name: 'overview/subject',
  fetchData: async ({ id, studyId }: GetOverviewSubjectParams) => {
    const { data } = await API.getHealthDataOverviewForUser({
      projectId: studyId,
      userId: id,
    });

    return transformHealthDataOverviewItemFromApi(data.healthDataOverviewOfUser);
  },
});

export const useOverviewSubject = overviewSubjectSlice.hook;

export default {
  [overviewSubjectSlice.name]: overviewSubjectSlice.reducer,
};
