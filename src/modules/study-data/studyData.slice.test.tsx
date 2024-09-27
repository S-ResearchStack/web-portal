import API from 'src/modules/api';
import { createTestStore } from 'src/modules/store/testing';
import React from 'react';
import {
  initStage,
  loadData,
  loadFilePage,
  loadFolderPage,
  loadNextHistory,
  loadPrevHistory,
  loadStage,
  loadStudyDataFilePage,
  loadStudyDataFolderPage,
  useHasNextHistory,
  useHasPrevHistory,
  useStageState,
} from './studyData.slice';
import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';

const mockStudyDataStageState = {
  current: {
    filePage: 0,
    fileSize: 0,
    files: [],
    folderPage: 1,
    folderSize: 10,
    folders: [],
    path: [],
    pathLevel: 0,
    studyData: {} as any,
    totalFiles: 0,
    totalFolders: 0,
  },
  history: [{}, {}, {}, {}, {}] as any[],
  historyIndex: 2,
};

describe('studyDataLoadingSlice test', () => {
  const mockStudyDataLoadingState = { isLoadingFolder: false, isLoadingFile: false };

  it('[NEGATIVE] should initialize the empty state', () => {
    const store = createTestStore({});
    expect(store.getState().studyDataLoading).toEqual({});
  });

  it('should initialize with state', () => {
    const store = createTestStore({ studyDataLoading: mockStudyDataLoadingState });
    expect(store.getState().studyDataLoading).toEqual({
      isLoadingFolder: false,
      isLoadingFile: false,
    });
  });

  it('should handle load data', () => {
    const store = createTestStore({
      studyDataLoading: mockStudyDataLoadingState,
      studyDataStage: mockStudyDataStageState,
    });
    const dispatchedStore = store.dispatch(loadData({ middleFunc: async () => {} }) as any);
    return dispatchedStore.then(() => {
      expect(store.getState().studyDataLoading).toEqual({
        isLoadingFolder: false,
        isLoadingFile: false,
      });
    });
  });

  it('should handle load next history', () => {
    const store = createTestStore({
      studyDataLoading: mockStudyDataLoadingState,
      studyDataStage: mockStudyDataStageState,
    });
    const currentHistoryIndex = store.getState().studyDataStage.historyIndex;
    const dispatchedStore = store.dispatch(loadNextHistory() as any);
    return dispatchedStore.then(() => {
      expect(store.getState().studyDataLoading).toEqual({
        isLoadingFolder: false,
        isLoadingFile: false,
      });
      expect(store.getState().studyDataStage.historyIndex).toEqual(currentHistoryIndex + 1);
    });
  });

  it('should handle load prev history', () => {
    const store = createTestStore({
      studyDataLoading: mockStudyDataLoadingState,
      studyDataStage: mockStudyDataStageState,
    });
    const currentHistoryIndex = store.getState().studyDataStage.historyIndex;
    const dispatchedStore = store.dispatch(loadPrevHistory() as any);
    return dispatchedStore.then(() => {
      expect(store.getState().studyDataLoading).toEqual({
        isLoadingFolder: false,
        isLoadingFile: false,
      });
      expect(store.getState().studyDataStage.historyIndex).toEqual(currentHistoryIndex - 1);
    });
  });
});

describe('studyDataStageSlice test', () => {
  it('[NEGATIVE] should initialize the empty state', () => {
    const store = createTestStore({});
    expect(store.getState().studyDataStage).toEqual({
      history: [],
      historyIndex: -1,
      current: {
        studyData: undefined,
        folders: [],
        totalFolders: 0,
        folderPage: 0,
        folderSize: 0,
        files: [],
        totalFiles: 0,
        filePage: 0,
        fileSize: 0,
        path: [],
        pathLevel: 0,
      },
    });
  });

  it('should initialize with state', () => {
    const store = createTestStore({ studyDataStage: mockStudyDataStageState });
    expect(store.getState().studyDataStage).toEqual(mockStudyDataStageState);
  });

  it('should handle initStage', () => {
    const store = createTestStore({});
    API.mock.provideEndpoints({
      getStudyDataFolders() {
        return API.mock.response([]);
      },
      getStudyDataCount() {
        return API.mock.response({ totalCount: 5 });
      },
    });
    const currentHistoryIndex = store.getState().studyDataStage.historyIndex;
    const dispatchedStore = store.dispatch(initStage('id', 3) as any);
    return dispatchedStore.then(() => {
      expect(store.getState().studyDataStage).toEqual({
        historyIndex: currentHistoryIndex + 1,
        current: expect.objectContaining({ totalFolders: 5 }),
        history: expect.anything(),
      });
    });
  });

  it('should handle loadStage', () => {
    const store = createTestStore({});
    API.mock.provideEndpoints({
      getStudyDataFolders() {
        return API.mock.response([]);
      },
      getStudyDataCount() {
        return API.mock.response({ totalCount: 5 });
      },
      getStudyDataFiles() {
        return API.mock.response([]);
      },
    });
    const currentHistoryIndex = store.getState().studyDataStage.historyIndex;
    const dispatchedStore = store.dispatch(
      loadStage({ studyId: 'id', parentId: 'parentId', parentName: 'parent', size: 10 }) as any
    );
    return dispatchedStore.then(() => {
      expect(store.getState().studyDataStage).toEqual({
        historyIndex: currentHistoryIndex + 1,
        current: expect.objectContaining({ totalFolders: 5, totalFiles: 5 }),
        history: expect.anything(),
      });
    });
  });

  it('should handle loadStudyFolderPage', () => {
    const store = createTestStore({});
    API.mock.provideEndpoints({
      getStudyDataFolders() {
        return API.mock.response([]);
      },
      getStudyDataCount() {
        return API.mock.response({ totalCount: 5 });
      },
    });
    const currentHistoryIndex = store.getState().studyDataStage.historyIndex;
    const dispatchedStore = store.dispatch(
      loadStudyDataFolderPage({ studyId: 'id', parentId: 'parentId', page: 2, size: 10 }) as any
    );
    return dispatchedStore.then(() => {
      expect(store.getState().studyDataStage).toEqual({
        historyIndex: currentHistoryIndex + 1,
        current: expect.objectContaining({ totalFolders: 5 }),
        history: expect.anything(),
      });
    });
  });

  it('should handle loadStudyFilePage', () => {
    const store = createTestStore({});
    API.mock.provideEndpoints({
      getStudyDataFiles() {
        return API.mock.response([]);
      },
      getStudyDataCount() {
        return API.mock.response({ totalCount: 5 });
      },
    });
    const currentHistoryIndex = store.getState().studyDataStage.historyIndex;
    const dispatchedStore = store.dispatch(
      loadStudyDataFilePage({ studyId: 'id', parentId: 'parentId', page: 2, size: 10 }) as any
    );
    return dispatchedStore.then(() => {
      expect(store.getState().studyDataStage).toEqual({
        historyIndex: currentHistoryIndex + 1,
        current: expect.objectContaining({ totalFiles: 5 }),
        history: expect.anything(),
      });
    });
  });

  const mockStudyDataLoadingState = { isLoadingFolder: false, isLoadingFile: false };
  it('should handle loadFolderPage', () => {
    const store = createTestStore({
      studyDataLoading: mockStudyDataLoadingState,
      studyDataStage: mockStudyDataStageState,
    });
    const currentHistoryIndex = store.getState().studyDataStage.historyIndex;
    const dispatchedStore = store.dispatch(loadFolderPage({ page: 2, size: 10 }) as any);
    return dispatchedStore.then(() => {
      expect(store.getState().studyDataStage).toEqual({
        historyIndex: currentHistoryIndex + 2,
        current: expect.anything(),
        history: expect.anything(),
      });
    });
  });

  it('should handle loadFilePage', () => {
    const store = createTestStore({
      studyDataLoading: mockStudyDataLoadingState,
      studyDataStage: mockStudyDataStageState,
    });
    const currentHistoryIndex = store.getState().studyDataStage.historyIndex;
    const dispatchedStore = store.dispatch(loadFilePage({ page: 2, size: 10 }) as any);
    return dispatchedStore.then(() => {
      expect(store.getState().studyDataStage).toEqual({
        historyIndex: currentHistoryIndex + 2,
        current: expect.anything(),
        history: expect.anything(),
      });
    });
  });
});

describe('hook test', () => {
  it('should useStageState return correctly', () => {
    const store = createTestStore({ studyDataStage: mockStudyDataStageState });
    const hook = renderHook(() => useStageState(), {
      wrapper: ({ children }: React.PropsWithChildren) => (
        <Provider store={store}>{children}</Provider>
      ),
    });
    expect(hook.result.current).toEqual(mockStudyDataStageState.current);
  });

  it('[NEGATIVE] should useStageState return with empty store', () => {
    const store = createTestStore({});
    const hook = renderHook(() => useStageState(), {
      wrapper: ({ children }: React.PropsWithChildren) => (
        <Provider store={store}>{children}</Provider>
      ),
    });
    expect(hook.result.current).toEqual({
      filePage: 0,
      fileSize: 0,
      files: [],
      folderPage: 0,
      folderSize: 0,
      folders: [],
      path: [],
      pathLevel: 0,
      studyData: undefined,
      totalFiles: 0,
      totalFolders: 0,
    });
  });

  it('should useHasNextHistory return correctly', () => {
    const store = createTestStore({ studyDataStage: mockStudyDataStageState });
    const hook = renderHook(() => useHasNextHistory(), {
      wrapper: ({ children }: React.PropsWithChildren) => (
        <Provider store={store}>{children}</Provider>
      ),
    });
    expect(hook.result.current).toEqual(true);
  });

  it('[NEGATIVE] should useHasNextHistory return with empty store', () => {
    const store = createTestStore({});
    const hook = renderHook(() => useHasNextHistory(), {
      wrapper: ({ children }: React.PropsWithChildren) => (
        <Provider store={store}>{children}</Provider>
      ),
    });
    expect(hook.result.current).toEqual(false);
  });

  it('should useHasPrevHistory return correctly', () => {
    const store = createTestStore({ studyDataStage: mockStudyDataStageState });
    const hook = renderHook(() => useHasPrevHistory(), {
      wrapper: ({ children }: React.PropsWithChildren) => (
        <Provider store={store}>{children}</Provider>
      ),
    });
    expect(hook.result.current).toEqual(true);
  });

  it('[NEGATIVE] should useHasPrevHistory return with empty store', () => {
    const store = createTestStore({ });
    const hook = renderHook(() => useHasPrevHistory(), {
      wrapper: ({ children }: React.PropsWithChildren) => (
        <Provider store={store}>{children}</Provider>
      ),
    });
    expect(hook.result.current).toEqual(false);
  });
});
