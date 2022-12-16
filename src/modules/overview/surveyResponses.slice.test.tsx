import {
  getSurveyResponsesByAgeMock,
  getSurveyResponsesByGenderMock,
  surveyResponsesByAgeMockData,
  surveyResponsesByGenderMockData,
  useSurveyResponsesByAgeData,
  useSurveyResponsesByGenderData,
} from 'src/modules/overview/surveyResponses.slice';
import { act, renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { store } from 'src/modules/store/store';
import { maskEndpointAsFailure, maskEndpointAsSuccess } from 'src/modules/api/mock';

describe('getSurveyResponsesByAgeMock', () => {
  it('should get mocked data', async () => {
    const { data } = await getSurveyResponsesByAgeMock();

    expect(data.data).toEqual(surveyResponsesByAgeMockData);
  });
});
describe('getSurveyResponsesByGenderMock', () => {
  it('should get mocked data', async () => {
    const { data } = await getSurveyResponsesByGenderMock();

    expect(data.data).toEqual(surveyResponsesByGenderMockData);
  });
});

const setUpHook = (
  useHook: typeof useSurveyResponsesByAgeData | typeof useSurveyResponsesByGenderData
) =>
  renderHook(() => useHook({ fetchArgs: undefined }), {
    wrapper: ({ children }: React.PropsWithChildren<unknown>) => (
      <Provider store={store}>{children}</Provider>
    ),
  });

const unSetHook = (hook: ReturnType<typeof setUpHook>) => {
  hook.result.current.reset();
  hook.unmount();
};

const error = 'test-error';

describe('useSurveyResponsesByAgeData', () => {
  let hook: ReturnType<typeof setUpHook>;

  afterEach(() => {
    act(() => unSetHook(hook));
  });

  it('should fetch data from API', async () => {
    hook = setUpHook(useSurveyResponsesByAgeData);

    expect(hook.result.current).toMatchObject({
      isLoading: true,
    });

    await waitFor(() => expect(hook.result.current.isLoading).toBeFalsy());

    expect(hook.result.current).toMatchObject({
      isLoading: false,
      data: expect.arrayContaining([
        expect.objectContaining({
          group: expect.any(String),
          percentage: expect.any(Number),
          count: expect.any(String),
          total: expect.any(Number),
        }),
      ]),
    });
  });

  it('[NEGATIVE] should fetch broken data from API', async () => {
    await maskEndpointAsSuccess(
      'getSurveyResponsesByAge',
      async () => {
        hook = setUpHook(useSurveyResponsesByAgeData);
        await waitFor(() => expect(hook.result.current.isLoading).toBeFalsy());
      },
      { response: null }
    );

    expect(hook.result.current).toMatchObject({
      isLoading: false,
      data: undefined,
    });
  });

  it('[NEGATIVE] should execute failure request to API', async () => {
    await maskEndpointAsFailure(
      'getSurveyResponsesByAge',
      async () => {
        hook = setUpHook(useSurveyResponsesByAgeData);
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
});

describe('useSurveyResponsesByGenderData', () => {
  let hook: ReturnType<typeof setUpHook>;

  afterEach(() => {
    act(() => unSetHook(hook));
  });

  it('should fetch data from API', async () => {
    hook = setUpHook(useSurveyResponsesByGenderData);

    expect(hook.result.current).toMatchObject({
      isLoading: true,
    });

    await waitFor(() => expect(hook.result.current.isLoading).toBeFalsy());

    expect(hook.result.current).toMatchObject({
      isLoading: false,
      data: {
        totalPercents: expect.any(Number),
        items: expect.arrayContaining([
          expect.objectContaining({
            group: expect.any(String),
            percentage: expect.any(Number),
            count: expect.any(Number),
            total: expect.any(Number),
          }),
        ]),
      },
    });
  });

  it('[NEGATIVE] should fetch broken data from API', async () => {
    await maskEndpointAsSuccess(
      'getSurveyResponsesByGender',
      async () => {
        hook = setUpHook(useSurveyResponsesByGenderData);
        await waitFor(() => expect(hook.result.current.isLoading).toBeFalsy());
      },
      { response: null }
    );

    expect(hook.result.current).toMatchObject({
      isLoading: false,
      data: undefined,
    });
  });

  it('[NEGATIVE] should execute failure request to API', async () => {
    await maskEndpointAsFailure(
      'getSurveyResponsesByGender',
      async () => {
        hook = setUpHook(useSurveyResponsesByGenderData);
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
});
