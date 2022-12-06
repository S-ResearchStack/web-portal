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
import {
  ParticipantListTotalItemsSqlRow,
  TaskListResponse,
  TaskRespondedUsersCountSqlRow,
} from 'src/modules/api';

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
      wrapper: ({ children }: React.PropsWithChildren<unknown>) => (
        <Provider store={store}>{children}</Provider>
      ),
    }
  );

const unsetHook = (hook: ReturnType<typeof setUpHook>) => {
  hook.result.current.reset();
  hook.unmount();
};

const studyId = 'test-study';

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
});

describe('parseDateFromSurveyListApi', () => {
  it('should parse date', () => {
    expect(parseDateFromSurveyListApi(undefined)).toBeUndefined();
    expect(parseDateFromSurveyListApi('')).toBeUndefined();
    expect(parseDateFromSurveyListApi('2022-10-31T12:00:00')).toBe(
      new Date(2022, 9, 31, 12, 0, 0, 0).valueOf()
    );
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

    const totalParticipantsData: ParticipantListTotalItemsSqlRow[] = [{ total: '10' }];

    const taskResponsesCountData: TaskRespondedUsersCountSqlRow[] = tasksData.map((t) => ({
      task_id: t.id,
      num_users_responded: String(Math.round(new Random(1).num(0, tasksData.length))),
    }));

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
});

describe('surveyListDataSelector', () => {
  it('should select data from slice', async () => {
    const hook = setUpHook({ studyId });

    await waitFor(() => expect(hook.result.current.isLoading).toBeFalsy());

    expect(surveyListDataSelector(store.getState())).not.toBeUndefined();

    act(() => unsetHook(hook));
  });
});
