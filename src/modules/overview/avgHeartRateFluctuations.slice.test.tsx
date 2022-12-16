import { act, renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';

import {
  getAvgHeartRateFluctuationsMock,
  avgHeartRateFluctuationsMockData,
  useAvgHeartRateFluctuationsData,
} from 'src/modules/overview/avgHeartRateFluctuations.slice';
import { store } from 'src/modules/store/store';
import { maskEndpointAsFailure, maskEndpointAsSuccess } from 'src/modules/api/mock';

describe('getAvgHeartRateFluctuationsMock', () => {
  it('should get mocked data', async () => {
    const { data } = await getAvgHeartRateFluctuationsMock();

    expect(data.data).toEqual(avgHeartRateFluctuationsMockData);
  });
});

const setUpHook = () =>
  renderHook(
    () =>
      useAvgHeartRateFluctuationsData({
        fetchArgs: undefined,
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

describe('useAvgHeartRateFluctuationsData', () => {
  let hook: ReturnType<typeof setUpHook>;

  afterEach(() => {
    act(() => unSetHook(hook));
  });

  it('should fetch data from API', async () => {
    hook = setUpHook();

    expect(hook.result.current).toMatchObject({
      isLoading: true,
    });

    await waitFor(() => expect(hook.result.current.isLoading).toBeFalsy());

    expect(hook.result.current).toMatchObject({
      isLoading: false,
      data: expect.arrayContaining(
        avgHeartRateFluctuationsMockData.map((item) => ({ ...item, value: +item.value }))
      ),
    });
  });

  it('[NEGATIVE] should fetch broken data from API', async () => {
    await maskEndpointAsSuccess(
      'getAvgHeartRateFluctuations',
      async () => {
        hook = setUpHook();
      },
      { response: null }
    );

    await waitFor(() => expect(hook.result.current.isLoading).toBeFalsy());

    expect(hook.result.current).toMatchObject({
      isLoading: false,
      data: undefined,
    });
  });

  it('[NEGATIVE] should execute failure request to API', async () => {
    await maskEndpointAsFailure(
      'getAvgHeartRateFluctuations',
      async () => {
        hook = setUpHook();
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
