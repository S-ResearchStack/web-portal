import React from 'react';
import { Provider } from 'react-redux';
import {
  getAverageParticipantHeartRateMock,
  useAvgRestingHrWithAgeSlice,
} from 'src/modules/overview/avgRestingHrWithAge.slice';
import { act, renderHook, waitFor } from '@testing-library/react';
import { store } from 'src/modules/store/store';
import { maskEndpointAsFailure, maskEndpointAsSuccess } from 'src/modules/api/mock';

describe('getAverageParticipantHeartRateMock', () => {
  it('should get mocked data', async () => {
    const { data } = await getAverageParticipantHeartRateMock({
      startTime: '2017-05-15',
      endTime: '2017-05-16',
      projectId: 'project-id',
    });

    expect(data).toMatchObject({
      averageHealthData: expect.arrayContaining([
        expect.objectContaining({
          userId: expect.any(String),
          profiles: expect.arrayContaining([
            {
              key: expect.any(String),
              value: expect.any(String),
            },
          ]),
          averageHR: expect.any(Number),
          lastSyncTime: expect.any(String),
        }),
      ]),
    });
  });

  it('[NEGATIVE] should get mocked data with wrong parameters', async () => {
    const { data } = await getAverageParticipantHeartRateMock({
      startTime: undefined as unknown as string,
      endTime: undefined as unknown as string,
      projectId: 'project-id',
    });

    expect(data).toMatchObject({
      averageHealthData: expect.arrayContaining([
        expect.objectContaining({
          userId: expect.any(String),
          profiles: expect.arrayContaining([
            {
              key: expect.any(String),
              value: expect.any(String),
            },
          ]),
          averageHR: expect.any(Number),
          lastSyncTime: null,
        }),
      ]),
    });
  });
});

const setUpHook = (args: { studyId: string }) =>
  renderHook(
    (etchArgs: { studyId: string }) =>
      useAvgRestingHrWithAgeSlice({
        fetchArgs: etchArgs || args,
      }),
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

const error = 'test-error';

describe('useAvgRestingHrWithAgeSlice', () => {
  let hook: ReturnType<typeof setUpHook>;

  afterEach(() => {
    act(() => unSetHook(hook));
  });

  it('should fetch data from API', async () => {
    hook = setUpHook({
      studyId: 'test-study-id',
    });

    expect(hook.result.current).toMatchObject({
      isLoading: true,
    });

    await waitFor(() => expect(hook.result.current.isLoading).toBeFalsy());

    expect(hook.result.current).toMatchObject({
      isLoading: false,
      data: {
        trendLines: expect.arrayContaining([
          expect.objectContaining({
            name: expect.any(String),
            age: expect.any(Number),
            value: expect.any(Number),
            color: expect.any(String),
          }),
        ]),
        values: expect.arrayContaining([
          expect.objectContaining({
            name: expect.any(String),
            age: expect.any(Number),
            value: expect.any(Number),
            lastSync: expect.any(Number),
            color: expect.any(String),
          }),
        ]),
      },
    });
  });

  it('[NEGATIVE] should fetch broken data from API', async () => {
    await maskEndpointAsSuccess(
      'getAverageParticipantHeartRate',
      async () => {
        hook = setUpHook({
          studyId: 'test-study-id',
        });
      },
      { sqlResponse: null }
    );

    await waitFor(() => expect(hook.result.current.isLoading).toBeFalsy());

    expect(hook.result.current).toMatchObject({
      isLoading: false,
      data: undefined,
    });
  });

  it('[NEGATIVE] should execute failure request to API', async () => {
    await maskEndpointAsFailure(
      'getAverageParticipantHeartRate',
      async () => {
        hook = setUpHook({
          studyId: 'test-study-id',
        });
      },
      { message: error }
    );

    await waitFor(() => expect(hook.result.current.isLoading).toBeFalsy());

    expect(hook.result.current).toMatchObject({
      isLoading: false,
      data: undefined,
      error,
    });
  });
});
