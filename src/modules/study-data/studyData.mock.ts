import {
  AttachmentInfoResponse,
  MetaInfoResponse,
  RawDataInfoResponse,
  SessionInfoListResponse,
  SubjectInfoListResponse,
  TaskInfoListResponse,
  TrialInfoListResponse,
} from "src/modules/api"
import {SubjectStatus} from "src/modules/study-data/studyData.enum";

export const mockSubjectInfoListResponse: SubjectInfoListResponse = [
  {
    subjectNumber: 'Subject A',
    studyId: 'mentalCareStudy',
    status: SubjectStatus.PARTICIPATING
  },
  {
    subjectNumber: 'Subject B',
    studyId: 'mentalCareStudy',
    status: SubjectStatus.PARTICIPATING
  },
  {
    subjectNumber: 'Subject C',
    studyId: 'mentalCareStudy',
    status: SubjectStatus.PARTICIPATING
  },
  {
    subjectNumber: 'Subject D',
    studyId: 'mentalCareStudy',
    status: SubjectStatus.PARTICIPATING
  },
  {
    subjectNumber: 'Subject E',
    studyId: 'mentalCareStudy',
    status: SubjectStatus.PARTICIPATING
  },
  {
    subjectNumber: 'Subject A',
    studyId: 'mentalCareStudy',
    status: SubjectStatus.PARTICIPATING
  },
  {
    subjectNumber: 'Subject B',
    studyId: 'mentalCareStudy',
    status: SubjectStatus.PARTICIPATING
  },
  {
    subjectNumber: 'Subject C',
    studyId: 'mentalCareStudy',
    status: SubjectStatus.PARTICIPATING
  },
  {
    subjectNumber: 'Subject D',
    studyId: 'mentalCareStudy',
    status: SubjectStatus.PARTICIPATING
  },
  {
    subjectNumber: 'Subject E',
    studyId: 'mentalCareStudy',
    status: SubjectStatus.PARTICIPATING
  },
]

export const mockSessionInfoListResponses: SessionInfoListResponse = [
  {
    sessionId: 'Session A',
    studyId: 'mentalCareStudy',
    subjectNumber: 'Subject A'
  },
  {
    sessionId: 'Session B',
    studyId: 'mentalCareStudy',
    subjectNumber: 'Subject A'
  },
  {
    sessionId: 'Session C',
    studyId: 'mentalCareStudy',
    subjectNumber: 'Subject A'
  },
  {
    sessionId: 'Session D',
    studyId: 'mentalCareStudy',
    subjectNumber: 'Subject A'
  },
  {
    sessionId: 'Session A',
    studyId: 'mentalCareStudy',
    subjectNumber: 'Subject A'
  },
  {
    sessionId: 'Session B',
    studyId: 'mentalCareStudy',
    subjectNumber: 'Subject A'
  },
  {
    sessionId: 'Session C',
    studyId: 'mentalCareStudy',
    subjectNumber: 'Subject A'
  },
  {
    sessionId: 'Session D',
    studyId: 'mentalCareStudy',
    subjectNumber: 'Subject A'
  },
  {
    sessionId: 'Session A',
    studyId: 'mentalCareStudy',
    subjectNumber: 'Subject A'
  },
  {
    sessionId: 'Session B',
    studyId: 'mentalCareStudy',
    subjectNumber: 'Subject A'
  },
  {
    sessionId: 'Session C',
    studyId: 'mentalCareStudy',
    subjectNumber: 'Subject A'
  },
  {
    sessionId: 'Session D',
    studyId: 'mentalCareStudy',
    subjectNumber: 'Subject A'
  },
]

export const mockTaskInfoListResponses: TaskInfoListResponse = [
  {
    sessionId: 'Session A',
    studyId: 'mentalCareStudy',
    subjectNumber: 'Subject A',
    taskId: 'Task A'
  },
  {
    sessionId: 'Session B',
    studyId: 'mentalCareStudy',
    subjectNumber: 'Subject A',
    taskId: 'Task B'
  },
  {
    sessionId: 'Session C',
    studyId: 'mentalCareStudy',
    subjectNumber: 'Subject A',
    taskId: 'Task C'
  },
  {
    sessionId: 'Session D',
    studyId: 'mentalCareStudy',
    subjectNumber: 'Subject A',
    taskId: 'Task D'
  },
]

export const mockTrialInfoListResponse: TrialInfoListResponse = [
  {
    trialId: 'Trial A',
    sessionId: 'Session A',
    studyId: 'mentalCareStudy',
    subjectNumber: 'Subject A',
    taskId: 'Task A'
  },
  {
    trialId: 'Trial B',
    sessionId: 'Session B',
    studyId: 'mentalCareStudy',
    subjectNumber: 'Subject A',
    taskId: 'Task A'
  },
  {
    trialId: 'Trial C',
    sessionId: 'Session C',
    studyId: 'mentalCareStudy',
    subjectNumber: 'Subject A',
    taskId: 'Task A'
  },
  {
    trialId: 'Trial D',
    sessionId: 'Session D',
    studyId: 'mentalCareStudy',
    subjectNumber: 'Subject A',
    taskId: 'Task A'
  },
]

export const mockMetaInfoResponse: MetaInfoResponse = {
  metaInfo: '{"DeviceInfo":{"ModelName":"SM-R865U","DeviceID":"SC2M","BattLevel":"100"},"SWInfo":{"Binary":"R965USQE1AWF5","SystemMCU":"SLSI23060801","SystemBIN":"SLSI23060801","WatchECGApp":"1.2.5","PhoneApp":"1.2.21"},"TrialInfo":{"StudyID":"AFH01","Subject#":"5","DataID":"WatchECGRAW","Start_UTC_ms":"1688093725501","Date":"20230630_115525","Timezone":"9","Sequence#":"0"},"SaveInfo":{"LocalPath":"/RAW_DATA/","Folder":"ECG_AFH01-00005-WatchECGRAW_1688093725501_20230630_115525"},"AlgorithmInfo":{"AlgorithmName":"MnbECG","Version":"5.9.4","Result":"Afib","meanHR":"104.65"}}'
}

export const mockAttachmentInfoResponse: AttachmentInfoResponse = {
  sessionId: 'Session A',
  studyId: 'mentalCareStudy',
  subjectNumber: 'Subject A',
  taskId: 'Task A',
  trialId: 'Trial A',
  attachments: [
    {
      fullName: "RawData_A.test",
      name: "File_A.test",
      path: "",
      size: 100,
      preview: "test",
      createdAt: "2023-09-10T15:00:00Z"
    },
    {
      fullName: "RawData_A.test",
      name: "File_B.test",
      path: "",
      size: 100,
      preview: "test",
      createdAt: "2023-09-10T15:00:00Z"
    }
  ]
}

export const mockRawDataInfoResponse: RawDataInfoResponse = {
  sessionId: 'Session A',
  studyId: 'mentalCareStudy',
  subjectNumber: 'Subject A',
  taskId: 'Task A',
  trialId: 'Trial A',
  rawDataList: [
    {
      fullName: "RawData_A.test",
      name: "RawData_A.test",
      path: "",
      size: 100,
      preview: "test",
      createdAt: "2023-09-10T15:00:00Z"
    },
    {
      fullName: "RawData_A.test",
      name: "RawData_B.test",
      path: "",
      size: 100,
      preview: "test",
      createdAt: "2023-09-10T15:00:00Z"
    }
  ]
}
