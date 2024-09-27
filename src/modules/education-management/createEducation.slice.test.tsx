import React from 'react';
import { Provider } from 'react-redux';
import { act, renderHook } from '@testing-library/react';
import { store } from 'src/modules/store/store';
import { useCreateEducation } from './createEducation.slice';
import { EducationalContentType } from 'src/modules/api';

const source = EducationalContentType.SCRATCH;

const setUpHook = () =>
  renderHook(() => useCreateEducation(), {
    wrapper: ({ children }: React.PropsWithChildren) => (
      <Provider store={store}>{children}</Provider>
    ),
  });

const unsetHook = (hook: ReturnType<typeof setUpHook>) => {
  hook.unmount();
};

describe('useCreateEducation', () => {
  let hook: ReturnType<typeof setUpHook>;

  afterEach(async () => {
    await act(() => unsetHook(hook));
  });

  it('should create publication', async () => {
    expect(store.getState()['education/educationEditor'].data).toBeFalsy();
    hook = setUpHook();

    await act(() => {
      hook.result.current.create({ source });
    });

    expect(store.getState()['education/educationEditor'].isLoading).toBeFalsy();
  });
});
