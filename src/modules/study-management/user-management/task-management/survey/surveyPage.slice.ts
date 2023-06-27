import _shuffle from 'lodash/shuffle';
import _groupBy from 'lodash/groupBy';
import _sumBy from 'lodash/sumBy';
import _values from 'lodash/values';
import _entries from 'lodash/entries';
import _range from 'lodash/range';
import _uniq from 'lodash/uniq';
import _flatten from 'lodash/flatten';
import _orderBy from 'lodash/orderBy';
import _reverse from 'lodash/reverse';
import { DateTime, Duration } from 'luxon';

import createDataSlice from 'src/modules/store/createDataSlice';
import API, { DateTimeQuestion, TaskItemQuestion } from 'src/modules/api';
import { Timestamp, convertIsoUtcToMillis } from 'src/common/utils/datetime';
import Random from 'src/common/Random';
import { RankAnswer } from './survey-editor/questions/common/types';
import {
  ImagesAnswer,
  QuestionType,
  ScalableAnswer,
  SelectableAnswer,
  surveyQuestionListFromApi,
} from './survey-editor/surveyEditor.slice';
import { imageAnswersList, mockTasksItems, rankAnswerValues } from './surveyList.slice';

export type SurveyResultsSurveyInfo = {
  id: string;
  revisionId: number;
  title: string;
  publishedAt: Timestamp;
};

type SurveyResultsDataGroup = {
  id: string;
  label: string;
  extraLabel?: string;
  count?: number;
  total?: number;
  percentage?: number;
  image?: string;
};

export type SurveyResultsAnalytics = {
  targetParticipants: number;
  completedParticipants: number;
  responseRatePercents: number;
  avgCompletionTimeMs: number;
  byGender: SurveyResultsDataGroup[];
  byAge: SurveyResultsDataGroup[];
};

export type SurveyResultsResponse = {
  id: string;
  questionTitle: string;
  questionDescription?: string;
  questionType: QuestionType;
  answers: SurveyResultsDataGroup[];
};

export type SurveyResults = {
  surveyInfo: SurveyResultsSurveyInfo;
  analytics?: SurveyResultsAnalytics;
  responses?: SurveyResultsResponse[];
};

const mockProfile = () => [
  {
    key: 'age' as const,
    value: Random.shared.int(20, 100).toString(),
  },
  {
    key: 'gender' as const,
    value: Random.shared.arrayElement(['female', 'male']),
  },
];

const getMockRadioAnswers = (itemName: string) =>
  _range(300).map((idx) => ({
    itemName,
    result: Random.shared.arrayElement(['Yes', 'No', 'I dont remember']),
    userId: `user_id_${idx}`,
    profiles: mockProfile(),
  }));

const getCheckboxAnswer = () =>
  _uniq(
    _range(3).map(() =>
      Random.shared.arrayElement(['Dizzy', 'Sore throat', 'Nausea', 'Headache', 'Cough'])
    )
  ).join(',');

const getMockCheckboxAnswers = (itemName: string) =>
  _range(300).map((idx) => ({
    itemName,
    result: getCheckboxAnswer(),
    userId: `user_id_${idx}`,
    profiles: mockProfile(),
  }));

const getMockSliderAnswers = (itemName: string) =>
  _range(300).map((idx) => ({
    itemName,
    result: Random.shared.int(1, 10).toString(),
    userId: `user_id_${idx}`,
    profiles: mockProfile(),
  }));

const answerText = `I usually feel fatigued and out of breath. My muscles may feel weak, and I may need a moment to catch my breath. However, these symptoms highlight the importance of cardiovascular training and motivate me to keep pushing myself to become stronger and fitter.`;
const getMockOpenEndedAnswers = (itemName: string) =>
  _range(300).map((idx) => ({
    itemName,
    result: Random.shared.arrayElement([
      answerText,
      "I don't know",
      'I usually feel fatigued and out of breath',
      'My muscles may feel weak',
      'I may need a moment to catch my breath',
    ]),
    userId: `user_id_${idx}`,
    profiles: mockProfile(),
  }));

const getMockImageAnswers = (itemName: string) =>
  _range(300).map((idx) => ({
    itemName,
    result: _uniq(_range(3).map(() => Random.shared.arrayElement(imageAnswersList))).join(','),
    userId: `user_id_${idx}`,
    profiles: mockProfile(),
  }));

const getMockRankAnswers = (itemName: string) =>
  _range(300).map((idx) => ({
    itemName,
    result: _shuffle(rankAnswerValues).join(','),
    userId: `user_id_${idx}`,
    profiles: mockProfile(),
  }));

const getMockDateTimeAnswers = (itemName: string, isRange = false, isTime = false) =>
  _range(300).map((idx) => {
    const startDate = Random.shared.date(
      DateTime.now().minus({ days: 5 }).valueOf(),
      DateTime.now().valueOf()
    );
    const endDate = Random.shared.date(
      DateTime.now().plus({ days: 1 }).valueOf(),
      DateTime.now().plus({ days: 5 }).valueOf()
    );

    startDate.setMinutes(0);
    endDate.setMinutes(0);
    startDate.setSeconds(0);
    endDate.setSeconds(0);
    startDate.setMilliseconds(0);
    endDate.setMilliseconds(0);

    if (!isTime) {
      startDate.setHours(0);
      endDate.setHours(0);
    } else {
      startDate.setDate(DateTime.now().day);
      endDate.setDate(DateTime.now().day);
      startDate.setDate(DateTime.now().month);
      endDate.setDate(DateTime.now().month);
    }

    const result = isRange
      ? `${startDate.toISOString()},${endDate.toISOString()}`
      : startDate.toISOString();

    return {
      itemName,
      result,
      userId: `user_id_${idx}`,
      profiles: mockProfile(),
    };
  });

const mockTaskItemResults = _flatten(
  mockTasksItems
    .filter((t) => t.type === 'QUESTION')
    .map((taskItem) => {
      switch ((taskItem.contents as TaskItemQuestion).type) {
        case 'CHOICE': {
          switch ((taskItem.contents as TaskItemQuestion).properties.tag) {
            case 'CHECKBOX':
              return getMockCheckboxAnswers(taskItem.name);
            case 'RADIO':
            case 'DROPDOWN':
              return getMockRadioAnswers(taskItem.name);
            case 'IMAGE':
            case 'MULTIIMAGE':
              return getMockImageAnswers(taskItem.name);
            default:
              return [];
          }
        }
        case 'RANK':
          return getMockRankAnswers(taskItem.name);
        case 'SCALE':
          return getMockSliderAnswers(taskItem.name);
        case 'TEXT':
          return getMockOpenEndedAnswers(taskItem.name);
        case 'DATETIME':
          return getMockDateTimeAnswers(
            taskItem.name,
            ((taskItem.contents as TaskItemQuestion).properties as DateTimeQuestion).isRange,
            ((taskItem.contents as TaskItemQuestion).properties as DateTimeQuestion).isTime
          );
        default:
          return [];
      }
    })
);

API.mock.provideEndpoints({
  getSurveyTaskItemResults() {
    return API.mock.response({
      surveyResponse: mockTaskItemResults,
    });
  },
  getTaskCompletionTime() {
    return API.mock.response({
      taskResults: [
        {
          completionTime: {
            averageInMS: Duration.fromObject({
              minutes: 34,
            }).toMillis(),
          },
        },
      ],
    });
  },
});

const calcPercentage = (v?: number, total?: number) =>
  v === undefined || total === undefined || total === 0 ? 0 : Math.round((v * 100) / total);

export type GetSurveyDetailsDataParams = { id: string; studyId: string };

const surveyDetailsSlice = createDataSlice({
  name: 'studyManagement/survey',
  fetchData: async ({ id, studyId }: GetSurveyDetailsDataParams) => {
    const [task] = (await API.getTask({ id, projectId: studyId })).data;
    const [
      {
        data: { surveyResponse: responses },
      },
      { data: totalParticipantsResponse },
      {
        data: { taskResults: completionTimeData },
      },
    ] = await Promise.all([
      API.getSurveyTaskItemResults({
        id,
        projectId: studyId,
      }),
      API.getUserProfilesCount({ projectId: studyId }),
      API.getTaskCompletionTime({
        id,
        projectId: studyId,
      }),
    ]);

    const numTotalParticipants = Number(totalParticipantsResponse.count);
    const participants = _values(_groupBy(responses, (r) => r.userId)).map((r) => r[0]);

    return {
      surveyInfo: {
        id,
        revisionId: task.revisionId,
        title: task.title,
        description: task.description,
        publishedAt: DateTime.fromISO(task.createdAt).toMillis(),
      },
      analytics: {
        targetParticipants: numTotalParticipants,
        completedParticipants: participants.length,
        responseRatePercents: calcPercentage(participants.length, numTotalParticipants),
        avgCompletionTimeMs: Number(completionTimeData?.[0]?.completionTime?.averageInMS ?? 0),
        byGender: _entries(
          _groupBy(participants, (p) => p.profiles?.find((v) => v.key === 'gender')?.value || '')
        ).map(([gender, ps]) => ({
          id: gender,
          label: gender,
          value: ps.length,
          count: ps.length,
          total: participants.length,
          percentage: calcPercentage(ps.length, participants.length),
        })),
        byAge: [
          [20, 39],
          [40, 59],
          [60, 79],
          [80, 100],
        ].map(([min, max]) => {
          const ps = participants.filter((p) => {
            const age = Number(p.profiles?.find((v) => v.key === 'age')?.value || 0);
            return age >= min && age < max;
          });

          const label = `${min}-${max}`;
          return {
            id: label,
            label,
            value: ps.length,
            count: ps.length,
            total: participants.length,
            percentage: calcPercentage(ps.length, participants.length),
          };
        }),
      },
      responses: surveyQuestionListFromApi(task.items)
        .map((t) => t.children)
        .flat()
        .map((q) => ({
          id: q.id,
          questionTitle: q.title,
          questionDescription: q.description,
          questionType: q.type,
          answers: (() => {
            const questionResponses = responses?.filter((r) => r.itemName === q.id) || [];

            if (q.type === 'single' || q.type === 'dropdown') {
              return (q.answers as SelectableAnswer[]).map((a) => {
                const matchingResponses = questionResponses.filter((r) => r.result === a.value);
                return {
                  id: a.id,
                  label: a.value,
                  count: matchingResponses.length,
                  total: questionResponses.length,
                  percentage: calcPercentage(matchingResponses.length, questionResponses.length),
                };
              });
            }
            if (q.type === 'multiple') {
              return (q.answers as SelectableAnswer[]).map((a) => {
                const matchingResponses = questionResponses.filter((r) =>
                  r.result?.split(',').includes(a.value)
                );
                return {
                  id: a.id,
                  label: a.value,
                  count: matchingResponses.length,
                  total: questionResponses.length,
                  percentage: calcPercentage(matchingResponses.length, questionResponses.length),
                };
              });
            }
            if (q.type === 'slider') {
              const [min, max] = q.answers as [ScalableAnswer, ScalableAnswer];
              return _range(min.value, max.value + 1).map((v) => {
                const matchingResponses = questionResponses.filter((r) => r.result === String(v));
                return {
                  id: String(v),
                  label: String(v),
                  // eslint-disable-next-line no-nested-ternary
                  extraLabel: v === min.value ? min.label : v === max.value ? max.label : undefined,
                  count: matchingResponses.length,
                  total: questionResponses.length,
                  percentage: calcPercentage(matchingResponses.length, questionResponses.length),
                };
              });
            }
            if (q.type === 'images') {
              if (!questionResponses.length) {
                return [];
              }
              return (q.answers as ImagesAnswer[])
                .filter((a) => a.touched)
                .map((a) => {
                  const matchingResponses = questionResponses.filter((r) =>
                    r.result?.split(',').includes(a.image)
                  );
                  return {
                    id: a.id,
                    label: a.value,
                    image: a.image,
                    count: matchingResponses.length,
                    total: questionResponses.length,
                    percentage: calcPercentage(matchingResponses.length, questionResponses.length),
                  };
                });
            }
            if (q.type === 'open-ended') {
              const qRLength = questionResponses.length;
              return _reverse(questionResponses).map((qR, index) => ({
                id: String(index),
                label: qR.result,
                extraLabel: `${qRLength - index} / ${qRLength}`,
              }));
            }
            if (q.type === 'date-time') {
              const { isTime, isDate } = q.config;
              const { isRange } = q.options;
              const timeFormat = 'hh:mm a';
              const dayFormat = 'LL/dd/yyyy';
              const getFormat = () => {
                if (isTime && isDate) {
                  return `${dayFormat}, ${timeFormat}`;
                }
                if (isTime) {
                  return timeFormat;
                }

                return dayFormat;
              };
              const getDate = (timestamp: number) =>
                DateTime.fromMillis(timestamp).toFormat(getFormat());

              const groupedResponses = _groupBy(questionResponses, 'result');
              const formattedResponses = Object.keys(groupedResponses).map((key) => {
                const result = isRange ? key.split(',') : [key];
                const [r1, r2] = result;
                return {
                  counts: groupedResponses[key].length,
                  startDate: convertIsoUtcToMillis(r1),
                  endDate: convertIsoUtcToMillis(r2),
                };
              });

              const sortedResponses = _orderBy(
                formattedResponses,
                ['counts', 'startDate', 'endDate'],
                ['desc', 'asc', 'asc']
              );

              return sortedResponses.map((response, idx) => ({
                id: idx,
                label: isRange
                  ? `${getDate(response.startDate)} - ${getDate(response.endDate)}`
                  : getDate(response.startDate),
                extraLabel: `${response.counts} Answer${response.counts > 1 ? 's' : ''}`,
              }));
            }
            if (q.type === 'rank') {
              if (!questionResponses.length) {
                return [];
              }
              const responsesAnswerList = questionResponses.map((r) => r.result?.split(',') || []);
              const resultData = (q.answers as RankAnswer[]).map((a) => {
                const rankSum = _sumBy(responsesAnswerList, (r) => {
                  const idx = r.findIndex((rv) => rv === a.value);
                  if (idx !== -1) {
                    return idx + 1;
                  }
                  return q.answers.length;
                });

                return {
                  id: a.id,
                  label: a.value,
                  count: rankSum / questionResponses.length || 0,
                  total: q.answers.length,
                };
              });
              return _orderBy(resultData, ['count', 'label'], ['asc', 'asc']);
            }
            return [];
          })(),
        })),
    } as SurveyResults;
  },
});

export const useSurveyDetailsData = surveyDetailsSlice.hook;

export default {
  [surveyDetailsSlice.name]: surveyDetailsSlice.reducer,
};
