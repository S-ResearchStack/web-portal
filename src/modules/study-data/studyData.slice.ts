import {createSelector, createSlice} from "@reduxjs/toolkit";
import studyDataFileUploadReducers from "src/modules/study-data/file-upload/studyDataFileUpload.slice";
import {AppDispatch, AppThunk, RootState, useAppSelector} from "src/modules/store";
import API, {ROOT_FOLDER_ID} from "src/modules/api";
import {transformStudyDataFileFromApi, transformStudyDataFolderFromApi} from "src/modules/study-data/studyData.mapper";
import {StudyDataFileType, StudyDataType} from "src/modules/study-data/studyData.enum";
import applyDefaultApiErrorHandlers from "src/modules/api/applyDefaultApiErrorHandlers";
import {PaginationParams} from "src/modules/api/models/pagination";
import {showSnackbar} from "src/modules/snackbar/snackbar.slice";
import {FAILED_TO_GET_DOWNLOAD_URL} from "src/modules/study-data/StudyData.message";

export interface StudyDataInfo {
  id: string
  studyId: string
  parentId: string
  name: string
  studyDataType: string
}

export type StudyDataFolder = StudyDataInfo

export interface StudyDataFile extends StudyDataInfo {
  type: StudyDataFileType
  path: string
  size: string
  preview?: string
  createdAt: string
}

interface LoadingState {
  isLoadingFolder?: boolean
  isLoadingFile?: boolean
}

const loadingInitialState: LoadingState = {}

const studyDataLoadingSlice = createSlice(({
  name: "studyDataLoading",
  initialState: loadingInitialState,
  reducers: {
    loadBegin(state) {
      state.isLoadingFolder = true
      state.isLoadingFile = true
    },
    loadFolderBegin(state) {
      state.isLoadingFolder = true
    },
    loadFileBegin(state) {
      state.isLoadingFile = true
    },
    loadEnd(state) {
      state.isLoadingFolder = false
      state.isLoadingFile = false
    },
    loadFolderEnd(state) {
      state.isLoadingFolder = false
    },
    loadFileEnd(state) {
      state.isLoadingFile = false
    }
  }
}))

interface StageData {
  studyData: StudyDataInfo | undefined
  folders: StudyDataFolder[]
  totalFolders: number
  folderPage: number
  folderSize: number
  files: StudyDataFile[]
  totalFiles: number
  filePage: number
  fileSize: number
  path: string[]
  pathLevel: number
}

interface StageState {
  current: StageData
  history: StageData[]
  historyIndex: number
}

const stageInitialState: StageData = {
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
  pathLevel: 0
}

const StageInitialState: StageState = {
  current: stageInitialState,
  history: [],
  historyIndex: -1,
}

const studyDataStageSlice = createSlice(({
  name: 'studyDataStage',
  initialState: StageInitialState,
  reducers: {
    loadData(state, action) {
      state.current = { ...action.payload }
    },
    loadFolders(state, action) {
      const { studyData, folders, totalFolders, folderPage, folderSize } = action.payload
      const { files, totalFiles, filePage, fileSize, path, pathLevel } = state.current
      state.current = {
        studyData,
        folders,
        totalFolders,
        folderPage,
        folderSize,
        files,
        totalFiles,
        filePage,
        fileSize,
        path,
        pathLevel
      }
    },
    loadFiles(state, action) {
      const { files, totalFiles, filePage, fileSize } = action.payload
      const { studyData, folders, totalFolders, folderPage, folderSize, path, pathLevel } = state.current
      state.current = {
        studyData,
        folders,
        totalFolders,
        folderPage,
        folderSize,
        files,
        totalFiles,
        filePage,
        fileSize,
        path,
        pathLevel
      }
    },
    init(state) {
      state.current = stageInitialState
      state.history = []
      state.historyIndex = -1
    },
    addHistory(state) {
      state.historyIndex += 1;
      const nextIndex = state.historyIndex;
      state.history = state.history.slice(0, (nextIndex))
      state.history.push(state.current)
    },
    loadNextHistory(state) {
      if(state.historyIndex >= state.history.length - 1) return
      state.historyIndex += 1
      const nextIndex = state.historyIndex;
      state.current = state.history[nextIndex]
    },
    loadPrevHistory(state) {
      if(state.historyIndex <= 0) return
      state.historyIndex -= 1;
      const prevIndex = state.historyIndex;
      state.current = state.history[prevIndex]
    }
  }
}))

type LoadStudyDataParams = { studyId: string, parentId: string } & PaginationParams

export const initStage = (studyId: string, size: number): AppThunk<Promise<void>> =>
  async (dispatch) => {
    const studyData = { studyId, parentId: ROOT_FOLDER_ID }
    const request =  { ...studyData, page: 0, size }
    const results = await Promise.all([
      API.getStudyDataFolders(request),
      API.getStudyDataCount({...studyData, studyDataType: StudyDataType.FOLDER}),
    ])

    results.forEach(r => r.checkError())

    dispatch(studyDataStageSlice.actions.init())
    dispatch(studyDataStageSlice.actions.loadData({
      studyData,
      folders: results[0].data.map(transformStudyDataFolderFromApi),
      totalFolders: results[1].data.totalCount,
      folderPage: 0,
      folderSize: size,
      files: [],
      totalFiles: 0,
      filePage: 0,
      fileSize: size,
      path: [ROOT_FOLDER_ID],
      pathLevel: 1
    }))
    dispatch(studyDataStageSlice.actions.addHistory())
  }

export const loadStage = ({
  studyId, parentId, parentName, size
}: LoadStudyDataParams & {parentName: string}): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    try {
      const studyData = { studyId, parentId }
      const request =  { ...studyData, page: 0, size }
      const results = await Promise.all([
        API.getStudyDataFolders(request),
        API.getStudyDataCount({...studyData, studyDataType: StudyDataType.FOLDER}),
        API.getStudyDataFiles(request),
        API.getStudyDataCount({...studyData, studyDataType: StudyDataType.FILE})
      ])

      results.forEach(r => r.checkError())

      const { path, pathLevel } = getState().studyDataStage.current

      dispatch(studyDataStageSlice.actions.loadData({
        studyData,
        folders: results[0].data.map(transformStudyDataFolderFromApi),
        totalFolders: results[1].data.totalCount,
        folderPage: 0,
        folderSize: size,
        files: results[2].data.map(transformStudyDataFileFromApi),
        totalFiles: results[3].data.totalCount,
        filePage: 0,
        fileSize: size,
        path: [...path, parentName],
        pathLevel: pathLevel + 1
      }))
      dispatch(studyDataStageSlice.actions.addHistory())
    } catch(e) {
      applyDefaultApiErrorHandlers(e, dispatch)
    }
  }

export const loadStudyDataFolderPage = ({
  studyId, parentId, page, size
}: LoadStudyDataParams): AppThunk<Promise<void>> =>
  async (dispatch) => {
    try {
      const studyData = { studyId, parentId }
      const request =  { ...studyData, page, size }
      const results = await Promise.all([
        API.getStudyDataFolders(request),
        API.getStudyDataCount({studyId, parentId, studyDataType: StudyDataType.FOLDER}),
      ])

      results.forEach(r => r.checkError())

      dispatch(studyDataStageSlice.actions.loadFolders({
        studyData,
        folders: results[0].data.map(transformStudyDataFolderFromApi),
        totalFolders: results[1].data.totalCount,
        folderPage: page,
        folderSize: size,
      }))
      dispatch(studyDataStageSlice.actions.addHistory())
    } catch(e) {
      applyDefaultApiErrorHandlers(e, dispatch)
    }
  }

export const loadStudyDataFilePage = ({
  studyId, parentId, page, size
}: LoadStudyDataParams): AppThunk<Promise<void>> =>
  async (dispatch) => {
    try {
      const studyData = { studyId, parentId }
      const request =  { ...studyData, page, size }
      const results = await Promise.all([
        API.getStudyDataFiles(request),
        API.getStudyDataCount({studyId, parentId, studyDataType: StudyDataType.FILE}),
      ])

      results.forEach(r => r.checkError())

      dispatch(studyDataStageSlice.actions.loadFiles({
        studyData,
        files: results[0].data.map(transformStudyDataFileFromApi),
        totalFiles: results[1].data.totalCount,
        filePage: page,
        fileSize: size
      }))
      dispatch(studyDataStageSlice.actions.addHistory())
    } catch(e) {
      applyDefaultApiErrorHandlers(e, dispatch)
    }
  }

interface MiddleFuncParams {
  dispatch: AppDispatch
  studyData: StudyDataInfo
}

interface LoadDataParams {
  middleFunc: (params: MiddleFuncParams) => Promise<unknown>
}

export const loadData = ({ middleFunc }: LoadDataParams): AppThunk<Promise<unknown>> =>
  async (dispatch, getState) => {
    const {studyData} = getState().studyDataStage.current
    if(!studyData) {
      return
    }

    dispatch(studyDataLoadingSlice.actions.loadBegin())
    await middleFunc?.({ dispatch, studyData })
    dispatch(studyDataLoadingSlice.actions.loadEnd())
  }

export const loadFolderPage = ({ page, size }: PaginationParams): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    if (getState().studyDataLoading.isLoadingFolder) {
      return
    }
    await dispatch(loadData({
      middleFunc: async (params: MiddleFuncParams) => {
        const {dispatch, studyData} = params
        await dispatch(loadStudyDataFolderPage({...studyData, page, size}))
        dispatch(studyDataStageSlice.actions.addHistory())
      }
    }))
  }

export const loadFilePage = ({ page, size }: PaginationParams): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    if (getState().studyDataLoading.isLoadingFolder) {
      return
    }
    await dispatch(loadData({
      middleFunc: async (params: MiddleFuncParams) => {
        const {dispatch, studyData} = params
        await dispatch(loadStudyDataFilePage({...studyData, page, size}))
        dispatch(studyDataStageSlice.actions.addHistory())
      }
    }))
  }


export const loadNextHistory = (): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    if(getState().studyDataLoading.isLoadingFolder || getState().studyDataLoading.isLoadingFile) return
    dispatch(studyDataLoadingSlice.actions.loadBegin())
    dispatch(studyDataStageSlice.actions.loadNextHistory())
    dispatch(studyDataLoadingSlice.actions.loadEnd())
  }

export const loadPrevHistory = (): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    if(getState().studyDataLoading.isLoadingFolder || getState().studyDataLoading.isLoadingFile) return
    dispatch(studyDataLoadingSlice.actions.loadBegin())
    dispatch(studyDataStageSlice.actions.loadPrevHistory())
    dispatch(studyDataLoadingSlice.actions.loadEnd())
  }

const studyDataStage = createSelector(
  (state: RootState) => state.studyDataStage,
  (stateState) => stateState.current
)

export const useStageState = () => useAppSelector(studyDataStage)

const hasNextHistorySelector = createSelector(
  (state: RootState) => state.studyDataStage,
  (stateState) => stateState.historyIndex < stateState.history.length - 1
)

const hasPrevHistorySelector = createSelector(
  (state: RootState) => state.studyDataStage,
  (stateState) => stateState.historyIndex > 0
)

export const useHasNextHistory = () => useAppSelector(hasNextHistorySelector)

export const useHasPrevHistory = () => useAppSelector(hasPrevHistorySelector)

export default {
  ...studyDataFileUploadReducers,
  [studyDataLoadingSlice.name]: studyDataLoadingSlice.reducer,
  [studyDataStageSlice.name]: studyDataStageSlice.reducer
}
