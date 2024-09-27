export enum SubjectStatus {
  IDLE= "IDLE",
  PARTICIPATING = "PARTICIPATING",
  WITHDRAWN = "WITHDRAWN",
  DROP = "DROP",
  COMPLETED = "COMPLETED"
}

export enum StudyDataType {
  UNSPECIFIED = "UNSPECIFIED",
  FOLDER = "FOLDER",
  FILE = "FILE"
}

export enum StudyDataFileType {
  UNSPECIFIED = "UNSPECIFIED",
  RAW_DATA = "RAW_DATA",
  ATTACHMENT = "ATTACHMENT",
  META_INFO = "META_INFO",
  MESSAGE_LOG = "MESSAGE_LOG"
}

export enum StudyDataFileExt {
  RAW_DATA = "dutraw",
  META_INFO = "metainfo",
  MESSAGE_LOG = "messagelog"
}

// for study data only?
export enum FileCheckStatus {
  UNSPECIFIED = "Unspecified",
  READY = "Ready",
  CHECKING = "Checking",
  DUPLICATED = "Duplicated",
  SIZE_EXCEEDED = "SizeExceeded",
  UNSUPPORTED = "Unsupported",
  AVAILABLE = "Available",
  CHECK_FAILED = "Failed"
}

export enum FileUploadStatus {
  UNSPECIFIED = "Unspecified",
  READY = "Ready",
  UPLOADING = "Uploading",
  FINISHED = "Finished",
  FAILED = "Failed",
}

export type StudyFileType = Extract<StudyDataFileType, StudyDataFileType.RAW_DATA | StudyDataFileType.ATTACHMENT>

