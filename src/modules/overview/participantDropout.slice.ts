import { DateTime } from 'luxon';

import API, { ParticipantDropoutData } from 'src/modules/api';
import createDataSlice from 'src/modules/store/createDataSlice';

export const participantDropoutMockData: ParticipantDropoutData = {
  periods: {
    allTime: { withdrawals: 1234 },
    month: { withdrawals: 123, trend: -12 },
    week: { withdrawals: 12, trend: 11 },
    day: { withdrawals: 0, trend: 0 },
  },
  enrolledAt: DateTime.now().minus({ days: 0, years: 2 }).toMillis(),
};

export const getParticipantDropoutMock = () => API.mock.response(participantDropoutMockData);

API.mock.provideEndpoints({
  getParticipantDropout: getParticipantDropoutMock,
});

const participantDropoutSlice = createDataSlice({
  name: 'overview/participantDropout',
  fetchData: async (studyId: string) => {
    const { data } = await API.getParticipantDropout({ value: studyId });

    return data;
  },
});

export const useParticipantDropoutData = participantDropoutSlice.hook;

export default {
  [participantDropoutSlice.name]: participantDropoutSlice.reducer,
};
