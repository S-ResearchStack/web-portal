import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createTestStore } from '../store/testing';
import { useDeleteStorageObject, useResolveUrlOrObjectPath } from './objectStorage.slice';
import { mockStorageObjects } from './utils';

const createStore = () =>
  createTestStore({
    studies: {
      studies: [
        {
          id: 'test',
          name: 'test',
          color: 'black',
          createdAt: 0,
        },
      ],
      isLoading: false,
      selectedStudyId: 'test',
    },
  });

describe('objectStorage.slice', () => {
  beforeEach(() => {
    global.URL.createObjectURL = jest.fn().mockImplementation(() => 'blob://test');
    mockStorageObjects.splice(0, mockStorageObjects.length);
  });

  it('should resolve url or object path', async () => {
    const store = createStore();

    const hook = renderHook((pathOrUrl: string) => useResolveUrlOrObjectPath(pathOrUrl), {
      initialProps: '',
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    hook.rerender('https://example.com');
    expect(hook.result.current).toEqual({
      url: 'https://example.com',
      isLoading: false,
      error: undefined,
    });

    hook.rerender('blob://something');
    expect(hook.result.current).toEqual({
      url: 'blob://something',
      isLoading: false,
      error: undefined,
    });

    mockStorageObjects.push({
      name: 'test_object',
      blob: new Blob(),
    });
    hook.rerender('test_object');
    await waitFor(() => expect(hook.result.current.isLoading).toBeTrue());
    await waitFor(() => expect(hook.result.current.isLoading).toBeFalse());
    expect(hook.result.current).toEqual({
      url: expect.any(String),
      isLoading: false,
      error: undefined,
    });
  });

  it('[NEGATIVE] should return error if object cannot be resolved', async () => {
    const store = createStore();

    const hook = renderHook((pathOrUrl: string) => useResolveUrlOrObjectPath(pathOrUrl), {
      initialProps: 'not_existing',
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    await waitFor(() => expect(hook.result.current.isLoading).toBeTrue());
    await waitFor(() => expect(hook.result.current.isLoading).toBeFalse());
    expect(hook.result.current).toEqual({
      url: '',
      isLoading: false,
      error: expect.any(String),
    });
  });

  it('[NEGATIVE] should return empty url for empty path', async () => {
    const store = createStore();

    const hook = renderHook((pathOrUrl: string) => useResolveUrlOrObjectPath(pathOrUrl), {
      initialProps: '',
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    expect(hook.result.current).toEqual({
      url: '',
      isLoading: false,
      error: undefined,
    });
  });

  it('should delete storage object', async () => {
    const store = createStore();

    const hook = renderHook(() => useDeleteStorageObject(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    mockStorageObjects.push({
      name: 'test_object',
      blob: new Blob(),
    });
    const removeRes = await act(() => hook.result.current.remove('test_object'));
    expect(removeRes).toBeTrue();
    expect(hook.result.current).toEqual({
      isDeleting: false,
      error: undefined,
      remove: expect.any(Function),
    });
  });

  it('[NEGATIVE] should return error on delete non-existing storage object', async () => {
    const store = createStore();

    const hook = renderHook(() => useDeleteStorageObject(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    const removeRes = await act(() => hook.result.current.remove('not_existing'));
    expect(removeRes).toBeFalse();
    expect(hook.result.current).toEqual({
      isDeleting: false,
      error: expect.any(String),
      remove: expect.any(Function),
    });
  });
});
