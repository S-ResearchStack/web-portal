import React from 'react';
import { Provider } from 'react-redux';
import { act, renderHook, waitFor } from '@testing-library/react';
import { maskEndpointAsFailure, maskEndpointAsSuccess } from 'src/modules/api/mock';
import { store } from 'src/modules/store/store';
import { EducationListSliceFetchArgs } from 'src/modules/api';
import {
  educationListDataSelector,
  educationListSlice,
  useEducationListData,
} from './educationList.slice';

describe('educationListSlice', () => {
  it('should make empty state', () => {
    expect(educationListSlice.reducer(undefined, { type: 0 })).toEqual({
      fetchArgs: null,
      prevFetchArgs: null,
    });
  });
});

const setUpHook = (args: EducationListSliceFetchArgs | false) =>
  renderHook(
    (fetchArgs: EducationListSliceFetchArgs) =>
      useEducationListData({ fetchArgs: fetchArgs || args }),
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

const projectId = 'test-study';

const error = 'test-error';

describe('useEducationListData', () => {
  let hook: ReturnType<typeof setUpHook>;

  afterEach(() => {
    act(() => unsetHook(hook));
  });

  it('should fetch data', async () => {
    hook = setUpHook({ projectId });

    await waitFor(() => expect(hook.result.current.isLoading).toBeFalsy());

    expect(hook.result.current.error).toBeUndefined();
    expect(hook.result.current.data).not.toBeUndefined();
  });

  it('[NEGATIVE] should fetch broken data', async () => {
    await maskEndpointAsSuccess(
      'getPublications',
      async () => {
        await act(() => {
          hook = setUpHook({ projectId });
        });

        await waitFor(() => expect(hook.result.current.isLoading).toBeFalsy());
      },
      { response: null }
    );

    expect(hook.result.current.error).toBeUndefined();
    expect(hook.result.current.data).not.toBeUndefined();
  });

  it('[NEGATIVE] should fetch data while request is failure', async () => {
    await maskEndpointAsFailure(
      'getPublications',
      async () => {
        await act(() => {
          hook = setUpHook({ projectId });
        });

        await waitFor(() => expect(hook.result.current.isLoading).toBeFalsy());
      },
      { message: error }
    );

    expect(hook.result.current.error).toMatch(error);
    expect(hook.result.current.data).toBeUndefined();
  });
});

describe('educationListDataSelector', () => {
  it('should select data from slice', async () => {
    const hook = setUpHook({ projectId });

    await waitFor(() => expect(hook.result.current.isLoading).toBeFalsy());

    expect(educationListDataSelector(store.getState())).not.toBeUndefined();

    await act(() => unsetHook(hook));
  });

  it('[NEGATIVE] should select from empty slice', async () => {
    expect(educationListDataSelector({} as ReturnType<typeof store.getState>)).toBeUndefined();
  });
});
