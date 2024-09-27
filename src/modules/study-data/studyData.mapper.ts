import {
  StudyDataFileResponse,
  StudyDataFolderResponse, SubjectInfoResponse,
} from "src/modules/api/models"

import {humanFileSize} from "src/common/utils/file";
import {format} from "src/common/utils/datetime";
import {ungzip} from "pako";
import {StudyDataFile, StudyDataFolder} from "src/modules/study-data/studyData.slice";
import {SubjectInfo} from "src/modules/subject/studyManagement.slice";

const unzipPreview = (data?: string): string | undefined => {
  if(!data) return data
  const gzipped = Buffer.from(data, 'base64')
  const unzipped = ungzip(gzipped)
  return new TextDecoder('utf8').decode(unzipped)
}

export const transformStudyDataFolderFromApi = (res: StudyDataFolderResponse): StudyDataFolder => ({
  id: res.id,
  studyId: res.studyId,
  parentId: res.parentId,
  name: res.name,
  studyDataType: res.type
})

export const transformStudyDataFileFromApi = (res: StudyDataFileResponse): StudyDataFile => ({
  id: res.id,
  studyId: res.studyId,
  parentId: res.parentId,
  name: res.name,
  studyDataType: res.type,
  type: res.fileType,
  path: res.filePath,
  size: humanFileSize(res.fileSize),
  preview: unzipPreview(res.filePreview),
  createdAt: format(res.createdAt, 'EEEE, MMM dd, yyyy')
})

export const transformSubjectInfoFromApi = (res: SubjectInfoResponse): SubjectInfo => ({
  studyId: res.studyId,
  subjectNumber: res.subjectNumber,
  status: res.status
})
