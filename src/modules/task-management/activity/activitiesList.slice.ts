import _range from 'lodash/range';

import { RootState } from 'src/modules/store';
import { parseDateFromApi, Timestamp } from 'src/common/utils/datetime';
import { sortTaskList } from 'src/modules/common/utils';
import { activityGroupByType, activityTypes, activityTypeToTitle } from './activities.utils';
import createDataSlice from 'src/modules/store/createDataSlice';
import API, {
  BaseTaskType,
  BaseTaskStatus,
  ActivityResponse,
  ActivityListResponse,
  ActivityTaskType,
  ActivityTaskItemGroup,
  TaskResultsResponse,
  CountTableRowsResponse,
} from 'src/modules/api';

const activitiesGroupAndType = activityTypes
  .map((key) => key[1].map((v) => [key[0], v] as const))
  .flat();

export const mockActivities: ActivityResponse[] = _range(24).map((idx) => {
  const counter = Math.floor(idx / activitiesGroupAndType.length);
  const groupAndTypeIdx =
    activitiesGroupAndType.length - 1 < idx ? Math.round(idx % activitiesGroupAndType.length) : idx;

  return {
    id: String(idx),
    taskType: BaseTaskType.ACTIVITY,
    status: idx < 12 ? BaseTaskStatus.CREATED : BaseTaskStatus.PUBLISHED,
    title: `${activityTypeToTitle(activitiesGroupAndType[groupAndTypeIdx][1])}\u00A0${counter > 0 ? counter + 1 : ''}`.trim(),
    description: `${idx} activity description`,
    createdAt: new Date(Date.now() - idx * 2 * 24 * 60 * 60 * 1000).toISOString(),
    publishedAt: idx < 12 ? undefined : new Date(Date.now() - idx * 24 * 60 * 60 * 1000).toISOString(),
    startTime: new Date(Date.now() - idx * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - idx * 24 * 60 * 60 * 1000).toISOString(),
    schedule: '* * * * * ? *',
    validMin: 0,
    duration: '',
    task: {
      type: activitiesGroupAndType[groupAndTypeIdx][1],
      completionTitle: '',
      completionDescription: '',
    }
  };
});
export const findMockTaskById = (id: string) => mockActivities.find((tt) => tt.id === id);

API.mock.provideEndpoints({
  getActivities() {
    return API.mock.response(mockActivities);
  },
});

export interface ActivitiesListItem {
  id: string;
  title: string;
  type: ActivityTaskType;
  group: ActivityTaskItemGroup;
  description?: string;
  status: BaseTaskStatus;
  totalParticipants: number;
  respondedParticipants: number;
  modifiedAt?: Timestamp;
  publishedAt?: Timestamp;
}

interface ActivitiesListCategories {
  drafts: ActivitiesListItem[];
  published: ActivitiesListItem[];
}

export interface ActivitiesListSliceFetchArgs {
  studyId: string;
}

type TransformActivitiesListItemFromApiParams = {
  task: ActivityResponse;
  totalParticipants: number;
  respondedParticipants: number;
};

export const transformActivitiesListItemFromApi = ({
  task,
  totalParticipants,
  respondedParticipants,
}: TransformActivitiesListItemFromApiParams): ActivitiesListItem => {
  const type = task.task.type;

  return {
    id: task.id,
    title: task.title,
    type,
    group: activityGroupByType(type),
    status: task.status,
    modifiedAt: parseDateFromApi(task.createdAt),
    publishedAt: parseDateFromApi(task.publishedAt),
    description: task.description,
    totalParticipants,
    respondedParticipants,
  };
};

export const transformActivitiesListFromApi = ({
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
      t.status = t.status || BaseTaskStatus.PUBLISHED;
      const type = t.task.type;

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
    drafts: tasks.filter((t) => t.status === BaseTaskStatus.CREATED),
    published: tasks.filter((t) => t.status === BaseTaskStatus.PUBLISHED),
  });
};

export const activitiesListSlice = createDataSlice({
  name: 'task/activitiesList',
  fetchData: async ({ studyId }: ActivitiesListSliceFetchArgs) => {
    const [
      { data: tasksData },
    ] = await Promise.all([
      API.getActivities({ studyId }),
    ]);

    return transformActivitiesListFromApi({
      tasksData,
      taskResponsesCountData: {},
      totalParticipantsData: {},
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
