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
  subjectNumber: 'test_subject',
  sessionId: 'test_session',
  taskId: 'test_task',
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

  it('[NEGATIVE] should handle checkStudyDataFileUploadable NotFound correctly', async () => {
    const store = createTestStore({ studyDataFileUpload: initialState });
    API.mock.provideEndpoints({
      getStudyDataFileInfo() {
        return API.mock.failedResponse({ status: 404 });
      },
    });

    const dispatchedStore = store.dispatch(
      checkStudyDataFileUploadable({ studyId: 'id', file: mockFile }) as any
    );
    const key = '_id_test.txt';
    return dispatchedStore.then(() => {
      expect(store.getState().studyDataFileUpload[key].checkStatus).toEqual(
        FileCheckStatus.AVAILABLE
      );
    });
  });

  it('should handle checkStudyDataFileUploadable DUPLICATED correctly', async () => {
    const store = createTestStore({ studyDataFileUpload: initialState });
    API.mock.provideEndpoints({
      getStudyDataFileInfo() {
        return API.mock.response('body' as any);
      },
    });

    const dispatchedStore = store.dispatch(
      checkStudyDataFileUploadable({ studyId: 'id', file: mockFile }) as any
    );
    const key = '_id_test.txt';
    return dispatchedStore.then(() => {
      expect(store.getState().studyDataFileUpload[key].checkStatus).toEqual(
        FileCheckStatus.DUPLICATED
      );
    });
  });

  it('[NEGATIVE] should handle checkStudyDataFileUploadable failed', async () => {
    const store = createTestStore({ studyDataFileUpload: initialState });
    API.mock.provideEndpoints({
      getStudyDataFileInfo() {
        throw new Error();
      },
    });

    const dispatchedStore = store.dispatch(
      checkStudyDataFileUploadable({ studyId: 'id', file: mockFile }) as any
    );
    const key = '_id_test.txt';
    return dispatchedStore.then(() => {
      expect(store.getState().studyDataFileUpload[key].checkStatus).toEqual(
        FileCheckStatus.CHECK_FAILED
      );
    });
  });

  it('should handle uploadStudyDataFile correctly', () => {
    const key = '_id_test.txt';
    const initialState = {
      [key]: {},
    };

    const store = createTestStore({ studyDataFileUpload: initialState as any });
    API.mock.provideEndpoints({
      getStudyDataFileUploadUrl() {
        return API.mock.response({ headers: 'header', presignedUrl: 'abc' } as any);
      },
      addStudyDataFileInfo() {
        return API.mock.response({} as any);
      },
    });

    jest.spyOn(axios, 'put').mockResolvedValue({});
    const dispatchedStore = store.dispatch(
      uploadStudyDataFile({ studyId: 'id', file: mockFile, overwrite: true }) as any
    );
    return dispatchedStore.then(() => {
      expect(store.getState().studyDataFileUpload[key].uploadStatus).toEqual(
        FileUploadStatus.FINISHED
      );
    });
  });

  it('[NEGATIVE] should handle error uploadStudyDataFile', () => {
    const key = '_id_test.txt';
    const initialState = {
      [key]: {},
    };

    const store = createTestStore({ studyDataFileUpload: initialState as any });
    API.mock.provideEndpoints({
      getStudyDataFileUploadUrl() {
        return API.mock.failedResponse({ status: 500 });
      },
      addStudyDataFileInfo() {
        return API.mock.response({} as any);
      },
    });

    jest.spyOn(axios, 'put').mockResolvedValue({});
    const dispatchedStore = store.dispatch(
      uploadStudyDataFile({ studyId: 'id', file: mockFile, overwrite: true }) as any
    );
    return dispatchedStore.then(() => {
      expect(store.getState().studyDataFileUpload[key].uploadStatus).toEqual(
        FileUploadStatus.FAILED
      );
    });
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
