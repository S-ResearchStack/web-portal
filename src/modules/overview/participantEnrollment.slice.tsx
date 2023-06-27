import { DateTime } from 'luxon';
import _range from 'lodash/range';

import API from 'src/modules/api';
import createDataSlice from 'src/modules/store/createDataSlice';
import Random from 'src/common/Random';

export type ParticipantEnrollmentPeriod =
  | 'last_24_hours'
  | 'last_7_days'
  | 'last_30_days'
  | 'all_time';

const startTime = DateTime.utc().startOf('day');

const startTs = startTime.valueOf();
const endTs = (key: string, value: number) => startTime.plus({ [key]: value }).valueOf();

const mockTs = (endTsKey: string, endTsValue: number, numberOfDots: number) =>
  _range(numberOfDots)
    .map((i) => startTs + ((endTs(endTsKey, endTsValue) - startTs) / numberOfDots) * i)
    .sort((a, b) => a - b);

const mockData = (endTsKey: string, endTsValue: number, numberOfDots: number) => ({
  data: _range(numberOfDots).map((i) => ({
    value: `${Random.shared.int(10, 500)}`,
    ts: `${mockTs(endTsKey, endTsValue, numberOfDots)[i]}`,
  })),
  comparisonPercentage: 1,
});

const getMockData = (period?: ParticipantEnrollmentPeriod) => {
  switch (period) {
    case 'last_24_hours':
      return mockData('hours', 24, 12);
    case 'last_7_days':
      return mockData('days', 7, 7);
    case 'last_30_days':
      return mockData('days', 30, 30);
    default:
      return mockData('years', 6, 6);
  }
};

export const getParticipantEnrollmentMock = (period?: ParticipantEnrollmentPeriod) =>
  API.mock.response(getMockData(period));

API.mock.provideEndpoints({
  getParticipantEnrollment: getParticipantEnrollmentMock,
});

const participantEnrollmentSlice = createDataSlice({
  name: 'overview/participantEnrollment',
  fetchData: async ({ period }: { period?: ParticipantEnrollmentPeriod }) => {
    const { data } = await API.getParticipantEnrollment(period);
    const { data: items, comparisonPercentage } = data;

    return {
      dataItems: items.map((item) => ({ ...item, ts: +item.ts, value: +item.value })),
      comparisonPercentage,
    };
  },
});

export const useParticipantEnrollmentData = participantEnrollmentSlice.hook;

export default {
  [participantEnrollmentSlice.name]: participantEnrollmentSlice.reducer,
};
