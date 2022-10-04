import API from 'src/modules/api';
import createDataSlice from 'src/modules/store/createDataSlice';

API.mock.provideEndpoints({
  getAvgHeartRateFluctuations() {
    return API.mock.sqlResponse([
      {
        name: 'female',
        dataKey: 'day 1',
        value: '4',
      },
      {
        name: 'female',
        dataKey: 'day 3',
        value: '4',
      },
      {
        name: 'female',
        dataKey: 'day 5',
        value: '2',
      },
      {
        name: 'female',
        dataKey: 'day 7',
        value: '-1.5',
      },
      {
        name: 'female',
        dataKey: 'day 9',
        value: '-5.5',
      },
      {
        name: 'male',
        dataKey: 'day 1',
        value: '-4',
      },
      {
        name: 'male',
        dataKey: 'day 3',
        value: '7',
      },
      {
        name: 'male',
        dataKey: 'day 5',
        value: '5',
      },
      {
        name: 'male',
        dataKey: 'day 7',
        value: '8',
      },
      {
        name: 'male',
        dataKey: 'day 9',
        value: '6',
      },
    ]);
  },
});

const avgHeartRateFluctuationsSlice = createDataSlice({
  name: 'overview/avgHeartRateFluctuations',
  fetchData: async () => {
    const { data } = await API.getAvgHeartRateFluctuations();
    const { data: items } = data;

    return items.map((item) => ({ ...item, value: +item.value }));
  },
});

export const useAvgHeartRateFluctuationsData = avgHeartRateFluctuationsSlice.hook;

export default {
  [avgHeartRateFluctuationsSlice.name]: avgHeartRateFluctuationsSlice.reducer,
};
