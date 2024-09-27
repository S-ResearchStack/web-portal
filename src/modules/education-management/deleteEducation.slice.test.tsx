import React from 'react';
import { Provider } from 'react-redux';
import { act, renderHook, waitFor } from '@testing-library/react';

import { store } from 'src/modules/store/store';
import {
  deleteEducationSlice,
  useDeleteEducation,
  deleteEducationSelector
} from "./deleteEducation.slice";

describe('deleteEducationSlice', () => {
  it('[NEGATIVE] should make empty state', () => {
    expect(deleteEducationSlice.reducer(undefined, { type: 0 })).toEqual({
      isDeleting: false,
      isCanceling: false,
    });
  });
});

const setUpHook = () =>
  renderHook(() => useDeleteEducation(), {
    wrapper: ({ children }: React.PropsWithChildren) => (
      <Provider store={store}>{children}</Provider>
    ),
  });

const unsetHook = (hook: ReturnType<typeof setUpHook>) => {
  hook.unmount();
};

describe('useDeleteEducation', () => {
  let hook: ReturnType<typeof setUpHook>;

  afterEach(async () => {
    await act(() => unsetHook(hook));
  });

  it('should delete publication', async () => {
    expect(store.getState()['education/deleteEducation'].isDeleting).toBeFalsy();
    hook = setUpHook();

    await act(() => {
      hook.result.current.deleteEducation({
        studyId: 'test-study',
        educationId: 'test-education'
      });
    });

    expect(store.getState()['education/deleteEducation'].isDeleting).toBeTruthy();
    await waitFor(() => expect(deleteEducationSelector(store.getState()).isDeleting).toBeFalse());
  });

  it('should cancel publication', async () => {
    expect(store.getState()['education/deleteEducation'].isCanceling).toBeFalsy();
    hook = setUpHook();

    await act(() => {
      hook.result.current.cancelEducation({
        studyId: 'test-study',
        educationId: 'test-education'
      });
    });

    expect(store.getState()['education/deleteEducation'].isCanceling).toBeTruthy();
    await waitFor(() => expect(deleteEducationSelector(store.getState()).isCanceling).toBeFalse());
  });
});
