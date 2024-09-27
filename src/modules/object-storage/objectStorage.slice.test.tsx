import React from 'react';
import { act, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createTestStore } from '../store/testing';
import { useUploadObject } from './objectStorage.slice';
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

describe('useUploadObject', () => {
  beforeEach(() => {
    global.URL.createObjectURL = jest.fn().mockImplementation(() => 'blob://test');
    mockStorageObjects.splice(0, mockStorageObjects.length);
  });
  it('should upload object', async () => {
    const store = createStore();

    const hook = renderHook(() => useUploadObject(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    await act(() =>
      hook.result.current.upload({
        path: 'test',
        file: new File([new Blob()], 'f'),
        generateDownloadUrl: false,
      })
    );

    expect(hook.result.current.error).toBeUndefined();
  });

  it('[NEGATIVE] should throw error if not found study', async () => {
    const store = createTestStore({
      studies: undefined,
    });

    const hook = renderHook(() => useUploadObject(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    expect(
      hook.result.current.upload({
        path: 'test',
        file: new File([new Blob()], 'f'),
        generateDownloadUrl: true,
      })
    ).resolves.toMatchObject({
      err: 'Error: No studyId provided',
    });
  });
});
