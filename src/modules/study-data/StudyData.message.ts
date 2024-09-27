import {StudyDataType} from "src/modules/study-data/studyData.enum";

export const FAILED_TO_GET_SUBJECT_INFO_LIST = 'Failed to get subjects.'
export const FAILED_TO_GET_SESSION_INFO_LIST = 'Failed to get sessions.'
export const FAILED_TO_GET_SESSION_DATA_LIST = 'Failed to get session data.'
export const FAILED_TO_GET_TASK_INFO_LIST = 'Failed to get tasks.'
export const FAILED_TO_GET_TASK_DATA_LIST = 'Failed to get task data.'
export const FAILED_TO_GET_RAW_DATA_INFO = 'Failed to get raw data info.'
export const FAILED_TO_CHANGE_SUBJECT_STATUS = 'Failed to change the subject status.'
export const FAILED_TO_GET_DOWNLOAD_URL = 'Failed to get the download url.'
export const FAILED_TO_UPLOAD_FILE = 'Failed to upload file'
export const FAILED_TO_CHECK_FILE_AVAILABILITY = 'Failed to check file duplication'

export const FAILED_TO_GET_META_INFO = (type: StudyDataType) =>
  `Failed to get ${type} meta info.`

export const FAILED_TO_GET_STUDY_DATA_FILE_INFO_LIST = (type: StudyDataType) =>
  `Failed to get ${type} file info list.`

export const SUBJECT_STATUS_CHANGED = (subjectNumber: string, status: string) =>
  `Status of subject ${subjectNumber} has been successfully changed to ${status}`
