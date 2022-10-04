import _range from 'lodash/range';
import createDataSlice from 'src/modules/store/createDataSlice';
import API from 'src/modules/api';
import { Timestamp } from 'src/common/utils/datetime';
import { Task } from '../api/models/tasks';

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
  items: [],
})) as Task[];

API.mock.provideEndpoints({
  getTasks() {
    return API.mock.response(mockTasks);
  },
  getTask({ id }) {
    const t = mockTasks.find((tt) => tt.id === id);
    return t ? API.mock.response([t]) : API.mock.failedResponse({ status: 404 });
  },
  getTaskRespondedUsersCount() {
    return API.mock.response(
      mockTasks.map((t) => ({
        task_id: t.id,
        num_users_responded: String(Math.round(Math.random() * mockTasks.length)),
      }))
    );
  },
});

export type SurveyItemId = string;

export interface SurveyListItem {
  id: SurveyItemId;
  title: string;
  status: Task['status'];
  totalParticipants: number;
  respondedParticipants: number;
  modifiedAt: Timestamp;
  publishedAt?: Timestamp;
}

export interface SurveyListCategories {
  drafts: SurveyListItem[];
  published: SurveyListItem[];
}

const parseDate = <T extends string | undefined>(
  date: T
): T extends undefined ? Timestamp | undefined : Timestamp =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (date ? new Date(date).valueOf() : undefined) as any;

export const surveyListSlice = createDataSlice({
  name: 'trialManagement/surveyList',
  fetchData: async ({ studyId }: { studyId: string }) => {
    const [{ data: tasksData }, { data: taskResponsesCountData }, { data: totalParticipantsData }] =
      await Promise.all([
        API.getTasks({ projectId: studyId }),
        API.getTaskRespondedUsersCount({ projectId: studyId }),
        API.getParticipantsTotalItems({ projectId: studyId }),
      ]);

    const totalParticipants = Number(totalParticipantsData[0]?.total) || 0;

    const tasks = tasksData.map((t) => ({
      id: t.id,
      title: t.title,
      status: t.status,
      modifiedAt: parseDate(t.createdAt),
      publishedAt: parseDate(t.createdAt), // TODO: need to have a new field in API
      totalParticipants,
      respondedParticipants:
        Number(taskResponsesCountData.find((trc) => trc.task_id === t.id)?.num_users_responded) ||
        0,
    }));

    const results: SurveyListCategories = {
      drafts: tasks.filter((t) => t.status === 'DRAFT'),
      published: tasks.filter((t) => t.status === 'PUBLISHED'),
    };

    return results;
  },
});

export const useSurveyListData = surveyListSlice.hook;

export default {
  [surveyListSlice.name]: surveyListSlice.reducer,
};
