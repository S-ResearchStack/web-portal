import React from 'react';
import { matchPath } from 'react-router-dom';
import { Provider } from 'react-redux';

import { act, renderHook, waitFor } from '@testing-library/react';
import { makeHistory, Path } from 'src/modules/navigation/store';
import { AppDispatch, makeStore } from 'src/modules/store/store';
import Api, { ActivityTaskType } from 'src/modules/api';
import { maskEndpointAsFailure } from 'src/modules/api/mock';
import { durationUnitFirstKey, durationUnitSecondKey } from 'src/common/components/Duration/DurationForm';
import { surveyEditorSlice, SurveyItem } from '../survey/survey-editor/surveyEditor.slice';
import { activityEditorSlice } from '../activity/activity-editor/activityEditor.slice';
import { ActivityTaskItem } from '../activity/activity-editor/activityConversion';
import {
  DurationPeriod,
  frequencyToCron,
  publishTask,
  PublishTashInfo,
  publishTaskInfoToApi,
  publishTaskInitialState,
  publishTaskSelector,
  publishTaskSlice,
  ScheduleFrequency,
  usePublishTaskSlice,
} from './publishTask.slice';

let history: ReturnType<typeof makeHistory>;
let store: ReturnType<typeof makeStore>;
let dispatch: AppDispatch;

const surveyData: PublishTashInfo = {
  type: 'survey',
  frequency: ScheduleFrequency.MONTHLY,
  startDate: '2022-11-04T10:40:00',
  endDate: '2022-12-04T10:40:00',
  duration: { amount: 10, durationUnitFirst: durationUnitFirstKey.MINUTE, durationUnitSecond: durationUnitSecondKey.DAY },
  publishTime: '2022-11-04T09:40:00',
  noExpiration: true,
  durationPeriodValue: 1,
  durationPeriod: DurationPeriod.DAY,
};
const activityData: PublishTashInfo = {
  type: 'activity',
  frequency: ScheduleFrequency.ONE_TIME,
  startDate: '2022-11-04T10:40:00',
  duration: { amount: 10, durationUnitFirst: durationUnitFirstKey.MINUTE, durationUnitSecond: durationUnitSecondKey.DAY },
  publishTime: '2022-11-04T09:40:00',
  durationPeriodValue: 1,
  durationPeriod: DurationPeriod.DAY,
};

const emptySurvey: SurveyItem = {
  studyId: '',
  id: '',
  title: '',
  description: '',
  questions: [],
};
const survey: SurveyItem = {
  studyId: 'test',
  id: '',
  title: 'test-title',
  description: 'test-description',
  questions: [],
};

const activity: ActivityTaskItem = {
  studyId: 'test',
  id: '',
  type: 'TAPPING_SPEED' as ActivityTaskType,
  title: 'test-title',
  description: 'test-description',
  items: [],
  iconUrl: 'https://test'
};

beforeEach(() => {
  history = makeHistory();
  store = makeStore(history);
  dispatch = store.dispatch;

  jest.restoreAllMocks();
});

describe('frequencyToCron', () => {
  const frequency = {
    publishTime: '2022-11-03T10:20:00',
    startDate: '2022-11-04T10:40:00',
  };

  it('should make cron schedule', () => {
    expect(
      frequencyToCron({
        ...frequency,
        frequency: ScheduleFrequency.ONE_TIME,
      })
    ).toEqual('0 20 10 4 11 ? 2022');

    expect(
      frequencyToCron({
        ...frequency,
        frequency: ScheduleFrequency.DAILY,
      })
    ).toEqual('0 20 10 * * ? *');

    expect(
      frequencyToCron({
        publishTime: '2022-11-03T10:20:00',
        startDate: '2022-11-04T10:40:00',
        frequency: ScheduleFrequency.WEEKLY,
      })
    ).toEqual('0 20 10 ? * FRI *');

    expect(
      frequencyToCron({
        publishTime: '2022-11-03T10:20:00',
        startDate: '2022-11-04T10:40:00',
        frequency: ScheduleFrequency.MONTHLY,
      })
    ).toEqual('0 20 10 4 * ? *');
  });

  it('[NEGATIVE] should catch unexpected frequency', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation();

    expect(
      frequencyToCron({
        publishTime: '2022-11-03T10:20:00',
        startDate: '2022-11-04T10:40:00',
        frequency: -1 as ScheduleFrequency,
      })
    ).toEqual('0 20 10 * * ? *');

    expect(consoleError).toHaveBeenCalled();
  });
});

describe('publishSurveyInfoToApi', () => {
  it('should convert survey data', () => {
    expect(publishTaskInfoToApi(surveyData)).toEqual({
      endTime: '2022-12-04T09:40',
      schedule: '0 40 9 4 * ? *',
      startTime: '2022-11-04T09:40',
      duration: '10 minute(s) / day',
      validMin: 1440,
    });
  });

  it('should convert activity data', () => {
    expect(publishTaskInfoToApi(activityData)).toEqual({
      endTime: '2022-11-04T09:40',
      schedule: '0 40 9 4 11 ? 2022',
      startTime: '2022-11-04T09:40',
      duration: '10 minute(s) / day',
      validMin: 1440,
    });
  });
});

describe('publishSurveySlice', () => {
  it('should make initial state', () => {
    expect(publishTaskSlice.reducer(undefined, { type: '' })).toEqual(publishTaskInitialState);
  });

  it('should support success lifecycle', () => {
    const currentState = publishTaskSlice.reducer(
      undefined,
      publishTaskSlice.actions.sendingStarted()
    );

    expect(currentState).toMatchObject({
      isSending: true,
    });

    expect(
      publishTaskSlice.reducer(currentState, publishTaskSlice.actions.sendingSuccess())
    ).toMatchObject({
      isSending: false,
      error: undefined,
    });
  });

  it('[NEGATIVE] should support failure lifecycle', () => {
    const error = 'test-error';
    const currentState = publishTaskSlice.reducer(
      undefined,
      publishTaskSlice.actions.sendingStarted()
    );

    expect(currentState).toMatchObject({
      isSending: true,
    });

    expect(
      publishTaskSlice.reducer(currentState, publishTaskSlice.actions.sendingFailure(error))
    ).toMatchObject({
      isSending: false,
      error,
    });
  });
});

describe('publishTask', () => {
  it('should send survey', async () => {
    expect(publishTaskSelector(store.getState())).toEqual({
      isSending: false,
      error: undefined,
    });

    dispatch(surveyEditorSlice.actions.setSurvey(survey));
    dispatch(publishTask(surveyData));

    expect(publishTaskSelector(store.getState())).toEqual({
      isSending: true,
      error: undefined,
    });

    await waitFor(() => publishTaskSelector(store.getState()).isSending);
    await waitFor(() => !publishTaskSelector(store.getState()).isSending);

    expect(publishTaskSelector(store.getState())).toEqual({
      isSending: false,
      error: undefined,
    });

    await waitFor(() => history.location.pathname !== '/');

    expect(
      matchPath(history.location.pathname, {
        path: Path.TaskManagement,
        exact: true,
      })
    ).not.toBeNull();
  });

  it('should send activity', async () => {
    expect(publishTaskSelector(store.getState())).toEqual({
      isSending: false,
      error: undefined,
    });

    dispatch(activityEditorSlice.actions.setActivityTask(activity));
    const isOK = await dispatch(publishTask(activityData));

    expect(isOK).toBeTruthy();

    expect(publishTaskSelector(store.getState())).toEqual({
      isSending: false,
      error: undefined,
    });

    await waitFor(() => history.location.pathname !== '/');

    expect(
      matchPath(history.location.pathname, {
        path: Path.TaskManagement,
        exact: true,
      })
    ).not.toBeNull();
  });

  it('[NEGATIVE] should catch error while empty survey sending', async () => {
    dispatch(surveyEditorSlice.actions.setSurvey(emptySurvey));
    dispatch(publishTask(surveyData));

    expect(publishTaskSelector(store.getState())).toEqual(
      expect.objectContaining({
        isSending: false,
        error: expect.any(String),
      })
    );
  });

  it('[NEGATIVE] should catch error while survey sending', async () => {
    await Api.mock.maskEndpointAsFailure('createSurvey', async () => {
      dispatch(surveyEditorSlice.actions.setSurvey(survey));
      dispatch(publishTask(surveyData));

      await waitFor(() => publishTaskSelector(store.getState()).isSending);
      await waitFor(() => !publishTaskSelector(store.getState()).isSending);

      expect(publishTaskSelector(store.getState())).toEqual(
        expect.objectContaining({
          isSending: false,
          error: expect.any(String),
        })
      );
    });
  });

  it('[NEGATIVE] should catch error while activity sending', async () => {
    await Api.mock.maskEndpointAsFailure('createActivity', async () => {
      dispatch(activityEditorSlice.actions.setActivityTask(activity));

      const isOK = await dispatch(publishTask(activityData));

      expect(isOK).toBeFalsy();

      expect(publishTaskSelector(store.getState())).toEqual(
        expect.objectContaining({
          isSending: false,
          error: expect.any(String),
        })
      );
    });
  });
});

describe('usePublishSurveySlice', () => {
  const setUpPublishSurveySliceHook = () =>
    renderHook(() => usePublishTaskSlice(), {
      wrapper: ({ children }: React.PropsWithChildren) => (
        <Provider store={store}>{children}</Provider>
      ),
    });

  let hook: ReturnType<typeof setUpPublishSurveySliceHook>;

  const unsetHook = (h: ReturnType<typeof setUpPublishSurveySliceHook>) => {
    act(() => {
      h.unmount();
    });
  };

  afterEach(() => {
    unsetHook(hook);
  });

  it('should send survey data', async () => {
    hook = setUpPublishSurveySliceHook();
    dispatch(surveyEditorSlice.actions.setSurvey(survey));

    expect(hook.result.current).toMatchObject({
      isSending: false,
    });

    act(() => {
      hook.result.current.publish(surveyData);
    });

    await waitFor(() => expect(hook.result.current.isSending).toBeFalsy());

    expect(hook.result.current).toMatchObject({
      isSending: false,
      error: undefined,
    });
  });

  it('should send activity data', async () => {
    hook = setUpPublishSurveySliceHook();
    dispatch(activityEditorSlice.actions.setActivityTask(activity));

    expect(hook.result.current).toMatchObject({
      isSending: false,
    });

    act(() => {
      hook.result.current.publish(activityData);
    });

    await waitFor(() => expect(hook.result.current.isSending).toBeFalsy());

    expect(hook.result.current).toMatchObject({
      isSending: false,
      error: undefined,
    });
  });

  it('[NEGATIVE] should send survey data with failed response', async () => {
    const error = 'test-error';

    hook = setUpPublishSurveySliceHook();
    dispatch(surveyEditorSlice.actions.setSurvey(survey));

    expect(hook.result.current).toMatchObject({
      isSending: false,
    });

    await maskEndpointAsFailure(
      'createSurvey',
      async () => {
        act(() => {
          hook.result.current.publish(surveyData);
        });

        await waitFor(() => expect(hook.result.current.isSending).toBeFalsy());
      },
      { message: error }
    );

    expect(hook.result.current).toMatchObject({
      isSending: false,
      error: `Error: ${error}`,
    });
  });

  it('[NEGATIVE] should send activity data with failed response', async () => {
    const error = 'test-error';

    hook = setUpPublishSurveySliceHook();
    dispatch(activityEditorSlice.actions.setActivityTask(activity));

    expect(hook.result.current).toMatchObject({
      isSending: false,
    });

    await maskEndpointAsFailure(
      'createActivity',
      async () => {
        act(() => {
          hook.result.current.publish(activityData);
        });

        await waitFor(() => expect(hook.result.current.isSending).toBeFalsy());
      },
      { message: error }
    );

    expect(hook.result.current).toMatchObject({
      isSending: false,
      error: `Error: ${error}`,
    });
  });
});
