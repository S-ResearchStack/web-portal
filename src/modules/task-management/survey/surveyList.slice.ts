import _range from 'lodash/range';

import { RootState } from 'src/modules/store';
import { parseDateFromApi, Timestamp } from 'src/common/utils/datetime';
import { sortTaskList } from 'src/modules/common/utils';
import createDataSlice from 'src/modules/store/createDataSlice';
import API, {
  BaseTaskType,
  BaseTaskStatus,
  SurveyResponse,
  SurveyListResponse,
  SurveyTaskSection,
  TaskResultsResponse,
  CountTableRowsResponse,
} from 'src/modules/api';


export const mockSurveySections: SurveyTaskSection[] = [
  {
    questions: [
      {
        id: 'survey_question1',
        title: 'Q1',
        explanation: '',
        tag: 'RADIO',
        type: 'CHOICE',
        itemProperties: {
          options: [
            { value: 'Yes', label: 'Yes' },
            { value: 'No', label: 'No' },
            { value: 'I dont remember', label: 'I dont remember' },
          ]
        },
        required: true
      },
      {
        id: 'survey_question2',
        title: 'Q2',
        explanation: '',
        tag: 'CHECKBOX',
        type: 'CHOICE',
        itemProperties: {
          options: [
            { value: 'Dizzy', label: 'Dizzy' },
            { value: 'Nausea', label: 'Nausea' },
            { value: 'Cough', label: 'Cough' }
          ]
        },
        required: true
      },
      {
        id: 'survey_question3',
        title: 'Q3',
        explanation: '',
        tag: 'DROPDOWN',
        type: 'CHOICE',
        itemProperties: {
          options: [
            { value: 'Yes', label: 'Yes' },
            { value: 'No', label: 'No' },
          ]
        },
        required: true
      },
      {
        id: 'survey_question4',
        title: 'Q4',
        explanation: 'Please select one option.',
        tag: 'IMAGE',
        type: 'CHOICE',
        itemProperties: {
          options: [
            {
              value: '639af285-e8d7-403a-9ec6-be38fa214a21',
              label: ''
            },
            {
              value: '256a54e1-3da8-467f-9c64-c0d59067d8e0',
              label: ''
            }
          ]
        },
        required: true
      }
    ]
  },
  {
    questions: [
      {
        id: 'survey_question5',
        title: 'Q5',
        explanation: '',
        tag: 'SLIDER',
        type: 'SCALE',
        itemProperties: {
          low: 0,
          high: 10,
          lowLabel: 'Very slight',
          highLabel: 'Very strong'
        },
        required: true
      },
      {
        id: 'survey_question268',
        title: 'Q6',
        explanation: 'How long was did your symptoms last?',
        tag: 'TEXT',
        type: 'TEXT',
        itemProperties: {},
        required: true
      },
      {
        id: 'survey_question274',
        title: 'Q7',
        explanation: 'Please note down the time when you take the medication yesterday.',
        tag: 'DATETIME',
        type: 'DATETIME',
        itemProperties: {
          isTime: false,
          isDate: false,
          isRange: false
        },
        required: true
      },
      {
        id: 'survey_question6',
        title: 'Q8',
        explanation: '',
        tag: 'RANKING',
        type: 'RANKING',
        itemProperties: {
          options: [
            { value: 'Cough', label: 'Cough' },
            { value: 'Nausea', label: 'Nausea' },
            { value: 'Fever', label: 'Fever' },
          ]
        },
        required: true
      }
    ]
  }
];

export const mockSurveys: SurveyResponse[] = _range(24).map((idx) => ({
  id: String(idx),
  taskType: BaseTaskType.SURVEY,
  status: idx < 12 ? BaseTaskStatus.CREATED : BaseTaskStatus.PUBLISHED,
  title: `${idx} Survey placeholder for title maximum two lines${idx === 2 ? ' text extension' : ''}`,
  description: `${idx} survey description`,
  createdAt: new Date(Date.now() - idx * 2 * 24 * 60 * 60 * 1000).toISOString(),
  publishedAt: idx < 12 ? undefined : new Date(Date.now() - idx * 24 * 60 * 60 * 1000).toISOString(),
  startTime: new Date(Date.now() - idx * 24 * 60 * 60 * 1000).toISOString(),
  endTime: new Date(Date.now() - idx * 24 * 60 * 60 * 1000).toISOString(),
  schedule: '* * * * * ? *',
  validMin: 0,
  duration: '',
  task: {
    sections: mockSurveySections
  }
}));

API.mock.provideEndpoints({
  getSurveys() {
    return API.mock.response(mockSurveys);
  },
});

export interface SurveyListItem {
  id: string;
  title: string;
  description?: string;
  status: BaseTaskStatus;
  totalParticipants: number;
  respondedParticipants: number;
  modifiedAt?: Timestamp;
  publishedAt?: Timestamp;
}

interface SurveyListCategories {
  drafts: SurveyListItem[];
  published: SurveyListItem[];
}

export interface SurveyListSliceFetchArgs {
  studyId: string;
}

export const transformSurveyListItemFromApi = (
  t: SurveyResponse,
  totalParticipants: number,
  respondedParticipants: number
): SurveyListItem => ({
  id: t.id,
  title: t.title || '',
  status: t.status,
  modifiedAt: parseDateFromApi(t.createdAt),
  publishedAt: parseDateFromApi(t.publishedAt),
  description: t.description,
  totalParticipants,
  respondedParticipants,
});

export const transformSurveyListFromApi = ({
  tasksData,
  totalParticipantsData,
  taskResponsesCountData,
}: {
  tasksData: SurveyListResponse;
  totalParticipantsData: CountTableRowsResponse;
  taskResponsesCountData: TaskResultsResponse;
}): SurveyListCategories => {
  const totalParticipants = Number(totalParticipantsData?.count) || 0;

  const tasks = (Array.isArray(tasksData) ? tasksData : []).map((t) => {
    t.status = t.status || BaseTaskStatus.PUBLISHED;

    const sections = t.task.sections;
    if (!sections) {
      return undefined;
    }

    return transformSurveyListItemFromApi(
      t,
      totalParticipants,
      Number(
        taskResponsesCountData.taskResults?.find((trc) => trc.taskId === t.id)
          ?.numberOfRespondedUser?.count
      ) || 0
    )
  })
    .filter(Boolean) as SurveyListItem[];

  return sortTaskList({
    drafts: tasks.filter((t) => t.status === BaseTaskStatus.CREATED),
    published: tasks.filter((t) => t.status === BaseTaskStatus.PUBLISHED),
  });
};

export const surveyListSlice = createDataSlice({
  name: 'task/surveyList',
  fetchData: async ({ studyId }: SurveyListSliceFetchArgs) => {
    const [
      { data: tasksData },
    ] =
      await Promise.all([
        API.getSurveys({ studyId }),
      ]);

    return transformSurveyListFromApi({
      tasksData,
      taskResponsesCountData: {},
      totalParticipantsData: {},
    });
  },
});

export const surveyListDataSelector = (state: RootState): SurveyListCategories | undefined =>
  state[surveyListSlice.name]?.data;

export const useSurveyListData = surveyListSlice.hook;

export default {
  [surveyListSlice.name]: surveyListSlice.reducer,
};
