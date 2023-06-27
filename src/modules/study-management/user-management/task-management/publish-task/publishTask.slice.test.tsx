import React from 'react';
import { matchPath } from 'react-router-dom';
import { Provider } from 'react-redux';

import { act, renderHook, waitFor } from '@testing-library/react';
import { makeHistory, Path } from 'src/modules/navigation/store';
import { AppDispatch, makeStore } from 'src/modules/store/store';
import Api from 'src/modules/api';
import { maskEndpointAsFailure } from 'src/modules/api/mock';
import { surveyEditorSlice, SurveyItem } from '../survey/survey-editor/surveyEditor.slice';
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

const data: PublishTashInfo = {
  type: 'survey',
  frequency: ScheduleFrequency.MONTHLY,
  startDate: '2022-11-04T10:40:00',
  endDate: '2022-12-04T10:40:00',
  publishTime: '2022-11-04T09:40:00',
  noExpiration: true,
  durationPeriodValue: 1,
  durationPeriod: DurationPeriod.DAY,
  lateResponse: true,
};

describe('publishSurveyInfoToApi', () => {
  it('should convert', () => {
    expect(publishTaskInfoToApi(data)).toEqual({
      endTime: '2022-12-04T09:40',
      schedule: '0 40 9 4 * ? *',
      startTime: '2022-11-04T09:40',
      status: 'PUBLISHED',
      validTime: 1440,
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

const survey: SurveyItem = {
  studyId: '',
  id: '1',
  revisionId: 0,
  title: 'test-title',
  description: '',
  questions: [],
};

describe('publishSurvey', () => {
  it('should send survey', async () => {
    expect(publishTaskSelector(store.getState())).toEqual({
      isSending: false,
      error: undefined,
    });

    dispatch(surveyEditorSlice.actions.setSurvey(survey));
    dispatch(publishTask(data));

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
        path: Path.StudyManagement,
        exact: true,
      })
    ).not.toBeNull();
  });

  it('[NEGATIVE] should catch error while survey sending', async () => {
    await Api.mock.maskEndpointAsFailure('updateTask', async () => {
      dispatch(surveyEditorSlice.actions.setSurvey(survey));
      dispatch(publishTask(data));

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

  it('should send data', async () => {
    hook = setUpPublishSurveySliceHook();
    dispatch(surveyEditorSlice.actions.setSurvey(survey));

    expect(hook.result.current).toMatchObject({
      isSending: false,
    });

    act(() => {
      hook.result.current.publish(data);
    });

    await waitFor(() => expect(hook.result.current.isSending).toBeFalsy());

    expect(hook.result.current).toMatchObject({
      isSending: false,
      error: undefined,
    });
  });

  it('[NEGATIVE] should send data with failed response', async () => {
    const error = 'test-error';

    hook = setUpPublishSurveySliceHook();
    dispatch(surveyEditorSlice.actions.setSurvey(survey));

    expect(hook.result.current).toMatchObject({
      isSending: false,
    });

    await maskEndpointAsFailure(
      'updateTask',
      async () => {
        act(() => {
          hook.result.current.publish(data);
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
