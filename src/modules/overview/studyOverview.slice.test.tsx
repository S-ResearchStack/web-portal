import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';

import {
  getStorageLastSeenStatus,
  setStorageLastSeenStatus,
  transformStudyFromApi,
  useStudyOverviewData,
} from './StudyOverview.slice';
import { maskEndpointAsFailure, maskEndpointAsSuccess } from '../api/mock';
import { createTestStore } from '../store/testing';

describe('useStudyOverviewData', () => {
  it('should transform data from API', async () => {
    const store = createTestStore({});
    const hook = renderHook(
      () =>
        useStudyOverviewData({
          fetchArgs: '1',
        }),
      {
        wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
      }
    );

    expect(hook.result.current).toMatchObject({ isLoading: true });

    await waitFor(() => expect(hook.result.current.isLoading).toBeFalse());

    expect(hook.result.current).toMatchObject({
      isLoading: false,
      data: expect.objectContaining({
        study: expect.any(Object),
        subject: expect.any(Object),
        investigator: expect.any(Object),
      }),
    });
  });

  it('[NEGATIVE] should handle failure on API error', async () => {
    const store = createTestStore({});
    const hook = await maskEndpointAsFailure(
      'getStudy',
      async () =>
        renderHook(
          () =>
            useStudyOverviewData({
              fetchArgs: '1',
            }),
          {
            wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
          }
        ),
      { message: 'Error' }
    );

    expect(hook.result.current).toMatchObject({ isLoading: true });

    await waitFor(() => expect(hook.result.current.isLoading).toBeFalsy());

    expect(hook.result.current).toMatchObject({
      isLoading: false,
      data: undefined,
      error: 'Error',
    });
  });

  it('[NEGATIVE] should return empty data on unexpected API data', async () => {
    const store = createTestStore({});
    const hook = await maskEndpointAsSuccess(
      'getStudy',
      async () =>
        renderHook(
          () =>
            useStudyOverviewData({
              fetchArgs: '1',
            }),
          {
            wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
          }
        ),
      { response: null }
    );

    expect(hook?.result.current).toMatchObject({ isLoading: true });

    await waitFor(() => expect(hook?.result.current.isLoading).toBeFalsy());

    expect(hook?.result.current).toMatchObject({
      isLoading: false,
      data: undefined,
    });
  });

  it('should store last seen status', () => {
    localStorage.clear();

    setStorageLastSeenStatus('test', 'STARTED_OPEN');
    setStorageLastSeenStatus('test2', 'started');
    expect(getStorageLastSeenStatus('test')).toEqual('STARTED_OPEN');

    setStorageLastSeenStatus('test', 'started');
    expect(getStorageLastSeenStatus('test')).toEqual('started');
  });

  it('[NEGATIVE] should return empty last seen status if not set', () => {
    localStorage.clear();

    expect(getStorageLastSeenStatus('test')).toBeUndefined();
  });
});

describe('transformStudyFromApi', () => {
  it('should transform data', async () => {
    const study = {
      id: '1',
      participationCode: '',
      studyInfoResponse: {
        name: 'SleepCare Study',
        description: 'test study description',
        participationApprovalType: 'AUTO',
        scope: 'PUBLIC',
        stage: 'STARTED_OPEN',
        logoUrl: 'secondarySkyBlue',
        imageUrl: 'https://test.png',
        organization: 'SV',
        duration: '15m/week',
        period: '100 day(s)',
        startDate: '2023-01-01 09:55:00',
        endDate: '2050-12-31 09:55:00',
      },
      irbInfoResponse: {
        decisionType: 'APPROVED',
        decidedAt: '2024-04-07T05:35:02.620569',
        expiredAt: '2024-04-07T05:35:02.620569'
      },
      createdAt: '2022-10-31T12:00:00',
    };

    const data = await transformStudyFromApi(study);

    expect(data).toMatchObject({
      id: '1',
      imageURL: expect.any(String),
      logoURL: expect.any(String),
      startDate: '2023/01/01',
      endDate: '2050/12/31',
      totalDuration: expect.any(String),
    });
  });
});