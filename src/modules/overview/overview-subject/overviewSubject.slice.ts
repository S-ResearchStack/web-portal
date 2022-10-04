import createDataSlice from 'src/modules/store/createDataSlice';
import API, { GetParticipantRequest } from 'src/modules/api';
import {
  participantListItemMock,
  participantListMock,
  transformParticipantListItemFromApi,
} from 'src/modules/overview/overview.slice';

API.mock.provideEndpoints({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getParticipant({ projectId, id }) {
    return API.mock.response([
      participantListMock.find((item) => item.user_id === id) || participantListItemMock(),
    ]);
  },
});

export type GetOverviewSubjectParams = GetParticipantRequest & { studyId: string };

export const overviewSubjectSlice = createDataSlice({
  name: 'overview/subject',
  fetchData: async ({ id, studyId }: GetOverviewSubjectParams) => {
    const { data } = await API.getParticipant({
      projectId: studyId,
      id,
    });

    return transformParticipantListItemFromApi(data[0]);
  },
});

export const useOverviewSubject = overviewSubjectSlice.hook;

export default {
  [overviewSubjectSlice.name]: overviewSubjectSlice.reducer,
};
