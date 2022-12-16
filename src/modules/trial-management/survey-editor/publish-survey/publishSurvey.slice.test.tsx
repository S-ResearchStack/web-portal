import { act, renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { makeHistory, Path } from 'src/modules/navigation/store';
import { AppDispatch, makeStore } from 'src/modules/store/store';
import {
  DurationPeriod,
  frequencyToCron,
  participantsTimeZonesMock,
  publishSurvey,
  PublishSurveyInfo,
  publishSurveyInfoToApi,
  publishSurveyInitialState,
  publishSurveySelector,
  publishSurveySlice,
  ScheduleFrequency,
  useParticipantsTimeZones,
  usePublishSurveySlice,
} from 'src/modules/trial-management/survey-editor/publish-survey/publishSurvey.slice';
import Api from 'src/modules/api';
import {
  surveyEditorSlice,
  SurveyItem,
} from 'src/modules/trial-management/survey-editor/surveyEditor.slice';
import { matchPath } from 'react-router-dom';
import { maskEndpointAsFailure } from 'src/modules/api/mock';

let history: ReturnType<typeof makeHistory>;
let store: ReturnType<typeof makeStore>;
let dispatch: AppDispatch;

beforeEach(() => {
  history = makeHistory();
  store = makeStore(history);
  dispatch = store.dispatch;

  jest.restoreAllMocks();
});

describe('useParticipantsTimeZones', () => {
  const setUpParticipantsTimeZonesHook = (args: { studyId: string } | false) =>
    renderHook(
      (fetchArgs: { studyId: string }) =>
        useParticipantsTimeZones({ fetchArgs: fetchArgs || args }),
      {
        wrapper: ({ children }: React.PropsWithChildren<unknown>) => (
          <Provider store={store}>{children}</Provider>
        ),
      }
    );

  let hook: ReturnType<typeof setUpParticipantsTimeZonesHook>;

  const unsetHook = (h: ReturnType<typeof setUpParticipantsTimeZonesHook>) => {
    act(() => {
      h.result.current.reset();
      h.unmount();
    });
  };

  afterEach(() => {
    unsetHook(hook);
  });

  const studyId = 'study-id';

  it('should fetch timezones', async () => {
    hook = setUpParticipantsTimeZonesHook({ studyId });

    expect(hook.result.current.isLoading).toBeTruthy();

    await waitFor(() => expect(hook.result.current.isLoading).toBeFalsy());

    expect(hook.result.current.data).toEqual(participantsTimeZonesMock);
  });

  it('[NEGATIVE] should catch error while loading', async () => {
    await Api.mock.maskEndpointAsFailure('getParticipantsTimeZones', async () => {
      hook = setUpParticipantsTimeZonesHook({ studyId });

      expect(hook.result.current.isLoading).toBeTruthy();

      await waitFor(() => expect(hook.result.current.isLoading).toBeFalsy());

      expect(hook.result.current.data).toBeUndefined();
      expect(hook.result.current.error).not.toBeUndefined();
    });
  });

  it('[NEGATIVE] should fetch broken data', async () => {
    await Api.mock.maskEndpointAsSuccess(
      'getParticipantsTimeZones',
      async () => {
        hook = setUpParticipantsTimeZonesHook({ studyId });

        expect(hook.result.current.isLoading).toBeTruthy();

        await waitFor(() => expect(hook.result.current.isLoading).toBeFalsy());

        expect(hook.result.current.data).toBeNull();
        expect(hook.result.current.error).toBeUndefined();
      },
      { response: null }
    );
  });
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

const data: PublishSurveyInfo = {
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
    expect(publishSurveyInfoToApi(data)).toEqual({
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
    expect(publishSurveySlice.reducer(undefined, { type: '' })).toEqual(publishSurveyInitialState);
  });

  it('should support success lifecycle', () => {
    const currentState = publishSurveySlice.reducer(
      undefined,
      publishSurveySlice.actions.sendingStarted()
    );

    expect(currentState).toMatchObject({
      isSending: true,
    });

    expect(
      publishSurveySlice.reducer(currentState, publishSurveySlice.actions.sendingSuccess())
    ).toMatchObject({
      isSending: false,
      error: undefined,
    });
  });

  it('[NEGATIVE] should support failure lifecycle', () => {
    const error = 'test-error';
    const currentState = publishSurveySlice.reducer(
      undefined,
      publishSurveySlice.actions.sendingStarted()
    );

    expect(currentState).toMatchObject({
      isSending: true,
    });

    expect(
      publishSurveySlice.reducer(currentState, publishSurveySlice.actions.sendingFailure(error))
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
  questions: [
    {
      id: '1',
      title: 'test-title',
      type: 'single',
      description: '',
      optional: true,
      answers: [],
    },
  ],
};

describe('publishSurvey', () => {
  it('should send survey', async () => {
    expect(publishSurveySelector(store.getState())).toEqual({
      isSending: false,
      error: undefined,
    });

    dispatch(surveyEditorSlice.actions.setSurvey(survey));
    dispatch(publishSurvey(data));

    expect(publishSurveySelector(store.getState())).toEqual({
      isSending: true,
      error: undefined,
    });

    await waitFor(() => publishSurveySelector(store.getState()).isSending);
    await waitFor(() => !publishSurveySelector(store.getState()).isSending);

    expect(publishSurveySelector(store.getState())).toEqual({
      isSending: false,
      error: undefined,
    });

    await waitFor(() => history.location.pathname !== '/');

    expect(
      matchPath(history.location.pathname, {
        path: Path.TrialManagement,
        exact: true,
      })
    ).not.toBeNull();
  });

  it('[NEGATIVE] should catch error while survey sending', async () => {
    await Api.mock.maskEndpointAsFailure('updateTask', async () => {
      dispatch(surveyEditorSlice.actions.setSurvey(survey));
      dispatch(publishSurvey(data));

      await waitFor(() => publishSurveySelector(store.getState()).isSending);
      await waitFor(() => !publishSurveySelector(store.getState()).isSending);

      expect(publishSurveySelector(store.getState())).toEqual(
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
    renderHook(() => usePublishSurveySlice(), {
      wrapper: ({ children }: React.PropsWithChildren<unknown>) => (
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
