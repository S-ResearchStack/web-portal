import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';

import {
  getStorageLastSeenStatus,
  setStorageLastSeenStatus,
  useStudyProgressData,
} from './studyProgress.slice';
import { maskEndpointAsFailure, maskEndpointAsSuccess } from '../api/mock';
import { createTestStore } from '../store/testing';

describe('useStudyProgressData', () => {
  it('should transform data from API', async () => {
    const store = createTestStore({});
    const hook = renderHook(
      () =>
        useStudyProgressData({
          fetchArgs: 'test',
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
        status: expect.stringMatching(/ongoing|started/),
        id: { value: 'test' },
      }),
    });
  });

  it('[NEGATIVE] should handle failure on API error', async () => {
    const store = createTestStore({});
    const hook = await maskEndpointAsFailure(
      'getUserProfilesCount',
      async () =>
        renderHook(
          () =>
            useStudyProgressData({
              fetchArgs: 'test',
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
      'getUserProfilesCount',
      async () =>
        renderHook(
          () =>
            useStudyProgressData({
              fetchArgs: 'test',
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

    setStorageLastSeenStatus('test', 'ongoing');
    setStorageLastSeenStatus('test2', 'started');
    expect(getStorageLastSeenStatus('test')).toEqual('ongoing');

    setStorageLastSeenStatus('test', 'started');
    expect(getStorageLastSeenStatus('test')).toEqual('started');
  });

  it('[NEGATIVE] should return empty last seen status if not set', () => {
    localStorage.clear();

    expect(getStorageLastSeenStatus('test')).toBeUndefined();
  });
});
