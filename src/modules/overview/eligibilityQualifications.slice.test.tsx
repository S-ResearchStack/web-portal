import { act, renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { store } from 'src/modules/store/store';
import {
  getEligibilityQualificationsMock,
  getEligibilityQualificationsMockData,
  useEligibilityQualificationsData,
} from 'src/modules/overview/eligibilityQualifications.slice';
import { maskEndpointAsFailure, maskEndpointAsSuccess } from 'src/modules/api/mock';

describe('getEligibilityQualificationsMock', () => {
  it('should get mocked data', async () => {
    const { data } = await getEligibilityQualificationsMock();

    expect(data.data).toEqual(getEligibilityQualificationsMockData);
  });
});

const setUpHook = () =>
  renderHook(() => useEligibilityQualificationsData({ fetchArgs: undefined }), {
    wrapper: ({ children }: React.PropsWithChildren<unknown>) => (
      <Provider store={store}>{children}</Provider>
    ),
  });

const unSetHook = (hook: ReturnType<typeof setUpHook>) => {
  hook.result.current.reset();
  hook.unmount();
};

const error = 'test-error';

describe('useEligibilityQualificationsData', () => {
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
      data: expect.arrayContaining([
        expect.objectContaining({
          group: expect.any(String),
          totalValue: expect.any(Number),
          value: expect.any(Number),
        }),
      ]),
    });
  });

  it('[NEGATIVE] should fetch broken data from API', async () => {
    await maskEndpointAsSuccess(
      'getEligibilityQualifications',
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
      'getEligibilityQualifications',
      async () => {
        hook = setUpHook();
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
