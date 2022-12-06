import createDataSlice from 'src/modules/store/createDataSlice';
import API, { GetParticipantRequest } from 'src/modules/api';
import {
  participantListItemMock,
  participantListMock,
  transformParticipantListItemFromApi,
} from 'src/modules/overview/participantsList.slice';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getParticipantMock: typeof API.getParticipant = ({ projectId, id }) =>
  API.mock.response([
    participantListMock.find((item) => item.user_id === id) || participantListItemMock(),
  ]);

API.mock.provideEndpoints({
  getParticipant: getParticipantMock,
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
