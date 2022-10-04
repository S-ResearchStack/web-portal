import API from 'src/modules/api';
import createDataSlice from 'src/modules/store/createDataSlice';

API.mock.provideEndpoints({
  getAverageStepCount() {
    return API.mock.response([
      {
        gender: 'male',
        day_of_week: '1',
        steps: '7300',
      },
      {
        gender: 'male',
        day_of_week: '2',
        steps: '5700',
      },
      {
        gender: 'male',
        day_of_week: '3',
        steps: '5000',
      },
      {
        gender: 'male',
        day_of_week: '4',
        steps: '4200',
      },
      {
        gender: 'male',
        day_of_week: '5',
        steps: '2900',
      },
      {
        gender: 'male',
        day_of_week: '6',
        steps: '2800',
      },
      {
        gender: 'male',
        day_of_week: '7',
        steps: '3500',
      },
      {
        gender: 'female',
        day_of_week: '1',
        steps: '4300',
      },
      {
        gender: 'female',
        day_of_week: '2',
        steps: '5700',
      },
      {
        gender: 'female',
        day_of_week: '3',
        steps: '4000',
      },
      {
        gender: 'female',
        day_of_week: '4',
        steps: '5200',
      },
      {
        gender: 'female',
        day_of_week: '5',
        steps: '5900',
      },
      {
        gender: 'female',
        day_of_week: '6',
        steps: '2800',
      },
      {
        gender: 'female',
        day_of_week: '7',
        steps: '2500',
      },
    ]);
  },
});

const daysOfWeek = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

const avgStepCountSlice = createDataSlice({
  name: 'overview/avgStepCount',
  fetchData: async ({ studyId }: { studyId: string }) => {
    const { data: items } = await API.getAverageStepCount({
      projectId: studyId,
    });

    return (
      items
        .sort((prev, next) => +next.day_of_week - +prev.day_of_week)
        .map((item) => ({
          name: item.gender,
          dataKey: daysOfWeek[+item.day_of_week - 1], // sql query returns day of week in 1..7 range
          value: Math.round(+item.steps),
        }))
        .filter(({ dataKey }) => !!dataKey)
        // TODO: currently sql dataset returns profiles with following genders: Male, male, Female, female
        // until this is fixed we just filter out some of the dataset
        .filter(({ name }) => name === 'male' || name === 'female')
    );
  },
});

export const useAvgStepCountData = avgStepCountSlice.hook;

export default {
  [avgStepCountSlice.name]: avgStepCountSlice.reducer,
};
