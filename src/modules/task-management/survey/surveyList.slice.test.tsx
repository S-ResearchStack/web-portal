import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from 'src/modules/store/store';
import Random from 'src/common/Random';
import { BaseTaskStatus, BaseTaskType, CountTableRowsResponse, SurveyListResponse, TaskResultsResponse } from 'src/modules/api';
import { maskEndpointAsFailure, maskEndpointAsSuccess } from 'src/modules/api/mock';
import {
  mockSurveySections,
  surveyListDataSelector,
  surveyListSlice,
  SurveyListSliceFetchArgs,
  transformSurveyListFromApi,
  useSurveyListData,
} from './surveyList.slice';

describe('surveyListSlice', () => {
  it('[NEGATIVE] should make empty state', () => {
    expect(surveyListSlice.reducer(undefined, { type: 0 })).toEqual({
      fetchArgs: null,
      prevFetchArgs: null,
    });
  });
});

const setUpHook = (args: SurveyListSliceFetchArgs | false) =>
  renderHook(
    (fetchArgs: SurveyListSliceFetchArgs) => useSurveyListData({ fetchArgs: fetchArgs || args }),
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

describe('useSurveyListData', () => {
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
      'getSurveys',
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
      'getSurveys',
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

describe('transformSurveyListFromApi', () => {
  it('should convert data from API', () => {
    const tasksData: SurveyListResponse = [
      {
        id: '1',
        taskType: BaseTaskType.SURVEY,
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
          sections: mockSurveySections
        },
      },
      {
        id: '2',
        taskType: BaseTaskType.SURVEY,
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
          sections: mockSurveySections
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
      transformSurveyListFromApi({
        tasksData,
        totalParticipantsData,
        taskResponsesCountData,
      })
    ).toEqual({
      drafts: [
        {
          id: '1',
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
      transformSurveyListFromApi({
        tasksData: null as unknown as SurveyListResponse,
        totalParticipantsData: null as unknown as CountTableRowsResponse,
        taskResponsesCountData: null as unknown as TaskResultsResponse,
      })
    ).toEqual({
      drafts: [],
      published: [],
    });
  });
});

describe('surveyListDataSelector', () => {
  it('should select data from slice', async () => {
    const hook = setUpHook({ studyId });

    await waitFor(() => expect(hook.result.current.isLoading).toBeFalsy());

    expect(surveyListDataSelector(store.getState())).not.toBeUndefined();

    act(() => unsetHook(hook));
  });

  it('[NEGATIVE] should select from empty slice', async () => {
    expect(surveyListDataSelector({} as ReturnType<typeof store.getState>)).toBeUndefined();
  });
});
