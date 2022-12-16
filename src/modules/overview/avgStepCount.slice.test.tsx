import { act, renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';

import {
  getAverageStepCountMock,
  getAverageStepCountMockData,
  useAvgStepCountData,
} from 'src/modules/overview/avgStepCount.slice';
import { store } from 'src/modules/store/store';
import { maskEndpointAsFailure, maskEndpointAsSuccess } from 'src/modules/api/mock';

describe('getAvgHeartRateFluctuationsMock', () => {
  it('should get mocked data', async () => {
    const { data } = await getAverageStepCountMock({
      projectId: 'test-project-id',
    });

    expect(data).toEqual(getAverageStepCountMockData);
  });

  it('[NEGATIVE] should get mocked data with wrong parameters', async () => {
    const { data } = await getAverageStepCountMock({
      projectId: null as unknown as string,
    });

    expect(data).toEqual(getAverageStepCountMockData);
  });
});

const setUpHook = (args: { studyId: string }) =>
  renderHook(
    (etchArgs: { studyId: string }) =>
      useAvgStepCountData({
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

describe('useAvgStepCountData', () => {
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
      data: expect.arrayContaining([
        expect.objectContaining({
          dataKey: expect.any(String),
          name: expect.any(String),
          value: expect.any(Number),
        }),
      ]),
    });
  });

  it('[NEGATIVE] should fetch broken data from API', async () => {
    await maskEndpointAsSuccess(
      'getAverageStepCount',
      async () => {
        hook = setUpHook({
          studyId: 'test-study-id',
        });
      },
      { sqlResponse: null }
    );

    expect(hook.result.current).toMatchObject({
      isLoading: true,
    });

    await waitFor(() => expect(hook.result.current.isLoading).toBeFalsy());

    expect(hook.result.current).toMatchObject({
      isLoading: false,
      data: undefined,
    });
  });

  it('[NEGATIVE] should execute failure request to API', async () => {
    await maskEndpointAsFailure(
      'getAverageStepCount',
      async () => {
        hook = setUpHook({
          studyId: 'test-study-id',
        });
      },
      { message: error }
    );

    expect(hook.result.current).toMatchObject({
      isLoading: true,
    });

    await waitFor(() => expect(hook.result.current.isLoading).toBeFalsy());

    expect(hook.result.current).toMatchObject({
      isLoading: false,
      data: undefined,
      error,
    });
  });
});
