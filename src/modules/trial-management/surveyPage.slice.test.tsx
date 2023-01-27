import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';

import { store } from 'src/modules/store/store';
import {
  GetSurveyDetailsDataParams,
  useSurveyDetailsData,
} from 'src/modules/trial-management/surveyPage.slice';
import { overviewSubjectSlice } from 'src/modules/overview/overview-subject/overviewSubject.slice';
import { maskEndpointAsFailure, maskEndpointAsSuccess } from 'src/modules/api/mock';

const setUpHook = (args: GetSurveyDetailsDataParams | false) =>
  renderHook(
    (fetchArgs: GetSurveyDetailsDataParams) =>
      useSurveyDetailsData({ fetchArgs: fetchArgs || args }),
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

describe('surveyDetailsSlice', () => {
  it('should have initial state', () => {
    expect(overviewSubjectSlice.reducer(undefined, { type: 0 })).toEqual({
      fetchArgs: null,
      prevFetchArgs: null,
    });
  });
});

describe('useSurveyDetailsData', () => {
  let hook: ReturnType<typeof setUpHook>;

  const args = {
    studyId: 'study-id',
    id: '1',
  };

  afterEach(() => {
    act(() => unsetHook(hook));
  });

  it('should create initial state', () => {
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

    expect(hook.result.current).toMatchObject({
      isLoading: false,
      data: expect.objectContaining({
        surveyInfo: expect.objectContaining({
          id: expect.any(String),
          revisionId: expect.any(Number),
          title: expect.any(String),
          publishedAt: expect.any(Number),
        }),
        analytics: expect.objectContaining({
          targetParticipants: expect.any(Number),
          completedParticipants: expect.any(Number),
          responseRatePercents: expect.any(Number),
          avgCompletionTimeMs: expect.any(Number),
          byGender: expect.arrayContaining([
            expect.objectContaining({
              label: expect.any(String),
              value: expect.any(Number),
              count: expect.any(Number),
              total: expect.any(Number),
              percentage: expect.any(Number),
            }),
          ]),
          byAge: expect.arrayContaining([
            expect.objectContaining({
              label: expect.any(String),
              value: expect.any(Number),
              count: expect.any(Number),
              total: expect.any(Number),
              percentage: expect.any(Number),
            }),
          ]),
        }),
        responses: expect.arrayContaining([
          expect.objectContaining({
            questionTitle: expect.any(String),
            questionDescription: expect.any(String),
            questionType: expect.any(String),
            answers: expect.arrayContaining([
              expect.objectContaining({
                label: expect.any(String),
                count: expect.any(Number),
                total: expect.any(Number),
                percentage: expect.any(Number),
              }),
            ]),
          }),
        ]),
      }),
    });
  });

  it('[NEGATIVE] should fetch data with failure', async () => {
    const error = 'test-error';

    await maskEndpointAsFailure(
      'getTaskCompletionTime',
      async () => {
        act(() => {
          hook = setUpHook(args);
        });
        await waitFor(() => expect(hook.result.current.isLoading).toBeFalsy());
      },
      { message: error }
    );

    expect(hook.result.current).toMatchObject({
      error,
    });
  });

  it('[NEGATIVE] should fetch broken data', async () => {
    await maskEndpointAsSuccess(
      'getTaskCompletionTime',
      async () => {
        act(() => {
          hook = setUpHook(args);
        });
        await waitFor(() => expect(hook.result.current.isLoading).toBeFalsy());
      },
      { response: null }
    );

    expect(hook.result.current).toMatchObject({
      error: expect.any(String),
    });
  });
});
