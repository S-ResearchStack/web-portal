import _range from 'lodash/range';
import createDataSlice from 'src/modules/store/createDataSlice';
import API, {
  ParticipantListTotalItemsSqlRow,
  TaskItem,
  TaskListResponse,
  TaskRespondedUsersCountSqlRow,
} from 'src/modules/api';
import { Timestamp } from 'src/common/utils/datetime';
import { Task } from 'src/modules/api/models/tasks';
import { RootState } from 'src/modules/store';
import Random from 'src/common/Random';

export const mockTasksItems: TaskItem[] = [
  {
    name: 'Question0',
    sequence: 0,
    type: 'QUESTION',
    contents: {
      type: 'CHOICE',
      title: 'Did you experience nausea today?',
      required: true,
      properties: {
        tag: 'radio',
        options: [{ value: 'Yes' }, { value: 'No' }, { value: 'I dont remember' }],
      },
    },
  },
  {
    name: 'Question1',
    sequence: 1,
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
      },
    },
  },
  {
    name: 'Question2',
    sequence: 2,
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
];

export const mockTasks = _range(30).map((idx) => ({
  id: String(idx),
  revisionId: 0,
  title: `${idx} Survey placeholder for title maximum two lines${
    idx === 2 ? ' text extension' : ''
  }`,
  status: idx % 2 === 1 ? ('DRAFT' as const) : ('PUBLISHED' as const),
  startTime: new Date().toISOString(),
  createdAt: new Date(1659679200000).toISOString(),
  schedule: '',
  validTime: 0,
  items: mockTasksItems,
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
    return API.mock.response(
      mockTasks.map((t) => ({
        task_id: t.id,
        num_users_responded: String(Math.round(new Random(1).num(0, mockTasks.length))),
      }))
    );
  },
});

export type SurveyItemId = string;

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

export interface SurveyListCategories {
  drafts: SurveyListItem[];
  published: SurveyListItem[];
}

export const parseDateFromSurveyListApi = <T extends string | undefined>(
  date: T
): T extends undefined ? Timestamp | undefined : Timestamp =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (date ? new Date(date).valueOf() : undefined) as any;

export interface SurveyListSliceFetchArgs {
  studyId: string;
}

export const transformSurveyListFromApi = ({
  tasksData,
  totalParticipantsData,
  taskResponsesCountData,
}: {
  tasksData: TaskListResponse;
  totalParticipantsData: ParticipantListTotalItemsSqlRow[];
  taskResponsesCountData: TaskRespondedUsersCountSqlRow[];
}): SurveyListCategories => {
  const totalParticipants = Number(totalParticipantsData[0]?.total) || 0;

  const tasks: SurveyListItem[] = tasksData.map((t) => ({
    id: t.id,
    title: t.title || '',
    status: t.status,
    modifiedAt: parseDateFromSurveyListApi(t.createdAt),
    publishedAt: t.publishedAt ? parseDateFromSurveyListApi(t.publishedAt) : undefined, // TODO: need to have a new field in API
    revisionId: t.revisionId,
    description: t.description,
    totalParticipants,
    respondedParticipants:
      Number(taskResponsesCountData.find((trc) => trc.task_id === t.id)?.num_users_responded) || 0,
  }));

  return {
    drafts: tasks.filter((t) => t.status === 'DRAFT'),
    published: tasks.filter((t) => t.status === 'PUBLISHED'),
  };
};

export const surveyListSlice = createDataSlice({
  name: 'trialManagement/surveyList',
  fetchData: async ({ studyId }: SurveyListSliceFetchArgs) => {
    const [{ data: tasksData }, { data: taskResponsesCountData }, { data: totalParticipantsData }] =
      await Promise.all([
        API.getTasks({ projectId: studyId }),
        API.getTaskRespondedUsersCount({ projectId: studyId }),
        API.getParticipantsTotalItems({ projectId: studyId }),
      ]);

    return transformSurveyListFromApi({
      tasksData,
      taskResponsesCountData,
      totalParticipantsData,
    });
  },
});

export const surveyListDataSelector = (state: RootState): SurveyListCategories | undefined =>
  state[surveyListSlice.name].data;

export const useSurveyListData = surveyListSlice.hook;

export default {
  [surveyListSlice.name]: surveyListSlice.reducer,
};
