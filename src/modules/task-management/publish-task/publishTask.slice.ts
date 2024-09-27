import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { generatePath } from 'react-router-dom';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { replace } from 'connected-react-router';
import { DateTime, Duration } from 'luxon';
import _uniqueId from 'lodash/uniqueId';

import { parseDateTimeToApi } from 'src/common/utils/datetime';
import { DurationObject } from 'src/common/components/Duration/DurationForm';

import applyDefaultApiErrorHandlers from 'src/modules/api/applyDefaultApiErrorHandlers';
import { Path } from 'src/modules/navigation/store';
import { AppThunk, ErrorType, RootState, useAppDispatch, WithSending } from 'src/modules/store';
import { uploadObject } from 'src/modules/object-storage/utils';

import { newSurveyId } from '../survey/utils';
import { newActivityId } from '../activity/utils';
import { mockSurveys } from '../survey/surveyList.slice';
import { mockActivities } from '../activity/activitiesList.slice';
import { surveyUpdateToApi } from '../survey/survey-editor/surveyConversion';
import { activityUpdateToApi } from '../activity/activity-editor/activityConversion';
import { editedSurveySelector } from '../survey/survey-editor/surveyEditor.slice';
import { editedActivitySelector } from '../activity/activity-editor/activityEditor.slice';
import API, { ActivityResponse, PublishTaskInfo, BaseTaskType, BaseTaskStatus, TaskType, Activity, Survey } from 'src/modules/api';

API.mock.provideEndpoints({
  createSurvey({ }, surveyCreate) {
    const id = newSurveyId();
    const survey = {
      ...surveyCreate,
      id,
      createdAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
    }
    mockSurveys.push(survey);
    return API.mock.response(undefined);
  },
  createActivity({ }, activityCreate) {
    const id = newActivityId();
    const activity: ActivityResponse = {
      id,
      ...activityCreate,
      createdAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
    }
    mockActivities.push(activity);
    return API.mock.response(undefined);
  },
  getBlobFile() {
    const file = new File([], 'test_file', { type: 'image/png' });
    return API.mock.response(file);
  }
});

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
  duration: DurationObject;
  durationPeriodValue: number;
  durationPeriod: DurationPeriod;
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

export const publishTaskInfoToApi = (s: PublishTashInfo): PublishTaskInfo => {
  const durationKeyByPeriod = (p: DurationPeriod) =>
  ({
    [DurationPeriod.MINUTE]: 'minutes',
    [DurationPeriod.HOUR]: 'hours',
    [DurationPeriod.DAY]: 'days',
    [DurationPeriod.WEEK]: 'weeks',
    [DurationPeriod.MONTH]: 'months',
  }[p]);

  return {
    startTime: parseDateTimeToApi(s.startDate, s.publishTime),
    endTime:
      s.endDate && s.frequency !== ScheduleFrequency.ONE_TIME
        ? parseDateTimeToApi(s.endDate, s.publishTime)
        : parseDateTimeToApi(s.startDate, s.publishTime),
    duration: `${s.duration.amount} ${s.duration.durationUnitFirst} / ${s.duration.durationUnitSecond}`,
    validMin: Duration.fromObject({
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
  name: 'task/publishTask',
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

export const uploadFile = async (studyId: string, url: string): Promise<string | undefined> => {
  try {
    const getFileRes = await API.getBlobFile(url);
    getFileRes.checkError();
    const name = url.split('/').pop() || Date.now().toString();
    const blob = new File([getFileRes.data], studyId, { type: getFileRes.data.type });
    const path = await uploadObject({ studyId, name, blob });
    return path;
  } catch (error) {
    return;
  }
}

export const publishTask =
  (info: PublishTashInfo): AppThunk<Promise<boolean>> =>
    async (dispatch, getState) => {
      const task = getTaskSelectorByTaskType(info.type)(getState());
      if (!task || !task.studyId) {
        applyDefaultApiErrorHandlers(null, dispatch);
        dispatch(publishTaskSlice.actions.sendingFailure('Error'));
        return false;
      }
      const { studyId } = task;

      try {
        dispatch(publishTaskSlice.actions.sendingStarted());

        if (info.type === 'survey') {
          const data = editedSurveySelector(getState());

          const newSurvey: Survey = {
            taskType: BaseTaskType.SURVEY,
            status: BaseTaskStatus.PUBLISHED,
            iconUrl: '',
            ...surveyUpdateToApi(data),
            ...publishTaskInfoToApi(info)
          };

          if (data.iconUrl) {
            const iconUrl = await uploadFile(studyId, data.iconUrl);
            newSurvey.iconUrl = iconUrl || '';
          }

          const res = await API.createSurvey({ studyId }, newSurvey);
          res.checkError();

        } else {
          const data = editedActivitySelector(getState());

          const activityCreate: Activity = {
            taskType: BaseTaskType.ACTIVITY,
            status: BaseTaskStatus.PUBLISHED,
            iconUrl: '',
            ...activityUpdateToApi(data),
            ...publishTaskInfoToApi(info)
          };

          if (data.iconUrl) {
            const iconUrl = await uploadFile(studyId, data.iconUrl);
            activityCreate.iconUrl = iconUrl || '';
          }

          const res = await API.createActivity({ studyId }, activityCreate);
          res.checkError();
        }

        dispatch(publishTaskSlice.actions.sendingSuccess());
        dispatch(replace(generatePath(Path.TaskManagement)));
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
