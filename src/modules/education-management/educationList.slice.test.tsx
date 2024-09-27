import React from 'react';
import { Provider } from 'react-redux';
import { act, renderHook, waitFor } from '@testing-library/react';

import { store } from 'src/modules/store/store';
import { maskEndpointAsFailure, maskEndpointAsSuccess } from 'src/modules/api/mock';
import {
  educationListSlice,
  useEducationList,
  educationListDataSelector
} from './educationList.slice';
import type { StudyIdParams } from 'src/modules/api/endpoints';

const studyId = 'test-study';
const error = 'test-error';

describe('educationListSlice', () => {
  it('[NEGATIVE] should make empty state', () => {
    expect(educationListSlice.reducer(undefined, { type: 0 })).toEqual({
      fetchArgs: null,
      prevFetchArgs: null,
    });
  });
});

const setUpHook = (args: StudyIdParams | false) =>
  renderHook(
    (fetchArgs: StudyIdParams) =>
      useEducationList({ fetchArgs: fetchArgs || args }),
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

describe('useEducationListData', () => {
  let hook: ReturnType<typeof setUpHook>;

  afterEach(() => {
    act(() => unsetHook(hook));
  });

  it('should fetch data', async () => {
    hook = setUpHook({ studyId });

    await waitFor(() => expect(hook.result.current.isLoading).toBeFalsy());

    expect(hook.result.current.error).toBeUndefined();
    expect(hook.result.current.data).not.toBeUndefined();
  });

  it('[NEGATIVE] should fetch broken data', async () => {
    await maskEndpointAsSuccess(
      'getEducations',
      async () => {
        await act(() => {
          hook = setUpHook({ studyId });
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
      'getEducations',
      async () => {
        await act(() => {
          hook = setUpHook({ studyId });
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
    const hook = setUpHook({ studyId });

    await waitFor(() => expect(hook.result.current.isLoading).toBeFalsy());

    expect(educationListDataSelector(store.getState())).not.toBeUndefined();

    await act(() => unsetHook(hook));
  });

  it('[NEGATIVE] should select from empty slice', async () => {
    expect(educationListDataSelector({} as ReturnType<typeof store.getState>)).toBeUndefined();
  });
});
