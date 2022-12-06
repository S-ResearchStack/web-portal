import _sumBy from 'lodash/sumBy';

import API from 'src/modules/api';
import createDataSlice from 'src/modules/store/createDataSlice';

export const surveyResponsesByAgeMockData = [
  {
    group: '20-39',
    count: '140',
  },
  {
    group: '40-59',
    count: '270',
  },
  {
    group: '60-79',
    count: '250',
  },
  {
    group: '80-100',
    count: '340',
  },
];

export const getSurveyResponsesByAgeMock = () => API.mock.sqlResponse(surveyResponsesByAgeMockData);

export const surveyResponsesByGenderMockData = [
  {
    group: 'male',
    count: '780',
  },
  {
    group: 'female',
    count: '690',
  },
  {
    group: 'other',
    count: '550',
  },
];

export const getSurveyResponsesByGenderMock = () =>
  API.mock.sqlResponse(surveyResponsesByGenderMockData);

API.mock.provideEndpoints({
  getSurveyResponsesByAge: getSurveyResponsesByAgeMock,
  getSurveyResponsesByGender: getSurveyResponsesByGenderMock,
});

const surveyResponsesByAgeSlice = createDataSlice({
  name: 'overview/surveyResponsesByAge',
  fetchData: async () => {
    const { data } = await API.getSurveyResponsesByAge();
    const { data: groups } = data;

    const total = _sumBy(groups, (g) => Number(g.count));

    return groups.map((g) => ({
      group: g.group,
      percentage: Math.round((Number(g.count) * 100) / total),
      count: g.count,
      total,
    }));
  },
});

export const useSurveyResponsesByAgeData = surveyResponsesByAgeSlice.hook;

const surveyResponsesByGenderSlice = createDataSlice({
  name: 'overview/surveyResponsesByGender',
  fetchData: async () => {
    const { data } = await API.getSurveyResponsesByGender();

    const groups = data.data.map((g) => ({ ...g, count: Number(g.count) }));
    const groupsWithoutOther = groups.filter((g) => g.group !== 'other');

    const total = _sumBy(groups, (g) => g.count);

    const items = groupsWithoutOther.map((g) => ({
      group: g.group,
      percentage: Math.round((g.count * 100) / total),
      count: g.count,
      total,
    }));

    return {
      totalPercents: _sumBy(items, (i) => i.percentage),
      items,
    };
  },
});

export const useSurveyResponsesByGenderData = surveyResponsesByGenderSlice.hook;

export default {
  [surveyResponsesByAgeSlice.name]: surveyResponsesByAgeSlice.reducer,
  [surveyResponsesByGenderSlice.name]: surveyResponsesByGenderSlice.reducer,
};
