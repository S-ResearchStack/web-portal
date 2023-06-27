import _range from 'lodash/range';
import { DateTime } from 'luxon';

import createDataSlice from 'src/modules/store/createDataSlice';
import API, {
  ActivityListResponse,
  ActivityTask,
  ActivityTaskItemGroup,
  ActivityTaskType,
  CountTableRowsResponse,
} from 'src/modules/api';
import { Timestamp } from 'src/common/utils/datetime';
import { Task, TaskResultsResponse } from 'src/modules/api/models/tasks';
import { RootState } from 'src/modules/store';
import { sortTaskList } from 'src/modules/study-management/user-management/common/utils';
import { activityGroupByType, activityTypes, activityTypeToTitle } from './activities.utils';

const activitiesGroupAndType = activityTypes
  .map((key) => key[1].map((v) => [key[0], v] as const))
  .flat();

export const mockTasks = _range(24).map((idx) => {
  const counter = Math.floor(idx / activitiesGroupAndType.length);
  const groupAndTypeIdx =
    activitiesGroupAndType.length - 1 < idx ? Math.round(idx % activitiesGroupAndType.length) : idx;

  return {
    type: 'ACTIVITY',
    id: String(idx),
    revisionId: 0,
    title: `${activityTypeToTitle(activitiesGroupAndType[groupAndTypeIdx][1])}\u00A0${
      counter > 0 ? counter + 1 : ''
    }`.trim(),
    status: idx < 12 ? ('DRAFT' as const) : ('PUBLISHED' as const),
    startTime: new Date(Date.now() - idx * 24 * 60 * 60 * 1000).toISOString(),
    publishedAt:
      idx < 12 ? undefined : new Date(Date.now() - idx * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - idx * 2 * 24 * 60 * 60 * 1000).toISOString(),
    schedule: '',
    validTime: 0,
    description: `${idx} activity description`,
    items: [
      {
        type: 'ACTIVITY',
        sequence: 0,
        name: 'Activity0',
        contents: {
          completionTitle: '',
          completionDescription: '',
          type: activitiesGroupAndType[groupAndTypeIdx][1],
          required: true,
          properties: {
            transcription: '',
          },
        },
      },
    ],
  };
}) as ActivityTask[];

export const findMockTaskById = (id: string) => mockTasks.find((tt) => tt.id === id);

API.mock.provideEndpoints({
  getActivities() {
    return API.mock.response(mockTasks);
  },
  getActivityTask({ id }) {
    const t = findMockTaskById(id);
    return t ? API.mock.response([t]) : API.mock.failedResponse({ status: 404 });
  },
  updateActivityTask({ id }, task) {
    const idx = mockTasks.findIndex((t) => t.id === id);
    if (idx !== -1) {
      mockTasks[idx] = {
        ...mockTasks[idx],
        ...(task.status === 'PUBLISHED'
          ? { ...task, publishedAt: new Date().toISOString() }
          : task),
      } as ActivityTask;
    }
    return API.mock.response(undefined);
  },
});

type ActivityItemId = string;

export interface ActivitiesListItem {
  id: ActivityItemId;
  title: string;
  type: ActivityTaskType;
  group: ActivityTaskItemGroup;
  description?: string;
  status: Task['status'];
  totalParticipants: number;
  respondedParticipants: number;
  modifiedAt: Timestamp;
  publishedAt?: Timestamp;
  revisionId?: number;
}

interface ActivitiesListCategories {
  drafts: ActivitiesListItem[];
  published: ActivitiesListItem[];
}

const parseDateFromActivitiesListApi = <T extends string | undefined>(
  date: T
): T extends undefined ? Timestamp | undefined : Timestamp =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (date ? DateTime.fromISO(date, { zone: 'utc' }).toMillis() : undefined) as any;

export interface ActivitiesListSliceFetchArgs {
  studyId: string;
}

type TransformActivitiesListItemFromApiParams = {
  task: ActivityTask;
  totalParticipants: number;
  respondedParticipants: number;
};

export const transformActivitiesListItemFromApi = ({
  task,
  totalParticipants,
  respondedParticipants,
}: TransformActivitiesListItemFromApiParams): ActivitiesListItem => {
  const type = task.items?.[0]?.contents.type;

  return {
    id: task.id,
    title: task.title,
    type,
    group: activityGroupByType(type),
    status: task.status,
    modifiedAt: parseDateFromActivitiesListApi(task.createdAt),
    publishedAt: task.publishedAt ? parseDateFromActivitiesListApi(task.publishedAt) : undefined,
    revisionId: task.revisionId,
    description: task.description,
    totalParticipants,
    respondedParticipants,
  };
};

const transformActivitiesListFromApi = ({
  tasksData,
  totalParticipantsData,
  taskResponsesCountData,
}: {
  tasksData: ActivityListResponse;
  totalParticipantsData: CountTableRowsResponse;
  taskResponsesCountData: TaskResultsResponse;
}): ActivitiesListCategories => {
  const totalParticipants = Number(totalParticipantsData?.count) || 0;

  const tasks = (Array.isArray(tasksData) ? tasksData : [])
    .map((t) => {
      const type = t.items?.[0]?.contents.type;

      if (!type) {
        return undefined;
      }

      return transformActivitiesListItemFromApi({
        task: t,
        totalParticipants,
        respondedParticipants:
          Number(
            taskResponsesCountData.taskResults?.find((trc) => trc.taskId === t.id)
              ?.numberOfRespondedUser?.count
          ) || 0,
      });
    })
    .filter(Boolean) as ActivitiesListItem[];

  return sortTaskList({
    drafts: tasks.filter((t) => t.status === 'DRAFT'),
    published: tasks.filter((t) => t.status === 'PUBLISHED'),
  });
};

export const activitiesListSlice = createDataSlice({
  name: 'studyManagement/activitiesList',
  fetchData: async ({ studyId }: ActivitiesListSliceFetchArgs) => {
    const [{ data: tasksData }, { data: taskResponsesCountData }, { data: totalParticipantsData }] =
      await Promise.all([
        API.getActivities({ projectId: studyId }),
        API.getTaskRespondedUsersCount({ projectId: studyId }),
        API.getUserProfilesCount({ projectId: studyId }),
      ]);

    return transformActivitiesListFromApi({
      tasksData,
      taskResponsesCountData,
      totalParticipantsData,
    });
  },
});

export const activitiesListDataSelector = (
  state: RootState
): ActivitiesListCategories | undefined => state[activitiesListSlice.name]?.data;

export const useActivitiesListData = activitiesListSlice.hook;

export default {
  [activitiesListSlice.name]: activitiesListSlice.reducer,
};
