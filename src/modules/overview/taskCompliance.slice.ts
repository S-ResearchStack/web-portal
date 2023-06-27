import API, {
  CountTableRowsResponse,
  TaskType,
  TaskListResponse,
  TaskResultsResponse,
  ActivityListResponse,
} from 'src/modules/api';
import createDataSlice from 'src/modules/store/createDataSlice';
import {
  activityGroupByType,
  activityTypeNameByType,
} from '../study-management/user-management/task-management/activity/activities.utils';

type TaskComplianceSliceFetchArgs = {
  studyId: string;
};

export type TaskWithProgress = {
  id: string;
  type: TaskType;
  revisionId: number;
  title?: string;
  description: string;
  total: number;
  responded?: number;
  progress: number;
};

export const transformTaskComplianceFromApi = ({
  surveyList,
  activityList,
  taskResponsesCountData,
  totalParticipantsCountData,
}: {
  surveyList: TaskListResponse;
  activityList: ActivityListResponse;
  taskResponsesCountData: TaskResultsResponse;
  totalParticipantsCountData: CountTableRowsResponse;
}): TaskWithProgress[] => {
  const total = Number(totalParticipantsCountData?.count) || 0;

  const res: TaskWithProgress[] = [];
  surveyList
    .filter((s) => s.status === 'PUBLISHED')
    .forEach((s) => {
      res.push({
        id: s.id,
        type: 'survey',
        revisionId: s.revisionId,
        title: s.title,
        description: 'Survey',
        total,
        progress: 0,
      });
    });
  activityList
    .filter((a) => a.status === 'PUBLISHED')
    .forEach((a) => {
      const type = a.items?.[0]?.contents?.type;
      const group = type && activityGroupByType(type);
      const groupTitle = group && activityTypeNameByType(group);

      res.push({
        id: a.id,
        type: 'activity',
        revisionId: a.revisionId,
        title: a.title,
        description: groupTitle ? `${groupTitle} Activity` : 'Activity',
        total,
        progress: 0,
      });
    });

  res.forEach((t) => {
    t.responded =
      taskResponsesCountData.taskResults?.find((tt) => tt.taskId === t.id)?.numberOfRespondedUser
        ?.count || 0;
    t.progress = t.total === 0 ? 0 : t.responded / t.total;
  });

  return res;
};

export const taskComplianceSlice = createDataSlice({
  name: 'overview/taskCompliance',
  fetchData: async ({ studyId }: TaskComplianceSliceFetchArgs) => {
    const [
      { data: surveyList },
      { data: activityList },
      { data: taskResponsesCountData },
      { data: totalParticipantsCountData },
    ] = await Promise.all([
      API.getTasks({ projectId: studyId }),
      API.getActivities({ projectId: studyId }),
      API.getTaskRespondedUsersCount({ projectId: studyId }),
      API.getUserProfilesCount({ projectId: studyId }),
    ]);

    return transformTaskComplianceFromApi({
      surveyList,
      activityList,
      taskResponsesCountData,
      totalParticipantsCountData,
    });
  },
});

export const useTaskComplianceData = taskComplianceSlice.hook;

export default {
  [taskComplianceSlice.name]: taskComplianceSlice.reducer,
};
