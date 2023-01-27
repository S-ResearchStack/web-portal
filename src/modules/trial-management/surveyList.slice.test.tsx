import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';

import {
  mockTasksItems,
  parseDateFromSurveyListApi,
  surveyListDataSelector,
  surveyListSlice,
  SurveyListSliceFetchArgs,
  transformSurveyListFromApi,
  useSurveyListData,
} from 'src/modules/trial-management/surveyList.slice';
import { store } from 'src/modules/store/store';
import Random from 'src/common/Random';
import { CountTableRowsResponse, TaskListResponse, TaskResultsResponse } from 'src/modules/api';
import { maskEndpointAsFailure, maskEndpointAsSuccess } from 'src/modules/api/mock';

describe('surveyListSlice', () => {
  it('should make empty state', () => {
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
      'getTasks',
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
      'getTasks',
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

describe('parseDateFromSurveyListApi', () => {
  it('should parse date', () => {
    expect(parseDateFromSurveyListApi('2022-10-31T12:00:00')).toBe(
      new Date(2022, 9, 31, 12, 0, 0, 0).valueOf()
    );
  });

  it('[NEGATIVE] should parse wrong date', () => {
    expect(parseDateFromSurveyListApi(undefined)).toBeUndefined();
    expect(parseDateFromSurveyListApi('')).toBeUndefined();
  });
});

describe('transformSurveyListFromApi', () => {
  it('should convert data from API', () => {
    const tasksData: TaskListResponse = [
      {
        id: '1',
        revisionId: 0,
        title: `first`,
        status: 'DRAFT' as const,
        startTime: '2022-10-31T14:00:00',
        createdAt: '2022-10-31T12:00:00',
        schedule: '',
        validTime: 0,
        items: mockTasksItems,
      },
      {
        id: '2',
        revisionId: 0,
        title: `second`,
        status: 'PUBLISHED' as const,
        startTime: '2022-10-31T14:00:00',
        createdAt: '2022-10-31T12:00:00',
        schedule: '',
        validTime: 0,
        items: mockTasksItems,
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
          description: undefined,
          id: '1',
          modifiedAt: new Date(2022, 9, 31, 12, 0, 0, 0).valueOf(),
          publishedAt: undefined,
          respondedParticipants: 1,
          revisionId: 0,
          status: 'DRAFT',
          title: 'first',
          totalParticipants: 10,
        },
      ],
      published: [
        {
          description: undefined,
          id: '2',
          modifiedAt: new Date(2022, 9, 31, 12, 0, 0, 0).valueOf(),
          publishedAt: undefined,
          respondedParticipants: 1,
          revisionId: 0,
          status: 'PUBLISHED',
          title: 'second',
          totalParticipants: 10,
        },
      ],
    });
  });

  it('[NEGATIVE] should convert broken data from API', () => {
    expect(
      transformSurveyListFromApi({
        tasksData: null as unknown as TaskListResponse,
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
