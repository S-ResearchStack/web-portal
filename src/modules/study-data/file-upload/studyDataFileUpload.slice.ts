import {createSelector, createSlice, PayloadAction} from '@reduxjs/toolkit';

import {AppThunk, RootState, useAppSelector} from 'src/modules/store';
import applyDefaultApiErrorHandlers from 'src/modules/api/applyDefaultApiErrorHandlers';
import API, { FileDataInfo } from "src/modules/api";
import axios, {HttpStatusCode} from "axios";
import {FileCheckStatus, FileUploadStatus, StudyDataFileType, StudyDataType,} from "src/modules/study-data/studyData.enum";
import {showSnackbar} from "src/modules/snackbar/snackbar.slice";
import {FAILED_TO_UPLOAD_FILE} from "src/modules/study-data/StudyData.message";
import { uploadObject } from 'src/modules/object-storage/utils';
import StudyData from '../StudyData';

type UploadKey = string

interface FileUploadProgress {
  loaded: number
  total?: number
  checkStatus: FileCheckStatus
  uploadStatus: FileUploadStatus
}

export interface FileUploadState {
  [key: UploadKey]: FileUploadProgress
}

const initialState: FileUploadState = {}

const studyDataFileUploadSlice = createSlice({
  name: 'studyDataFileUpload',
  initialState,
  reducers: {
    init(state, { payload }: PayloadAction<{ key: UploadKey }>) {
      const { key } = payload
      state[key] = {
        loaded: 0,
        total: undefined,
        checkStatus: FileCheckStatus.READY,
        uploadStatus: FileUploadStatus.READY
      }
    },
    checkBegin(state, { payload }: PayloadAction<{ key: UploadKey }>) {
      const { key } = payload
      state[key].checkStatus = FileCheckStatus.CHECKING
    },
    checkEnd(state, { payload }: PayloadAction<{ key: UploadKey, checkStatus: FileCheckStatus }>) {
      const { key, checkStatus } = payload
      state[key].checkStatus = checkStatus
    },
    uploadBegin(state, { payload }: PayloadAction<{ key: UploadKey }>) {
      const { key } = payload
      state[key].uploadStatus = FileUploadStatus.UPLOADING
    },
    uploadProgress(state, { payload }: PayloadAction<{ key: UploadKey, loaded: number, total?: number }>) {
      const { key, loaded, total } = payload
      const progress = state[key]
      progress.loaded = loaded
      progress.total = total
    },
    uploadEnd(state, { payload }: PayloadAction<{ key: UploadKey, uploadStatus: FileUploadStatus }>) {
      const { key, uploadStatus } = payload
      state[key].uploadStatus = uploadStatus
    },
    reset() {
      return {}
    }
  },
});

interface StudyDataFileUploadParams {
  studyId: string
  parentId: string
  name: string
  studyDataType: string
  file: File
}

const getUploadKey = ({
  studyId,
  parentId,
  name,
  studyDataType,
  file
}: StudyDataFileUploadParams) => {
  let uploadKey = ""
  const ids = [studyId, parentId, name, studyDataType]
  for(let i = 0; i < ids.length; i += 1) {
    if(!ids[i]) break
    uploadKey = `${uploadKey}_${ids[i]}`
  }
  return `${uploadKey}_${file.name}`
}

export const checkStudyDataFileUploadable = ({
  studyId,
  parentId,
  name,
  studyDataType,
  file
}: StudyDataFileUploadParams): AppThunk<Promise<void>> =>
  async (dispatch) => {
    const ids = { studyId, parentId, name, studyDataType };
    const key = getUploadKey({ ...ids, file })

    let checkStatus = FileCheckStatus.UNSPECIFIED
    try {
      dispatch(studyDataFileUploadSlice.actions.init({ key }))
      dispatch(studyDataFileUploadSlice.actions.checkBegin( { key }))

      checkStatus = FileCheckStatus.AVAILABLE;

      // const { status, checkError } = await API.getFileDownloadUrls({ studyId, filePaths: [file.name] })

      // if(status === HttpStatusCode.NotFound) {
      //   checkStatus = FileCheckStatus.AVAILABLE
      // } else {
      //   checkStatus = FileCheckStatus.DUPLICATED
      // }
    } catch (e) {
      checkStatus = FileCheckStatus.CHECK_FAILED
    } finally {
      dispatch(studyDataFileUploadSlice.actions.checkEnd({ key, checkStatus }))
    }
  }

// should be modified to new version
export const uploadStudyDataFile = ({
  studyId,
  parentId,
  name,
  studyDataType,
  file,
  overwrite
}: StudyDataFileUploadParams & {overwrite: boolean}): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    const ids = { studyId, parentId, name, studyDataType };
    const key = getUploadKey({ ...ids, file })

    const state = getState().studyDataFileUpload[key]
    const { checkStatus } = state
    let { uploadStatus } = state
    if((!overwrite && checkStatus === FileCheckStatus.DUPLICATED) ||
      uploadStatus === FileUploadStatus.FINISHED) return

    try {
      dispatch(studyDataFileUploadSlice.actions.uploadBegin({ key }))

      await uploadObject({studyId, name: file.name, blob: file});

      const fileInfo = {
        fileType: StudyDataFileType.ATTACHMENT,
        filePath: `${studyId}/${file.name}`,
        fileSize: file.size,
        filePreview: file.type,
        createdAt: new Date().toISOString()
      } as FileDataInfo

      const requestBody = {
        parentId,
        name: file.name,
        type: StudyDataType.FILE,
        fileInfo
      }

      const { checkError: addCheckError } = await API.addStudyDataFileInfo(studyId, requestBody);
      addCheckError()

      uploadStatus = FileUploadStatus.FINISHED
    } catch (e) {
      applyDefaultApiErrorHandlers(e, dispatch)
      dispatch(showSnackbar({text: FAILED_TO_UPLOAD_FILE}))

      uploadStatus = FileUploadStatus.FAILED
    } finally {
      dispatch(studyDataFileUploadSlice.actions.uploadEnd({ key, uploadStatus }))
    }
}

export const prepareUploadFiles = (): AppThunk<Promise<void>> =>
  async (dispatch) => {
    dispatch(studyDataFileUploadSlice.actions.reset())
  }

export const studyDataFileIsDuplicatedSelector = createSelector(
  (state: RootState) => state.studyDataFileUpload,
  (data) => {
    for(const key in data) {
      if(Object.hasOwn(data, key)) {
        const v = data[key]
        if( v.checkStatus === FileCheckStatus.DUPLICATED ) {
          return true
        }
      }
    }
    return false
  }
)

export const studyDataFileIsCheckFinishedSelector = createSelector(
  (state: RootState) => state.studyDataFileUpload,
  (data) => {
    for(const key in data) {
      if(Object.hasOwn(data, key)) {
        const v = data[key]
        if( v.checkStatus === FileCheckStatus.UNSPECIFIED ||
            v.checkStatus === FileCheckStatus.READY ||
            v.checkStatus === FileCheckStatus.CHECKING ) {
          return false
        }
      }
    }
    return true
  }
)

export const studyDataFileIsUploadableSelector = createSelector(
  (state: RootState) => state.studyDataFileUpload,
  (data) => {
    let upload = false
    for(const key in data) {
      if(Object.hasOwn(data, key)) {
        const v = data[key]
        if( ( v.checkStatus !== FileCheckStatus.AVAILABLE &&
              v.checkStatus !== FileCheckStatus.DUPLICATED) ||
            ( v.uploadStatus !== FileUploadStatus.READY &&
              v.uploadStatus !== FileUploadStatus.FINISHED &&
              v.uploadStatus !== FileUploadStatus.FAILED )
        ) {
          return false
        }
        if( v.uploadStatus === FileUploadStatus.READY ||
            v.uploadStatus === FileUploadStatus.FAILED
        ) {
          upload = true
        }
      }
    }
    return upload
  }
)

export const studyDataFileExistsUploadableSelector = createSelector(
  (state: RootState) => state.studyDataFileUpload,
  (data) => {
    for(const key in data) {
      if(Object.hasOwn(data, key)) {
        const v = data[key]
        if( ( v.checkStatus !== FileCheckStatus.AVAILABLE &&
            v.checkStatus !== FileCheckStatus.DUPLICATED) ||
          ( v.uploadStatus !== FileUploadStatus.READY &&
            v.uploadStatus !== FileUploadStatus.FINISHED &&
            v.uploadStatus !== FileUploadStatus.FAILED )) {
          return false
        }
      }
    }
    return true
  }
)

export const studyDataFileIsUploadingSelector = createSelector(
  (state: RootState) => state.studyDataFileUpload,
  (data) => {
    for(const key in data) {
      if(Object.hasOwn(data, key)) {
        const v = data[key]
        if(v.uploadStatus === FileUploadStatus.UPLOADING) {
          return true
        }
      }
    }
    return false
  }
)

export const useStudyDataFileCheckStatus = (params: StudyDataFileUploadParams) => useAppSelector(
  createSelector(
    (state: RootState) => state.studyDataFileUpload,
    (data) => {
      return data[getUploadKey(params)].checkStatus
    }
  )
)

export const useStudyDataFileUploadStatus = (params: StudyDataFileUploadParams) => useAppSelector(
  createSelector(
    (state: RootState) => state.studyDataFileUpload,
    (data) => data[getUploadKey(params)].uploadStatus
  )
)

export const useStudyDataFileUploadProgress = (params: StudyDataFileUploadParams) => useAppSelector(
  createSelector(
  (state: RootState) => state.studyDataFileUpload,
  (data) => data[getUploadKey(params)]
  )
)

export const useStudyDataFileIsDuplicated = () => useAppSelector(studyDataFileIsDuplicatedSelector)

export const useStudyDataFileIsCheckFinished = () => useAppSelector(studyDataFileIsCheckFinishedSelector)

export const useStudyDataFileIsUploadable = () => useAppSelector(studyDataFileIsUploadableSelector)

export const useStudyDataFileIsUploading = () => useAppSelector(studyDataFileIsUploadingSelector)

export default {
  [studyDataFileUploadSlice.name]: studyDataFileUploadSlice.reducer
}
