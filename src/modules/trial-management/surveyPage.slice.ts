import _groupBy from 'lodash/groupBy';
import _values from 'lodash/values';
import _entries from 'lodash/entries';
import _range from 'lodash/range';
import _uniq from 'lodash/uniq';
import { DateTime, Duration } from 'luxon';
import createDataSlice from 'src/modules/store/createDataSlice';
import API from 'src/modules/api';
import { Timestamp } from 'src/common/utils/datetime';
import {
  QuestionType,
  ScalableAnswer,
  SelectableAnswer,
  surveyQuestionListFromApi,
} from './survey-editor/surveyEditor.slice';

export type SurveyResultsSurveyInfo = {
  id: string;
  revisionId: number;
  title: string;
  publishedAt: Timestamp;
};

export type SurveyResultsDataGroup = {
  label: string;
  extraLabel?: string;
  count: number;
  total: number;
  percentage: number;
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

const getRandomNumberBetween = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1) + min);

const mockRadioAnswers = _range(300).map((idx) => ({
  age: `${getRandomNumberBetween(20, 100)}`,
  gender: ['female', 'male'][getRandomNumberBetween(0, 1)],
  id: '1',
  item_name: 'Question0',
  result: ['Yes', 'No', 'I dont remember'][getRandomNumberBetween(0, 2)],
  revision_id: '7',
  task_id: '1',
  user_id: `user_id_${idx}`,
  started_at: '0',
  submitted_at: '0',
}));

const getCheckboxAnswer = () => {
  const a1 = ['Dizzy', 'Sore throat', 'Nausea', 'Headache', 'Cough'][getRandomNumberBetween(0, 4)];
  const a2 = ['Dizzy', 'Sore throat', 'Nausea', 'Headache', 'Cough'][getRandomNumberBetween(0, 4)];
  const a3 = ['Dizzy', 'Sore throat', 'Nausea', 'Headache', 'Cough'][getRandomNumberBetween(0, 4)];

  return _uniq([a1, a2, a3]).join(',');
};

const mockCheckboxAnswers = _range(300).map((idx) => ({
  age: `${getRandomNumberBetween(20, 100)}`,
  gender: ['female', 'male'][getRandomNumberBetween(0, 1)],
  id: '1',
  item_name: 'Question1',
  result: getCheckboxAnswer(),
  revision_id: '7',
  task_id: '1',
  user_id: `user_id_${idx}`,
  started_at: '0',
  submitted_at: '0',
}));

const mockSliderAnswers = _range(300).map((idx) => ({
  age: `${getRandomNumberBetween(20, 100)}`,
  gender: ['female', 'male'][getRandomNumberBetween(0, 1)],
  id: '1',
  item_name: 'Question2',
  result: `${getRandomNumberBetween(1, 10)}`,
  revision_id: '7',
  task_id: '1',
  user_id: `user_id_${idx}`,
  started_at: '0',
  submitted_at: '0',
}));

const mockTaskItemResults = [...mockRadioAnswers, ...mockCheckboxAnswers, ...mockSliderAnswers];

API.mock.provideEndpoints({
  getTaskItemResults() {
    return API.mock.response(mockTaskItemResults);
  },
  getTaskCompletionTime() {
    return API.mock.response([
      {
        avg_completion_time_ms: Duration.fromObject({
          minutes: 34,
        })
          .toMillis()
          .toString(),
      },
    ]);
  },
});

const calcPercentage = (v?: number, total?: number) =>
  v === undefined || total === undefined || total === 0 ? 0 : Math.round((v * 100) / total);

const surveyDetailsSlice = createDataSlice({
  name: 'trialManagement/survey',
  fetchData: async ({ id, studyId }: { id: string; studyId: string }) => {
    const [task] = (await API.getTask({ id, projectId: studyId })).data;
    const [{ data: responses }, { data: totalParticipantsResponse }, { data: completionTimeData }] =
      await Promise.all([
        API.getTaskItemResults({
          id,
          revisionId: task.revisionId,
          projectId: studyId,
        }),
        API.getParticipantsTotalItems({ projectId: studyId }),
        API.getTaskCompletionTime({
          id,
          revisionId: task.revisionId,
          projectId: studyId,
        }),
      ]);

    const numTotalParticipants = Number(totalParticipantsResponse[0].total);
    const participants = _values(_groupBy(responses, (r) => r.user_id)).map((r) => r[0]);

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
        avgCompletionTimeMs: Number(completionTimeData[0]?.avg_completion_time_ms ?? 0),
        byGender: _entries(_groupBy(participants, (p) => p.gender)).map(([gender, ps]) => ({
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
            const age = Number(p.age);
            return age >= min && age < max;
          });

          return {
            label: `${min}-${max}`,
            value: ps.length,
            count: ps.length,
            total: participants.length,
            percentage: calcPercentage(ps.length, participants.length),
          };
        }),
      },
      responses: surveyQuestionListFromApi(task.items).map((q) => ({
        questionTitle: q.title,
        questionDescription: q.description,
        questionType: q.type,
        answers: (() => {
          const questionResponses = responses.filter((r) => r.item_name === q.id);

          if (q.type === 'single') {
            return (q.answers as SelectableAnswer[]).map((a) => {
              const matchingResponses = questionResponses.filter((r) => r.result === a.value);
              return {
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
                r.result.split(',').includes(a.value)
              );
              return {
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
                label: String(v),
                // eslint-disable-next-line no-nested-ternary
                extraLabel: v === min.value ? min.label : v === max.value ? max.label : undefined,
                count: matchingResponses.length,
                total: questionResponses.length,
                percentage: calcPercentage(matchingResponses.length, questionResponses.length),
              };
            });
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
