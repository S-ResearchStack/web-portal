import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { generatePath } from 'react-router-dom';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { replace } from 'connected-react-router';
import { DateTime, Duration } from 'luxon';

import API, { ActivityTask, ActivityTaskUpdate, Task, TaskType } from 'src/modules/api';
import applyDefaultApiErrorHandlers from 'src/modules/api/applyDefaultApiErrorHandlers';
import { TaskUpdate } from 'src/modules/api/models/tasks';
import { Path } from 'src/modules/navigation/store';
import { AppThunk, ErrorType, RootState, useAppDispatch, WithSending } from 'src/modules/store';
import {
  moveListItemToPublish,
  sortTaskList,
} from 'src/modules/study-management/user-management/common/utils';
import {
  surveyListDataSelector,
  surveyListSlice,
  transformSurveyListItemFromApi,
} from '../survey/surveyList.slice';
import {
  activitiesListDataSelector,
  activitiesListSlice,
  transformActivitiesListItemFromApi,
} from '../activity/activitiesList.slice';
import { editedSurveySelector } from '../survey/survey-editor/surveyEditor.slice';
import { editedActivitySelector } from '../activity/activity-editor/activityEditor.slice';

export enum ScheduleFrequency {
  ONE_TIME,
  DAILY,
  WEEKLY,
  MONTHLY,
}

export enum DurationPeriod {
  MINUTE,
  HOUR,
  DAY,
  WEEK,
  MONTH,
}

export type PublishTashInfo = {
  type: TaskType;
  frequency: ScheduleFrequency;
  startDate: string;
  endDate?: string;
  publishTime: string;
  noExpiration?: boolean;
  durationPeriodValue: number;
  durationPeriod: DurationPeriod;
  lateResponse: boolean;
};

export const frequencyToCron = (
  s: Pick<PublishTashInfo, 'frequency' | 'startDate' | 'publishTime'>
) => {
  const startDateDt = DateTime.fromISO(s.startDate);
  const timeDt = DateTime.fromISO(s.publishTime);

  const p = {
    second: '0',
    minute: timeDt.minute,
    hour: timeDt.hour,
    dayOfMonth: '*' as string | number,
    month: '*' as string | number,
    dayOfWeek: '?',
    year: '*' as string | number,
  };

  switch (s.frequency) {
    case ScheduleFrequency.ONE_TIME:
      p.dayOfMonth = startDateDt.day;
      p.month = startDateDt.month;
      p.year = startDateDt.year;
      break;
    case ScheduleFrequency.DAILY:
      break;
    case ScheduleFrequency.WEEKLY:
      p.dayOfMonth = '?';
      p.dayOfWeek = startDateDt.toFormat('ccc').toUpperCase();
      break;
    case ScheduleFrequency.MONTHLY:
      p.dayOfMonth = startDateDt.day;
      break;
    default:
      console.error(`Unexpected frequency ${s.frequency}`);
  }
  return `${p.second} ${p.minute} ${p.hour} ${p.dayOfMonth} ${p.month} ${p.dayOfWeek} ${p.year}`;
};

export const publishTaskInfoToApi = (s: PublishTashInfo): Partial<TaskUpdate> => {
  const dateTimeToApi = (date: string, time: string) =>
    `${DateTime.fromISO(date).toFormat('yyyy-LL-dd')}T${DateTime.fromISO(time).toFormat('T')}`;

  const durationKeyByPeriod = (p: DurationPeriod) =>
    ({
      [DurationPeriod.MINUTE]: 'minutes',
      [DurationPeriod.HOUR]: 'hours',
      [DurationPeriod.DAY]: 'days',
      [DurationPeriod.WEEK]: 'weeks',
      [DurationPeriod.MONTH]: 'months',
    }[p]);

  return {
    status: 'PUBLISHED',
    startTime: dateTimeToApi(s.startDate, s.publishTime),
    endTime:
      s.endDate && s.frequency !== ScheduleFrequency.ONE_TIME
        ? dateTimeToApi(s.endDate, s.publishTime)
        : undefined,
    validTime: Duration.fromObject({
      [durationKeyByPeriod(s.durationPeriod)]: s.durationPeriodValue,
    }).as('minutes'),
    schedule: frequencyToCron(s),
  };
};

type PublishTaskState = WithSending;

export const publishTaskInitialState: PublishTaskState = {
  isSending: false,
  error: undefined,
};

export const publishTaskSlice = createSlice({
  name: 'survey/publishSurvey',
  initialState: publishTaskInitialState,
  reducers: {
    sendingStarted: (state) => {
      state.isSending = true;
    },
    sendingSuccess: (state) => {
      state.isSending = false;
      state.error = undefined;
    },
    sendingFailure: (state, action: PayloadAction<ErrorType>) => {
      state.isSending = false;
      state.error = action.payload;
    },
  },
});

export const publishTaskSelector = (state: RootState): PublishTaskState =>
  state[publishTaskSlice.name];

const getTaskSelectorByTaskType = (type: TaskType) => {
  switch (type) {
    case 'activity':
      return editedActivitySelector;
    case 'survey':
      return editedSurveySelector;
    default:
      throw new Error('Unknown TaskType');
  }
};

export const publishTask =
  (info: PublishTashInfo): AppThunk<Promise<boolean>> =>
  async (dispatch, getState) => {
    const survey = getTaskSelectorByTaskType(info.type)(getState());
    if (!survey?.id) {
      return false;
    }

    try {
      dispatch(publishTaskSlice.actions.sendingStarted());

      const { studyId: projectId, id, revisionId } = survey;

      // TODO: refactor after join 'Survey' and 'Activity' types
      const [apiTask] =
        info.type === 'survey'
          ? (await API.getTask({ projectId, id })).data
          : (await API.getActivityTask({ projectId, id })).data;
      // TODO: incomplete skip logic should be ignored
      const taskUpdate = {
        ...apiTask,
        ...publishTaskInfoToApi(info),
      };
      const res =
        info.type === 'survey'
          ? await API.updateTask({ projectId, id, revisionId }, taskUpdate as TaskUpdate)
          : await API.updateActivityTask(
              { projectId, id, revisionId },
              taskUpdate as ActivityTaskUpdate
            );
      res.checkError();

      if (info.type === 'survey') {
        // update item in list
        const list = surveyListDataSelector(getState());
        if (list) {
          const categories = sortTaskList(
            moveListItemToPublish(
              transformSurveyListItemFromApi(taskUpdate as Task, 0, 0),
              list,
              (i) => ({
                ...i,
                publishedAt: Date.now(),
                modifiedAt: Date.now(),
                respondedParticipants: 0,
                status: 'PUBLISHED',
                totalParticipants: 0,
              })
            )
          );
          dispatch(surveyListSlice.actions.setData({ data: categories }));
        }

        dispatch(surveyListSlice.actions.refetch());
      } else if (info.type === 'activity') {
        const list = activitiesListDataSelector(getState());

        if (list) {
          const categories = sortTaskList(
            moveListItemToPublish(
              transformActivitiesListItemFromApi({
                task: taskUpdate as ActivityTask,
                totalParticipants: 0,
                respondedParticipants: 0,
              }),
              list,
              (i) => ({
                ...i,
                publishedAt: Date.now(),
                modifiedAt: Date.now(),
                respondedParticipants: 0,
                status: 'PUBLISHED',
                totalParticipants: 0,
              })
            )
          );
          dispatch(activitiesListSlice.actions.setData({ data: categories }));
        }

        dispatch(activitiesListSlice.actions.refetch());
      }
      dispatch(replace(generatePath(Path.StudyManagement)));

      dispatch(publishTaskSlice.actions.sendingSuccess());
      return true;
    } catch (e) {
      applyDefaultApiErrorHandlers(e, dispatch);
      dispatch(publishTaskSlice.actions.sendingFailure(String(e)));
      return false;
    }
  };

export const usePublishTaskSlice = () => {
  const dispatch = useAppDispatch();
  const sliceState = useSelector(publishTaskSelector);
  const publish = useCallback((info: PublishTashInfo) => dispatch(publishTask(info)), [dispatch]);

  return {
    ...sliceState,
    publish,
  };
};

export default {
  [publishTaskSlice.name]: publishTaskSlice.reducer,
};
