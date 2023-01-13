import React from 'react';
import { Provider } from 'react-redux';
import { act, renderHook, waitFor } from '@testing-library/react';

import { store } from 'src/modules/store/store';
import {
  GetParticipantListParams,
  getHealthDataOverviewMock,
  getUserProfilesCountMock,
  OverviewParticipantItem,
  OverviewParticipantListSort,
  OverviewParticipantListSortColumn,
  participantListFetchArgsSelector,
  participantListPrevFetchArgsSelector,
  transformHealthDataOverviewItemFromApi,
  transformHealthDataOverviewListFromApi,
  transformParticipantListSortParamsToApi,
  useParticipantList,
} from 'src/modules/overview/participantsList.slice';
import * as api from 'src/modules/api/models';
import { HealthDataOverviewSort } from 'src/modules/api/models';
import { maskEndpointAsFailure, maskEndpointAsSuccess } from 'src/modules/api/mock';

const setUpHook = (args: GetParticipantListParams | false) =>
  renderHook(
    (fetchArgs: GetParticipantListParams) => useParticipantList({ fetchArgs: fetchArgs || args }),
    {
      wrapper: ({ children }: React.PropsWithChildren<unknown>) => (
        <Provider store={store}>{children}</Provider>
      ),
    }
  );

const unSetHook = (hook: ReturnType<typeof setUpHook>) => {
  hook.result.current.reset();
  hook.unmount();
};

const TEST_PAGINATION_LIMIT = 10;

const args: GetParticipantListParams = {
  studyId: 'test-study-id',
  filter: { offset: 0, perPage: TEST_PAGINATION_LIMIT },
  sort: { column: 'email', direction: 'asc' },
};

describe('transformParticipantListItemFromApi', () => {
  it('should transform data', () => {
    const participantFromApi: api.HealthDataOverview = {
      userId: '6',
      profiles: [
        {
          key: 'email',
          value: 'hello@example.com',
        },
      ],
      latestAverageHR: 2.1,
      latestAverageSystolicBP: 122.7,
      latestAverageDiastolicBP: 81.3,
      latestTotalStep: 1,
      averageSleep: 5,
      lastSyncTime: new Date(1666623346000).toString(),
    };

    const participant: OverviewParticipantItem = {
      id: '6',
      email: 'hello@example.com',
      avgBpm: 2,
      avgBloodPressure: '123/81',
      avgSteps: 1,
      lastSync: 1666623346000,
      localTime: 1666623346000,
      avgSleepMins: 5,
    };

    expect(transformHealthDataOverviewItemFromApi(participantFromApi)).toEqual(participant);
  });

  it('[NEGATIVE] should transform data with broken input data', () => {
    expect(transformHealthDataOverviewItemFromApi({})).toEqual({
      id: '',
      email: '',
      avgBpm: undefined,
      avgSteps: undefined,
      lastSync: 0,
      localTime: 0,
      avgSleepMins: undefined,
      avgBloodPressure: undefined,
    });
  });
});

describe('transformParticipantListSortParamsToApi', () => {
  const getSortParams = (column: string) => ({
    column,
    direction: 'ASC',
  });

  const expectParam = (
    inParam: OverviewParticipantListSortColumn,
    outParam: HealthDataOverviewSort['column']
  ) =>
    expect(
      transformParticipantListSortParamsToApi(
        getSortParams(inParam) as unknown as OverviewParticipantListSort
      )
    ).toEqual(getSortParams(outParam));

  // eslint-disable-next-line jest/expect-expect
  it('should transform data', () => {
    expectParam('id', 'ID');
    expectParam('email', 'EMAIL');
    expectParam('lastSync', 'LAST_SYNCED');
    expectParam('localTime', 'LAST_SYNCED');
    expectParam('avgBpm', 'AVG_HR');
    expectParam('avgSteps', 'TOTAL_STEPS');
  });

  // eslint-disable-next-line jest/expect-expect
  it('[NEGATIVE] should transform data with broken input data', () => {
    expectParam('unexpected' as OverviewParticipantListSortColumn, 'ID');
  });
});

describe('transformParticipantListFromRaw', () => {
  it('should transform data', () => {
    const participantFromApi: api.HealthDataOverview = {
      userId: '6',
      profiles: [
        {
          key: 'email',
          value: 'hello@example.com',
        },
      ],
      latestAverageHR: 2.1,
      latestAverageSystolicBP: 122.7,
      latestAverageDiastolicBP: 81.3,
      latestTotalStep: 1,
      averageSleep: 5,
      lastSyncTime: new Date(1666623346000).toString(),
    };

    const participant: OverviewParticipantItem = {
      id: '6',
      email: 'hello@example.com',
      avgBpm: 2,
      avgBloodPressure: '123/81',
      avgSteps: 1,
      lastSync: 1666623346000,
      localTime: 1666623346000,
      avgSleepMins: 5,
    };

    expect(transformHealthDataOverviewListFromApi([participantFromApi])).toEqual([participant]);
  });

  it('[NEGATIVE] should transform broken data', () => {
    const participantFromApi: api.HealthDataOverview = {};

    const participant: OverviewParticipantItem = {
      id: '',
      email: '',
      avgBpm: undefined,
      avgSteps: undefined,
      lastSync: 0,
      localTime: 0,
      avgSleepMins: undefined,
      avgBloodPressure: undefined,
    };

    expect(transformHealthDataOverviewListFromApi([participantFromApi])).toEqual([participant]);
  });
});

describe('useParticipantList', () => {
  let hook: ReturnType<typeof setUpHook>;

  const error = 'test-error';

  afterEach(() => {
    act(() => unSetHook(hook));
  });

  it('should create initial state', async () => {
    hook = setUpHook(false);

    expect(hook.result.current).toMatchObject({
      isLoading: false,
    });
  });

  it('should fetch data from API', async () => {
    hook = setUpHook(args);

    expect(hook.result.current).toMatchObject({
      isLoading: true,
    });

    await waitFor(() => expect(hook.result.current.isLoading).toBeFalsy());

    const { data } = await getHealthDataOverviewMock({
      projectId: 'project_id',
      limit: args.filter.perPage,
      offset: args.filter.offset,
      sort: transformParticipantListSortParamsToApi(args.sort),
    });

    const {
      data: { count: total },
    } = await getUserProfilesCountMock({
      projectId: 'project_id',
    });

    expect(hook.result.current).toMatchObject({
      isLoading: false,
      data: {
        list: transformHealthDataOverviewListFromApi(data.healthDataOverview),
        total,
      },
    });
  });

  it('[NEGATIVE] should fetch broken data from API', async () => {
    await maskEndpointAsSuccess(
      'getHealthDataOverview',
      async () => {
        await maskEndpointAsSuccess(
          'getUserProfilesCount',
          async () => {
            hook = setUpHook(args);

            await waitFor(() => expect(hook.result.current.isLoading).toBeFalsy());
          },
          { response: null }
        );
      },
      { response: null }
    );

    expect(hook.result.current).toMatchObject({
      isLoading: false,
      data: undefined,
      error: expect.any(String),
    });
  });

  it('[NEGATIVE] should execute failure request to API', async () => {
    await maskEndpointAsFailure(
      'getHealthDataOverview',
      async () => {
        hook = setUpHook(args);
        await waitFor(() => expect(hook.result.current.isLoading).toBeFalsy());
      },
      { message: error }
    );

    expect(hook.result.current).toMatchObject({
      isLoading: false,
      data: undefined,
      error,
    });
  });

  it('should change fetch arguments', async () => {
    hook = setUpHook(args);

    await waitFor(() => expect(hook.result.current.isLoading).toBeFalsy());

    expect(hook.result.current.data?.list).toHaveLength(args.filter.perPage);

    const newPerPage = 20;

    act(() => {
      hook.result.current.fetch({
        ...args,
        filter: {
          ...args.filter,
          perPage: newPerPage,
        },
      });
    });

    await waitFor(() => expect(hook.result.current.isLoading).toBeFalsy());

    expect(hook.result.current.data?.list).toHaveLength(newPerPage);
  });

  it('[NEGATIVE] should change fetch arguments while failure request', async () => {
    hook = setUpHook(args);

    await waitFor(() => expect(hook.result.current.isLoading).toBeFalsy());

    expect(hook.result.current.data?.list).toHaveLength(args.filter.perPage);

    const newPerPage = 20;

    await maskEndpointAsFailure(
      'getUserProfilesCount',
      async () => {
        act(() => {
          hook.result.current.fetch({
            ...args,
            filter: {
              ...args.filter,
              perPage: newPerPage,
            },
          });
        });

        await waitFor(() => expect(hook.result.current.isLoading).toBeFalsy());
      },
      { message: error }
    );

    expect(hook.result.current.data).toBeUndefined();
    expect(hook.result.current.error).toMatch(error);
  });

  it('[NEGATIVE] should change fetch arguments to wrong entries', async () => {
    hook = setUpHook(args);

    await waitFor(() => expect(hook.result.current.isLoading).toBeFalsy());

    expect(hook.result.current.data?.list).toHaveLength(args.filter.perPage);

    act(() => {
      hook.result.current.fetch(undefined as unknown as GetParticipantListParams);
    });

    await waitFor(() => expect(hook.result.current.isLoading).toBeFalsy());

    expect(hook.result.current.data).toBeUndefined();
  });

  it('should select fetch args', async () => {
    hook = setUpHook(args);

    expect(hook.result.current).toMatchObject({
      fetchArgs: participantListFetchArgsSelector(store.getState()),
      prevFetchArgs: participantListPrevFetchArgsSelector(store.getState()),
    });

    await waitFor(() => expect(hook.result.current.isLoading).toBeFalsy());

    expect(hook.result.current).toMatchObject({
      fetchArgs: participantListFetchArgsSelector(store.getState()),
      prevFetchArgs: participantListPrevFetchArgsSelector(store.getState()),
    });
  });
});
