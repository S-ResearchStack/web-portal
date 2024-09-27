import { renderHook } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { act } from 'react-test-renderer';
import { store } from '../store/store';
import { useFileUpload } from './fileUpload.slice';

const setUpHook = <T extends () => ReturnType<T>>(useHook: () => ReturnType<T>) =>
  renderHook(() => useHook(), {
    wrapper: ({ children }: React.PropsWithChildren) => (
      <Provider store={store}>{children}</Provider>
    ),
  });

const unSetHook = (hook: ReturnType<typeof setUpHook>) => {
  'reset' in hook.result.current && hook.result.current.reset();
  hook.unmount();
};

const fileKey = 'fileKey';

describe('useFileUpload', () => {
  let hook: ReturnType<typeof setUpHook>;
  afterEach(() => {
    act(() => unSetHook(hook));
  });
  it('should update use of file to be 1', async () => {
    hook = setUpHook(() => useFileUpload({ key: fileKey }));
    const file = new File([''], 'test.png', { type: 'image/png' });
    await act(async () => {
      await hook.result.current.upload(file);
    });

    expect(hook.result.current.uses).toBe(1);
  });

  it('[NEGATIVE] upload with false key', async () => {
    hook = setUpHook(() => useFileUpload({ key: false }));
    const file = new File([''], 'test.png', { type: 'image/png' });
    await act(async () => {
      await hook.result.current.upload(file);
    });
    expect(hook.result.current.upload).toBeDefined();
  });

  it('[NEGATIVE] upload with error file', async () => {
    hook = setUpHook(() => useFileUpload({ key: fileKey }));
    const invalidFile = 'errorFile' as unknown as File;
    await act(async () => {
      await hook.result.current.upload(invalidFile);
    });
    expect(hook.result.current.error).toBeDefined();
  });
});
