import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from 'src/modules/store/store';
import Random from 'src/common/Random';
import { BaseTaskStatus, BaseTaskType, CountTableRowsResponse, ActivityListResponse, ActivityTaskType, TaskResultsResponse } from 'src/modules/api';
import { maskEndpointAsFailure, maskEndpointAsSuccess } from 'src/modules/api/mock';
import {
  activitiesListDataSelector,
  activitiesListSlice,
  ActivitiesListSliceFetchArgs,
  transformActivitiesListFromApi,
  useActivitiesListData,
} from './activitiesList.slice';

describe('activitiesListSlice', () => {
  it('[NEGATIVE] should make empty state', () => {
    expect(activitiesListSlice.reducer(undefined, { type: 0 })).toEqual({
      fetchArgs: null,
      prevFetchArgs: null,
    });
  });
});

const setUpHook = (args: ActivitiesListSliceFetchArgs | false) =>
  renderHook(
    (fetchArgs: ActivitiesListSliceFetchArgs) => useActivitiesListData({ fetchArgs: fetchArgs || args }),
    {
      wrapper: ({ children }: React.PropsWithChildren) => (
        <Provider store={store}>{children}</Provider>
      ),
    }
  );

const unsetHook = (hook: ReturnType<typeof setUpHook>) => {
  hook.result.current.reset();
  hook.unmount();
};

const studyId = 'test-study';

const error = 'test-error';

describe('useActivitiesListData', () => {
  let hook: ReturnType<typeof setUpHook>;

  afterEach(() => {
    act(() => unsetHook(hook));
  });

  it('should fetch data', async () => {
    hook = setUpHook({ studyId });

    await waitFor(() => expect(hook.result.current.isLoading).toBeFalsy());

    expect(hook.result.current.error).toBeUndefined();
    expect(hook.result.current.data).not.toBeUndefined();
  });

  it('[NEGATIVE] should fetch broken data', async () => {
    await maskEndpointAsSuccess(
      'getActivities',
      async () => {
        act(() => {
          hook = setUpHook({ studyId });
        });

        await waitFor(() => expect(hook.result.current.isLoading).toBeFalsy());
      },
      { response: null }
    );

    expect(hook.result.current.error).toBeUndefined();
    expect(hook.result.current.data).not.toBeUndefined();
  });

  it('[NEGATIVE] should fetch data while request is failure', async () => {
    await maskEndpointAsFailure(
      'getActivities',
      async () => {
        act(() => {
          hook = setUpHook({ studyId });
        });

        await waitFor(() => expect(hook.result.current.isLoading).toBeFalsy());
      },
      { message: error }
    );

    expect(hook.result.current.error).toMatch(error);
    expect(hook.result.current.data).toBeUndefined();
  });
});

describe('transformActivitiesListFromApi', () => {
  it('should convert data from API', () => {
    const tasksData: ActivityListResponse = [
      {
        id: '1',
        taskType: BaseTaskType.ACTIVITY,
        status: BaseTaskStatus.CREATED,
        title: 'first',
        description: 'description',
        startTime: '2022-10-31T14:00:00',
        createdAt: '2022-10-31T12:00:00',
        schedule: '* * * * * ? *',
        validMin: 0,
        duration: '',
        endTime: '',
        iconUrl: '',
        task: {
          type: 'TAPPING_SPEED' as ActivityTaskType,
          completionTitle: '',
          completionDescription: '',
        },
      },
      {
        id: '2',
        taskType: BaseTaskType.ACTIVITY,
        status: BaseTaskStatus.PUBLISHED,
        title: 'second',
        description: 'description',
        startTime: '2022-10-31T14:00:00',
        createdAt: '2022-10-31T12:00:00',
        publishedAt: '2022-10-31T12:00:00',
        schedule: '* * * * * ? *',
        validMin: 0,
        duration: '',
        endTime: '',
        iconUrl: '',
        task: {
          type: 'SUSTAINED_PHONATION' as ActivityTaskType,
          completionTitle: '',
          completionDescription: '',
        },
      },
    ];

    const totalParticipantsData: CountTableRowsResponse = { count: 10 };

    const taskResponsesCountData: TaskResultsResponse = {
      taskResults: tasksData.map((t) => ({
        taskId: t.id,
        numberOfRespondedUser: {
          count: Math.round(new Random(1).num(0, tasksData.length)),
        },
      })),
    };

    expect(
      transformActivitiesListFromApi({
        tasksData,
        totalParticipantsData,
        taskResponsesCountData,
      })
    ).toEqual({
      drafts: [
        {
          id: '1',
          type: 'TAPPING_SPEED',
          group: 'MOTOR',
          modifiedAt: new Date(2022, 9, 31, 12, 0, 0, 0).valueOf(),
          publishedAt: undefined,
          respondedParticipants: 1,
          status: 'CREATED',
          title: 'first',
          description: 'description',
          totalParticipants: 10,
        },
      ],
      published: [
        {
          id: '2',
          type: 'SUSTAINED_PHONATION',
          group: 'AUDIO',
          modifiedAt: new Date(2022, 9, 31, 12, 0, 0, 0).valueOf(),
          publishedAt: new Date(2022, 9, 31, 12, 0, 0, 0).valueOf(),
          respondedParticipants: 1,
          status: 'PUBLISHED',
          title: 'second',
          description: 'description',
          totalParticipants: 10,
        },
      ],
    });
  });

  it('[NEGATIVE] should convert broken data from API', () => {
    expect(
      transformActivitiesListFromApi({
        tasksData: null as unknown as ActivityListResponse,
        totalParticipantsData: null as unknown as CountTableRowsResponse,
        taskResponsesCountData: null as unknown as TaskResultsResponse,
      })
    ).toEqual({
      drafts: [],
      published: [],
    });
  });
});

describe('activitiesListDataSelector', () => {
  it('should select data from slice', async () => {
    const hook = setUpHook({ studyId });

    await waitFor(() => expect(hook.result.current.isLoading).toBeFalsy());

    expect(activitiesListDataSelector(store.getState())).not.toBeUndefined();

    act(() => unsetHook(hook));
  });

  it('[NEGATIVE] should select from empty slice', async () => {
    expect(activitiesListDataSelector({} as ReturnType<typeof store.getState>)).toBeUndefined();
  });
});
