import {StudyDataFileType, SubjectStatus} from "src/modules/study-data/studyData.enum";

export interface GetStudyDataRequest {
  studyId: string
}

export interface GetSubjectDataRequest {
  studyId: string,
  subjectNumber: string
}

export interface GetSubjectInfoListRequest {
  studyId: string
  includeTaskRecord?: boolean
}

export interface GetSessionInfoListRequest {
  studyId: string
  subjectNumber: string
}

export interface GetTaskInfoListRequest {
  studyId: string
  subjectNumber: string
  sessionId: string
}

export interface GetTrialInfoListRequest {
  studyId: string
  subjectNumber: string
  sessionId: string
  taskId: string
}

export interface GetExtraInfoRequest {
  studyId: string
  subjectNumber?: string
  sessionId?: string
  taskId?: string
  trialId?: string
}

export interface GetRawDataInfoRequest {
  studyId: string
  subjectNumber: string
  sessionId: string
  taskId: string
}

export interface GetStudyDataFileInfoRequest {
  studyId: string
  subjectNumber?: string
  sessionId?: string
  taskId?: string
  fileName: string
}

export interface GetStudyDataFileInfoListRequest {
  studyId: string
  subjectNumber?: string
  sessionId?: string
  taskId?: string
}

export interface AddStudyDataFileInfoRequest {
  studyId: string
  subjectNumber?: string
  sessionId?: string
  taskId?: string
  fileType: string
  fileName: string
  publicAccess: boolean
}

export interface SetSubjectStatusRequest {
  studyId: string
  subjectNumber: string
  status: SubjectStatus
}

export type GetSessionMetaInfoRequest = GetTaskInfoListRequest

export interface SubjectInfoResponse {
  studyId: string
  subjectId?: string
  subjectNumber: string
  status: SubjectStatus
  lastSyncTime?: string
  totalTaskCount?: number
  undoneTaskList?: {
    id: string
    type: string
    name: string
    time: string
  }[]
}

export interface SessionInfoResponse {
  studyId: string
  subjectNumber: string
  sessionId: string
}

export interface TaskInfoResponse {
  studyId: string
  subjectNumber: string
  sessionId: string
  taskId: string
}

export interface TrialInfoResponse {
  studyId: string
  subjectNumber: string
  sessionId: string
  taskId: string
  trialId: string
}

export interface AttachmentInfoResponse {
  studyId: string
  subjectNumber: string
  sessionId?: string
  taskId?: string
  trialId?: string
  attachments: FileInfoResponse[]
}

export interface RawDataInfoResponse {
  studyId: string
  subjectNumber: string
  sessionId: string
  taskId: string
  trialId: string
  rawDataList: FileInfoResponse[]
}

export interface FileInfoResponse {
  fullName: string
  name: string
  path: string
  size: number
  preview?: string
  createdAt: string
}

export interface StudyDataCountResponse {
  totalCount: number
}

export interface GetStudyDataResponse {
  presignedUrl: string
}

export interface GetSubjectDataResponse {
  presignedUrl: string
}

export interface MetaInfoResponse {
  metaInfo: string
}

export interface StudyDataFileInfoResponse {
  studyId: string
  subjectNumber: string
  sessionId: string
  taskId?: string
  trialId?: string
  fileType: StudyDataFileType
  filePath: string
  fileName: string
  fileSize: number
  filePreview?: string
  createdAt: string
}

export type SubjectInfoListResponse = SubjectInfoResponse[]

export type SessionInfoListResponse = SessionInfoResponse[]

export type TaskInfoListResponse = TaskInfoResponse[]

export type TrialInfoListResponse = TrialInfoResponse[]

export type StudyDataFileInfoListResponse = StudyDataFileInfoResponse[]

export interface GetStudyDataFileUploadUrlRequest {
  studyId: string
  subjectNumber?: string,
  sessionId?: string,
  taskId?: string,
  fileName: string
  publicAccess: boolean
}

export interface GetStudyDataFileUploadUrlResponse {
  presignedUrl: URL
  publicUrl: URL
  headers: object
}

export interface GetStudyDataRequest {
  studyId: string
  parentId: string
}

export interface StudyDataFolderResponse {
  id: string
  name: string
  studyId: string
  parentId: string
  type: string
}

export interface StudyDataFileResponse {
  id: string
  name: string
  studyId: string
  parentId: string
  type: string
  fileType: StudyDataFileType
  filePath: string
  fileSize: number
  filePreview?: string
  createdAt: string
}

export type StudyDataFoldersResponse = StudyDataFolderResponse[]

export type StudyDataFilesResponse = StudyDataFileResponse[]

export const ROOT_FOLDER_ID = "root"

export interface GetFileDownloadUrlsRequest {
  studyId: string
  filePaths: string[]
}

export interface GetZippedFileDownloadUrlsRequest {
  studyId: string
  subjectNumbers: string[]
}
