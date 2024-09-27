import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';

import { maskEndpointAsFailure, maskEndpointAsSuccess } from '../api/mock';
import { createTestStore } from '../store/testing';
import { useSubjectInfoList } from './studyManagement.slice';

describe('useSubjectInfoList', () => {
  it('[NEGATIVE] should handle failure on API error', async () => {
    const store = createTestStore({});

    const hook = await maskEndpointAsFailure(
      'getSubjectInfoList',
      async () =>
        renderHook(() => useSubjectInfoList(), {
          wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
        }),
      { message: 'Error' }
    );

    expect(hook.result.current).toStrictEqual([]);

    await waitFor(() => expect(hook.result.current).toStrictEqual([]));
  });

  it('[NEGATIVE] should return empty data on unexpected API data', async () => {
    const store = createTestStore({});
    const hook = await maskEndpointAsSuccess(
      'getSubjectInfoList',
      async () =>
        renderHook(() => useSubjectInfoList(), {
          wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
        }),
      { response: null }
    );

    expect(hook?.result.current).toStrictEqual([]);
  });
});
