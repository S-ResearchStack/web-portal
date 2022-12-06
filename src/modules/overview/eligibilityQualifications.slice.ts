import API from 'src/modules/api';
import createDataSlice from 'src/modules/store/createDataSlice';

export const getEligibilityQualificationsMockData = [
  {
    group: 'Dizzy',
    value: '170',
    totalValue: '1000',
  },
  {
    group: 'Sore throat',
    value: '380',
    totalValue: '1000',
  },
  {
    group: 'Nausea',
    value: '160',
    totalValue: '1000',
  },
  {
    group: 'Headache',
    value: '480',
    totalValue: '1000',
  },
  {
    group: 'Cough',
    value: '1000',
    totalValue: '1000',
  },
];

export const getEligibilityQualificationsMock = () =>
  API.mock.sqlResponse(getEligibilityQualificationsMockData);

API.mock.provideEndpoints({
  getEligibilityQualifications: getEligibilityQualificationsMock,
});

const eligibilityQualificationsSlice = createDataSlice({
  name: 'overview/eligibilityQualifications',
  fetchData: async () => {
    const { data } = await API.getEligibilityQualifications();
    const { data: groups } = data;

    return groups.map((g) => ({
      group: g.group,
      value: +g.value,
      totalValue: +g.totalValue,
    }));
  },
});

export const useEligibilityQualificationsData = eligibilityQualificationsSlice.hook;

export default {
  [eligibilityQualificationsSlice.name]: eligibilityQualificationsSlice.reducer,
};
