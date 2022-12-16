import React from 'react';
import { Provider } from 'react-redux';
import { act, renderHook, waitFor } from '@testing-library/react';

import { store } from 'src/modules/store/store';
import {
  GetParticipantListParams,
  getParticipantsMock,
  getParticipantsTotalItemsMock,
  OverviewParticipantItem,
  OverviewParticipantListSort,
  OverviewParticipantListSortColumn,
  participantListFetchArgsSelector,
  participantListPrevFetchArgsSelector,
  transformParticipantListFromRaw,
  transformParticipantListItemFromApi,
  transformParticipantListSortParamsToApi,
  useParticipantList,
} from 'src/modules/overview/participantsList.slice';
import * as api from 'src/modules/api/models';
import { ParticipantListItemSqlRow } from 'src/modules/api/models';
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
    const participantFromApi: api.ParticipantListItemSqlRow = {
      steps: '1',
      avg_hr_bpm: '2',
      avg_bp_diastolic: '3',
      avg_bp_systolic: '4',
      avg_sleep_mins: '5',
      email: 'hello@example.com',
      last_synced: new Date(1666623346000).toString(),
      user_id: '6',
    };

    const participant: OverviewParticipantItem = {
      id: '6',
      email: 'hello@example.com',
      avgBpm: 2,
      avgSteps: 1,
      lastSync: 1666623346000,
      localTime: 1666623346000,
      avgSleepMins: 5,
      avgBloodPressure: '4/3',
    };

    expect(transformParticipantListItemFromApi(participantFromApi)).toEqual(participant);
  });

  it('[NEGATIVE] should transform data with broken input data', () => {
    expect(
      transformParticipantListItemFromApi({
        steps: '',
        avg_hr_bpm: '',
        avg_bp_diastolic: '',
        avg_bp_systolic: '',
        avg_sleep_mins: '',
        email: '',
        last_synced: '',
        user_id: '',
      })
    ).toEqual({
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
    direction: 'asc',
  });

  const expectParam = (
    inParam: OverviewParticipantListSortColumn,
    outParam: keyof ParticipantListItemSqlRow
  ) =>
    expect(
      transformParticipantListSortParamsToApi(
        getSortParams(inParam) as unknown as OverviewParticipantListSort
      )
    ).toEqual(getSortParams(outParam));

  // eslint-disable-next-line jest/expect-expect
  it('should transform data', () => {
    expectParam('id', 'user_id');
    expectParam('email', 'email');
    expectParam('lastSync', 'last_synced');
    expectParam('localTime', 'last_synced');
    expectParam('avgBpm', 'avg_hr_bpm');
    expectParam('avgSteps', 'steps');
  });

  // eslint-disable-next-line jest/expect-expect
  it('[NEGATIVE] should transform data with broken input data', () => {
    expectParam(
      'unexpected' as OverviewParticipantListSortColumn,
      undefined as unknown as keyof ParticipantListItemSqlRow
    );
  });
});

describe('transformParticipantListFromRaw', () => {
  it('should transform data', () => {
    const participantFromApi: api.ParticipantListItemSqlRow = {
      steps: '1',
      avg_hr_bpm: '2',
      avg_bp_diastolic: '3',
      avg_bp_systolic: '4',
      avg_sleep_mins: '5',
      email: 'hello@example.com',
      last_synced: new Date(1666623346000).toString(),
      user_id: '6',
    };

    const participant: OverviewParticipantItem = {
      id: '6',
      email: 'hello@example.com',
      avgBpm: 2,
      avgSteps: 1,
      lastSync: 1666623346000,
      localTime: 1666623346000,
      avgSleepMins: 5,
      avgBloodPressure: '4/3',
    };

    expect(transformParticipantListFromRaw([participantFromApi])).toEqual([participant]);
  });

  it('[NEGATIVE] should transform broken data', () => {
    const participantFromApi: api.ParticipantListItemSqlRow = {
      steps: '',
      avg_hr_bpm: '',
      avg_bp_diastolic: '',
      avg_bp_systolic: '',
      avg_sleep_mins: '',
      email: '',
      last_synced: '',
      user_id: '',
    };

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

    expect(transformParticipantListFromRaw([participantFromApi])).toEqual([participant]);
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

    const { data: list } = await getParticipantsMock({
      projectId: 'project_id',
      limit: args.filter.perPage,
      offset: args.filter.offset,
      sort: transformParticipantListSortParamsToApi(args.sort),
    });

    const {
      data: [{ total }],
    } = await getParticipantsTotalItemsMock({
      projectId: 'project_id',
    });

    expect(hook.result.current).toMatchObject({
      isLoading: false,
      data: {
        list: transformParticipantListFromRaw(list),
        total: parseInt(total, 10),
      },
    });
  });

  it('[NEGATIVE] should fetch broken data from API', async () => {
    await maskEndpointAsSuccess(
      'getParticipants',
      async () => {
        await maskEndpointAsSuccess(
          'getParticipantsTotalItems',
          async () => {
            hook = setUpHook(args);

            await waitFor(() => expect(hook.result.current.isLoading).toBeFalsy());
          },
          { sqlResponse: null }
        );
      },
      { sqlResponse: null }
    );

    expect(hook.result.current).toMatchObject({
      isLoading: false,
      data: undefined,
      error: expect.any(String),
    });
  });

  it('[NEGATIVE] should execute failure request to API', async () => {
    await maskEndpointAsFailure(
      'getParticipants',
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
      'getParticipantsTotalItems',
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
