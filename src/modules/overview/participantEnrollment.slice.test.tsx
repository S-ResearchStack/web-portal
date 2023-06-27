import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';

import { useParticipantEnrollmentData } from './participantEnrollment.slice';
import { maskEndpointAsFailure, maskEndpointAsSuccess } from '../api/mock';
import { createTestStore } from '../store/testing';

describe('useParticipantEnrollmentData', () => {
  it('should transform data from API', async () => {
    const store = createTestStore({});
    const hook = renderHook(
      () =>
        useParticipantEnrollmentData({
          fetchArgs: { period: 'last_24_hours' },
        }),
      {
        wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
      }
    );

    expect(hook.result.current).toMatchObject({ isLoading: true });

    await waitFor(() => expect(hook.result.current.isLoading).toBeFalse());

    expect(hook.result.current).toMatchObject({
      isLoading: false,
      data: {
        dataItems: expect.arrayContaining([
          expect.objectContaining({ value: expect.any(Number), ts: expect.any(Number) }),
        ]),
        comparisonPercentage: expect.any(Number),
      },
    });
  });

  it('[NEGATIVE] should handle failure on API error', async () => {
    const store = createTestStore({});
    const hook = await maskEndpointAsFailure(
      'getParticipantEnrollment',
      async () =>
        renderHook(
          () =>
            useParticipantEnrollmentData({
              fetchArgs: { period: 'last_24_hours' },
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
      'getParticipantEnrollment',
      async () =>
        renderHook(
          () =>
            useParticipantEnrollmentData({
              fetchArgs: { period: 'last_24_hours' },
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
});
