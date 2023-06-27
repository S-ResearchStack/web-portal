import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';

import { useTaskComplianceData } from './taskCompliance.slice';
import { maskEndpointAsFailure, maskEndpointAsSuccess } from '../api/mock';
import { createTestStore } from '../store/testing';

describe('useTaskComplianceData', () => {
  it('should transform data from API', async () => {
    const store = createTestStore({});
    const hook = renderHook(
      () =>
        useTaskComplianceData({
          fetchArgs: { studyId: 'test' },
        }),
      {
        wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
      }
    );

    expect(hook.result.current).toMatchObject({ isLoading: true });

    await waitFor(() => expect(hook.result.current.isLoading).toBeFalse());

    expect(hook.result.current).toMatchObject({
      isLoading: false,
      data: expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          type: expect.stringMatching(/survey|activity/),
          revisionId: expect.any(Number),
          title: expect.any(String),
          description: expect.any(String),
          total: expect.any(Number),
          responded: expect.any(Number),
          progress: expect.any(Number),
        }),
      ]),
    });
  });

  it('[NEGATIVE] should handle failure on API error', async () => {
    const store = createTestStore({});
    const hook = await maskEndpointAsFailure(
      'getTaskRespondedUsersCount',
      async () =>
        renderHook(
          () =>
            useTaskComplianceData({
              fetchArgs: { studyId: 'test' },
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
      'getTaskRespondedUsersCount',
      async () =>
        renderHook(
          () =>
            useTaskComplianceData({
              fetchArgs: { studyId: 'test' },
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
