import {
  FileUploadState,
  useStudyDataFileCheckStatus,
  useStudyDataFileIsCheckFinished,
  useStudyDataFileIsDuplicated,
  useStudyDataFileIsUploadable,
  useStudyDataFileIsUploading,
  useStudyDataFileUploadProgress,
  useStudyDataFileUploadStatus,
} from './studyDataFileUpload.slice';
import {
  checkStudyDataFileUploadable,
  uploadStudyDataFile,
  prepareUploadFiles,
} from './studyDataFileUpload.slice';
import API from 'src/modules/api';
import { FileCheckStatus, FileUploadStatus } from 'src/modules/study-data/studyData.enum';
import { createTestStore } from 'src/modules/store/testing';
import axios from 'axios';
import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import React from 'react';

const initialState: FileUploadState = {
  '_123_test_subject_test_session_test_task_test.txt': {
    loaded: 1,
    total: 1,
    checkStatus: FileCheckStatus.READY,
    uploadStatus: FileUploadStatus.READY,
  },
};
const mockFile = new File(['some sample text'], 'test.txt');
const mockUploadStudyData = {
  studyId: '123',
  parentId: 'parentId',
  name: 'name',
  studyDataType: 'FILE',
  file: mockFile,
};

describe('studyDataFileUploadSlice test', () => {
  it('[NEGATIVE] should initialize the empty state', () => {
    const store = createTestStore({});
    expect(store.getState().studyDataFileUpload).toEqual({});
  });

  it('should initialize with state', () => {
    const store = createTestStore({ studyDataFileUpload: initialState });
    expect(store.getState().studyDataFileUpload).toEqual(initialState);
  });

  it('should handle prepareUploadFiles correctly', () => {
    const store = createTestStore({ studyDataFileUpload: initialState });
    const dispatchedStore = store.dispatch(prepareUploadFiles() as any);
    return dispatchedStore.then(() => {
      expect(store.getState().studyDataFileUpload).toEqual({});
    });
  });

  it('[NEGATIVE] should useStudyDataFileIsDuplicated return false', () => {
    const store = createTestStore({ studyDataFileUpload: initialState });
    const hook = renderHook(() => useStudyDataFileIsDuplicated(), {
      wrapper: ({ children }: React.PropsWithChildren) => (
        <Provider store={store}>{children}</Provider>
      ),
    });
    expect(hook.result.current).toEqual(false);
  });

  it('should useStudyDataFileIsDuplicated return true', () => {
    const key = '_id_test.txt';
    const initialState = {
      [key]: {
        checkStatus: FileCheckStatus.DUPLICATED,
        loaded: 1,
        uploadStatus: FileUploadStatus.READY,
      },
    };
    const store = createTestStore({ studyDataFileUpload: initialState });
    const hook = renderHook(() => useStudyDataFileIsDuplicated(), {
      wrapper: ({ children }: React.PropsWithChildren) => (
        <Provider store={store}>{children}</Provider>
      ),
    });
    expect(hook.result.current).toEqual(true);
  });

  it('should useStudyDataFileIsCheckFinishedSelector return true', () => {
    const key = '_id_test.txt';
    const initialState = {
      [key]: {
        checkStatus: FileCheckStatus.AVAILABLE,
        loaded: 1,
        uploadStatus: FileUploadStatus.READY,
      },
    };
    const store = createTestStore({ studyDataFileUpload: initialState });
    const hook = renderHook(() => useStudyDataFileIsCheckFinished(), {
      wrapper: ({ children }: React.PropsWithChildren) => (
        <Provider store={store}>{children}</Provider>
      ),
    });
    expect(hook.result.current).toEqual(true);
  });

  it('[NEGATIVE] should useStudyDataFileIsCheckFinishedSelector return false', () => {
    const store = createTestStore({ studyDataFileUpload: initialState });
    const hook = renderHook(() => useStudyDataFileIsCheckFinished(), {
      wrapper: ({ children }: React.PropsWithChildren) => (
        <Provider store={store}>{children}</Provider>
      ),
    });
    expect(hook.result.current).toEqual(false);
  });

  it('should studyDataFileIsUploadableSelector return true', () => {
    const key = '_id_test.txt';
    const initialState = {
      [key]: {
        checkStatus: FileCheckStatus.AVAILABLE,
        loaded: 1,
        uploadStatus: FileUploadStatus.READY,
      },
    };
    const store = createTestStore({ studyDataFileUpload: initialState });
    const hook = renderHook(() => useStudyDataFileIsUploadable(), {
      wrapper: ({ children }: React.PropsWithChildren) => (
        <Provider store={store}>{children}</Provider>
      ),
    });
    expect(hook.result.current).toEqual(true);
  });

  it('[NEGATIVE] should studyDataFileIsUploadableSelector return false', () => {
    const store = createTestStore({ studyDataFileUpload: initialState });
    const hook = renderHook(() => useStudyDataFileIsUploadable(), {
      wrapper: ({ children }: React.PropsWithChildren) => (
        <Provider store={store}>{children}</Provider>
      ),
    });
    expect(hook.result.current).toEqual(false);
  });

  it('should studyDataFileIsUploadingSelector return true', () => {
    const key = '_id_test.txt';
    const initialState = {
      [key]: {
        checkStatus: FileCheckStatus.AVAILABLE,
        loaded: 1,
        uploadStatus: FileUploadStatus.UPLOADING,
      },
    };
    const store = createTestStore({ studyDataFileUpload: initialState });
    const hook = renderHook(() => useStudyDataFileIsUploading(), {
      wrapper: ({ children }: React.PropsWithChildren) => (
        <Provider store={store}>{children}</Provider>
      ),
    });
    expect(hook.result.current).toEqual(true);
  });

  it('[NEGATIVE] should studyDataFileIsUploadingSelector return false', () => {
    const store = createTestStore({ studyDataFileUpload: initialState });
    const hook = renderHook(() => useStudyDataFileIsUploading(), {
      wrapper: ({ children }: React.PropsWithChildren) => (
        <Provider store={store}>{children}</Provider>
      ),
    });
    expect(hook.result.current).toEqual(false);
  });

  it('should useStudyDataFileCheckStatus return correctly', () => {
    const store = createTestStore({ studyDataFileUpload: initialState });
    const hook = renderHook(() => useStudyDataFileCheckStatus(mockUploadStudyData), {
      wrapper: ({ children }: React.PropsWithChildren) => (
        <Provider store={store}>{children}</Provider>
      ),
    });
    expect(hook.result.current).toEqual(FileCheckStatus.READY);
  });

  it('should useStudyDataFileUploadStatus return correctly', () => {
    const store = createTestStore({ studyDataFileUpload: initialState });
    const hook = renderHook(() => useStudyDataFileUploadStatus(mockUploadStudyData), {
      wrapper: ({ children }: React.PropsWithChildren) => (
        <Provider store={store}>{children}</Provider>
      ),
    });
    expect(hook.result.current).toEqual(FileUploadStatus.READY);
  });

  it('should useStudyDataFileCheckStatus return correctly', () => {
    const store = createTestStore({ studyDataFileUpload: initialState });
    const hook = renderHook(() => useStudyDataFileUploadProgress(mockUploadStudyData), {
      wrapper: ({ children }: React.PropsWithChildren) => (
        <Provider store={store}>{children}</Provider>
      ),
    });
    expect(hook.result.current).toEqual(
      initialState['_123_test_subject_test_session_test_task_test.txt']
    );
  });
});
