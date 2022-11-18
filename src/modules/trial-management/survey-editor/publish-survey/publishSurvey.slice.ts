import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { replace } from 'connected-react-router';
import { DateTime, Duration } from 'luxon';
import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { generatePath } from 'react-router-dom';
import API from 'src/modules/api';
import applyDefaultApiErrorHandlers from 'src/modules/api/applyDefaultApiErrorHandlers';
import { TaskUpdate } from 'src/modules/api/models/tasks';
import { Path } from 'src/modules/navigation/store';
import { AppThunk, ErrorType, RootState, useAppDispatch, WithSending } from 'src/modules/store';
import createDataSlice from 'src/modules/store/createDataSlice';
import { surveyListSlice } from '../../surveyList.slice';
import { editedSurveySelector } from '../surveyEditor.slice';

export const participantsTimeZonesMock = [
  'Europe/Paris',
  'America/New_York',
  'Europe/Malta',
  'Atlantic/Bermuda',
  'Asia/Seoul',
];

API.mock.provideEndpoints({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getParticipantsTimeZones({ projectId }) {
    return API.mock.response(participantsTimeZonesMock);
  },
});

const participantsTimeZonesSlice = createDataSlice({
  name: 'survey/participantsTimeZones',
  fetchData: async ({ studyId }: { studyId: string }) => {
    const { data: timeZones } = await API.getParticipantsTimeZones({
      projectId: studyId,
    });

    return timeZones;
  },
});

export const useParticipantsTimeZones = participantsTimeZonesSlice.hook;

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

export type PublishSurveyInfo = {
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
  s: Pick<PublishSurveyInfo, 'frequency' | 'startDate' | 'publishTime'>
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

export const publishSurveyInfoToApi = (s: PublishSurveyInfo): Partial<TaskUpdate> => {
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

type PublishSurveyState = WithSending;

export const publishSurveyInitialState: PublishSurveyState = {
  isSending: false,
  error: undefined,
};

export const publishSurveySlice = createSlice({
  name: 'survey/publishSurvey',
  initialState: publishSurveyInitialState,
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

export const publishSurveySelector = (state: RootState): PublishSurveyState =>
  state[publishSurveySlice.name];

export const publishSurvey =
  (info: PublishSurveyInfo): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    const survey = editedSurveySelector(getState());
    if (!survey?.id) {
      return;
    }

    try {
      dispatch(publishSurveySlice.actions.sendingStarted());

      const { studyId: projectId, id, revisionId } = survey;
      const [apiTask] = (await API.getTask({ projectId, id })).data;
      const taskUpdate = {
        ...apiTask,
        ...publishSurveyInfoToApi(info),
      };
      const res = await API.updateTask({ projectId, id, revisionId }, taskUpdate);
      res.checkError();

      dispatch(surveyListSlice.actions.refetch());
      dispatch(replace(generatePath(Path.TrialManagement)));

      dispatch(publishSurveySlice.actions.sendingSuccess());
    } catch (e) {
      applyDefaultApiErrorHandlers(e, dispatch);
      dispatch(publishSurveySlice.actions.sendingFailure(String(e)));
    }
  };

export const usePublishSurveySlice = () => {
  const dispatch = useAppDispatch();
  const sliceState = useSelector(publishSurveySelector);
  const publish = useCallback(
    (info: PublishSurveyInfo) => dispatch(publishSurvey(info)),
    [dispatch]
  );

  return {
    ...sliceState,
    publish,
  };
};

export default {
  [participantsTimeZonesSlice.name]: participantsTimeZonesSlice.reducer,
  [publishSurveySlice.name]: publishSurveySlice.reducer,
};
