import _range from 'lodash/range';
import { DateTime } from 'luxon';

import createDataSlice from 'src/modules/store/createDataSlice';
import API, { CountTableRowsResponse, TaskItem, TaskListResponse } from 'src/modules/api';
import { Timestamp } from 'src/common/utils/datetime';
import { Task, TaskResultsResponse } from 'src/modules/api/models/tasks';
import { RootState } from 'src/modules/store';
import { sortTaskList } from 'src/modules/study-management/user-management/common/utils';

export const imageAnswersList: Array<string> = Array(7)
  .fill('https://loremflickr.com/200/200/cats?random=')
  .map((url, idx) => url + (idx + 1).toString());

export const rankAnswerValues: Array<string> = [
  'Cough',
  'Dizzy',
  'Nausea',
  'Fatigue',
  'Body Ache',
  'Fever',
  'Asthma',
  'Stomach-ache',
];

export const mockTasksItems: TaskItem[] = [
  {
    name: 'Section0',
    type: 'SECTION',
    sequence: 0,
    contents: {
      title: 'Test section title',
    },
  },
  {
    name: 'Question1',
    sequence: 1,
    type: 'QUESTION',
    contents: {
      type: 'CHOICE',
      title: 'Did you experience nausea today?',
      required: true,
      properties: {
        tag: 'RADIO',
        options: [
          { value: 'Yes', label: 'Yes' },
          { value: 'No', label: 'No' },
          { value: 'I dont remember', label: 'I dont remember' },
        ],
        skip_logic: [
          {
            condition: 'eq val1 "No"',
            goToItemSequence: 4,
          },
        ],
      },
    },
  },
  {
    name: 'Section1',
    type: 'SECTION',
    sequence: 2,
    contents: {
      title: 'Test section title',
    },
  },
  {
    name: 'Question2',
    sequence: 3,
    type: 'QUESTION',
    contents: {
      type: 'CHOICE',
      title: 'Please select the symptoms you experienced today.',
      explanation: 'Recall the feelings you had today.',
      required: true,
      properties: {
        tag: 'CHECKBOX',
        options: [
          { value: 'Dizzy' },
          { value: 'Sore throat' },
          { value: 'Nausea' },
          { value: 'Headache' },
          { value: 'Cough' },
        ],
        skip_logic: [
          {
            condition: 'and lt cnt2 1 and contains val2 "Dizzy" notcontains val2 "Nausea"',
            goToItemSequence: 4,
          },
          {
            condition: 'and lt cnt2 1 and contains val2 "Dizzy" notcontains val2 "Nausea"',
            goToItemSequence: 4,
          },
        ],
      },
    },
  },
  {
    name: 'Section4',
    type: 'SECTION',
    sequence: 4,
    contents: {
      title: 'Test section title',
    },
  },
  {
    name: 'Question3',
    sequence: 5,
    type: 'QUESTION',
    contents: {
      type: 'SCALE',
      title: 'How was your symptom level?',
      explanation:
        'Please tap on the slider to give a rating, from 0 being no concern to 10 being extremely concerned.',
      required: true,
      properties: {
        high: 10,
        highLabel: 'Very strong',
        low: 1,
        lowLabel: 'Very slight',
        tag: 'SLIDER',
      },
    },
  },
  {
    name: 'Question4',
    sequence: 6,
    type: 'QUESTION',
    contents: {
      type: 'CHOICE',
      title: 'What do you believe caused your extremely bad sleep quality last night?',
      explanation:
        'Please tap on the slider to give a rating, from 0 being no concern to 10 being extremely concerned.',
      required: true,
      properties: {
        tag: 'IMAGE',
        options: [
          'Excessive Coughing',
          'Stress',
          'Environmental Factors',
          'Hunger',
          'Fatigue',
          'Stress',
        ].map((label, idx) => ({ label, value: imageAnswersList[idx] })),
      },
    },
  },
  {
    name: `Section7`,
    type: 'SECTION',
    sequence: 7,
    contents: {
      title: '',
    },
  },
  {
    name: 'Question5',
    sequence: 8,
    type: 'QUESTION',
    contents: {
      type: 'TEXT',
      title: 'Tell me about what do you feel after the completion of the 6 minute walk test',
      explanation: 'Please describe all your symptoms and thoughts',
      required: true,
    },
  },
  {
    name: 'Question6',
    sequence: 9,
    type: 'QUESTION',
    contents: {
      type: 'DATETIME',
      title: 'How long was did your symptoms last?',
      required: true,
      properties: {
        tag: 'DATETIME',
        isDate: true,
        isTime: true,
        isRange: true,
      },
    },
  },
  {
    name: 'Question7',
    sequence: 10,
    type: 'QUESTION',
    contents: {
      type: 'DATETIME',
      title: 'Please note down the time when you take the medication yesterday.',
      required: true,
      properties: {
        tag: 'DATETIME',
        isDate: false,
        isTime: true,
        isRange: false,
      },
    },
  },
  {
    name: 'Question8',
    sequence: 11,
    type: 'QUESTION',
    contents: {
      type: 'DATETIME',
      title: 'When was your last visit to the clinician?',
      required: true,
      properties: {
        tag: 'DATETIME',
        isDate: true,
        isTime: false,
        isRange: false,
      },
    },
  },
  {
    name: 'Question9',
    sequence: 12,
    type: 'QUESTION',
    contents: {
      type: 'DATETIME',
      title: 'When was your last visit to the clinician?',
      required: true,
      properties: {
        tag: 'DATETIME',
        isDate: true,
        isTime: false,
        isRange: true,
      },
    },
  },
  {
    name: 'Question10',
    sequence: 13,
    type: 'QUESTION',
    contents: {
      type: 'DATETIME',
      title: 'Please enter the date and time of your last appointment of the lab visit.',
      required: true,
      properties: {
        tag: 'DATETIME',
        isDate: true,
        isTime: true,
        isRange: false,
      },
    },
  },
  {
    name: 'Question11',
    sequence: 14,
    type: 'QUESTION',
    contents: {
      type: 'RANK',
      title: 'Please rank the following symptoms based on how frequently you feel them yesterday.',
      explanation: 'Please drag the symptoms to rank them.',
      required: true,
      properties: {
        tag: 'RANK',
        options: rankAnswerValues.map((value) => ({ value })),
      },
    },
  },
  {
    name: 'Question12',
    sequence: 15,
    type: 'QUESTION',
    contents: {
      type: 'CHOICE',
      title: 'Did you experience nausea today? (dropdown)',
      required: true,
      properties: {
        tag: 'DROPDOWN',
        options: [
          { value: 'Yes', label: 'Yes' },
          { value: 'No', label: 'No' },
          { value: 'I dont remember', label: 'I dont remember' },
        ],
      },
    },
  },
];

export const mockTasks = _range(30).map((idx) => ({
  id: String(idx),
  revisionId: 0,
  title: `${idx} Survey placeholder for title maximum two lines${
    idx === 2 ? ' text extension' : ''
  }`,
  status: idx % 2 === 1 ? ('DRAFT' as const) : ('PUBLISHED' as const),
  startTime: new Date(Date.now() - idx * 24 * 60 * 60 * 1000).toISOString(),
  publishedAt:
    idx % 2 === 1 ? undefined : new Date(Date.now() - idx * 24 * 60 * 60 * 1000).toISOString(),
  createdAt: new Date(Date.now() - idx * 2 * 24 * 60 * 60 * 1000).toISOString(),
  schedule: '',
  validTime: 0,
  items: mockTasksItems,
  description: `${idx} survey description`,
})) as Task[];

export const findMockTaskById = (id: string) => mockTasks.find((tt) => tt.id === id);

API.mock.provideEndpoints({
  getTasks() {
    return API.mock.response(mockTasks);
  },
  getTask({ id }) {
    const t = findMockTaskById(id);
    return t ? API.mock.response([t]) : API.mock.failedResponse({ status: 404 });
  },
  getTaskRespondedUsersCount() {
    return API.mock.response({
      taskResults: mockTasks.map((t) => ({
        taskId: t.id,
        numberOfRespondedUser: {
          count: Math.floor(Math.random() * 150),
        },
      })),
    });
  },
});

type SurveyItemId = string;

export interface SurveyListItem {
  id: SurveyItemId;
  title: string;
  description?: string;
  status: Task['status'];
  totalParticipants: number;
  respondedParticipants: number;
  modifiedAt: Timestamp;
  publishedAt?: Timestamp;
  revisionId?: number;
}

interface SurveyListCategories {
  drafts: SurveyListItem[];
  published: SurveyListItem[];
}

export const parseDateFromSurveyListApi = <T extends string | undefined>(
  date: T
): T extends undefined ? Timestamp | undefined : Timestamp =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (date ? DateTime.fromISO(date, { zone: 'utc' }).toMillis() : undefined) as any;

export interface SurveyListSliceFetchArgs {
  studyId: string;
}

export const transformSurveyListItemFromApi = (
  t: Task,
  totalParticipants: number,
  respondedParticipants: number
): SurveyListItem => ({
  id: t.id,
  title: t.title || '',
  status: t.status,
  modifiedAt: parseDateFromSurveyListApi(t.createdAt),
  publishedAt: t.publishedAt ? parseDateFromSurveyListApi(t.publishedAt) : undefined, // TODO: need to have a new field in API
  revisionId: t.revisionId,
  description: t.description,
  totalParticipants,
  respondedParticipants,
});

export const transformSurveyListFromApi = ({
  tasksData,
  totalParticipantsData,
  taskResponsesCountData,
}: {
  tasksData: TaskListResponse;
  totalParticipantsData: CountTableRowsResponse;
  taskResponsesCountData: TaskResultsResponse;
}): SurveyListCategories => {
  const totalParticipants = Number(totalParticipantsData?.count) || 0;

  const tasks: SurveyListItem[] = (Array.isArray(tasksData) ? tasksData : []).map((t) =>
    transformSurveyListItemFromApi(
      t,
      totalParticipants,
      Number(
        taskResponsesCountData.taskResults?.find((trc) => trc.taskId === t.id)
          ?.numberOfRespondedUser?.count
      ) || 0
    )
  );

  return sortTaskList({
    drafts: tasks.filter((t) => t.status === 'DRAFT'),
    published: tasks.filter((t) => t.status === 'PUBLISHED'),
  });
};

export const surveyListSlice = createDataSlice({
  name: 'studyManagement/surveyList',
  fetchData: async ({ studyId }: SurveyListSliceFetchArgs) => {
    const [{ data: tasksData }, { data: taskResponsesCountData }, { data: totalParticipantsData }] =
      await Promise.all([
        API.getTasks({ projectId: studyId }),
        API.getTaskRespondedUsersCount({ projectId: studyId }),
        API.getUserProfilesCount({ projectId: studyId }),
      ]);

    return transformSurveyListFromApi({
      tasksData,
      taskResponsesCountData,
      totalParticipantsData,
    });
  },
});

export const surveyListDataSelector = (state: RootState): SurveyListCategories | undefined =>
  state[surveyListSlice.name]?.data;

export const useSurveyListData = surveyListSlice.hook;

export default {
  [surveyListSlice.name]: surveyListSlice.reducer,
};
