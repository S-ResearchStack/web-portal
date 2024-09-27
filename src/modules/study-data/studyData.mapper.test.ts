import { transformStudyDataFileFromApi, 
  transformStudyDataFolderFromApi, 
  transformSubjectInfoFromApi } from './studyData.mapper';
import {
  StudyDataFileResponse,
  StudyDataFolderResponse, SubjectInfoResponse,
} from "src/modules/api/models";
import {SubjectInfo} from "src/modules/subject/studyManagement.slice";
import {StudyDataFile, StudyDataFolder} from "src/modules/study-data/studyData.slice";
import { StudyDataFileType } from './studyData.enum';
import { cleanup } from '@testing-library/react';
import { SubjectStatus } from './studyData.enum';

jest.mock("src/common/utils/file", ()=>({
  humanFileSize: jest.fn(() => '1 KB'),
}))

jest.mock("src/common/utils/datetime", ()=>({
  format: jest.fn(() => "Formatted date"),
}))

jest.mock("pako", ()=>({
  ungzip: jest.fn(() => Buffer.from('test mock ungzip', 'utf-8')),
  // ungzip mock returning Buffer object with utf-8 encoding of 'test mock ungzip'
  // so when it decoded, it will be 'test mock ungzip' string
}))

describe('studyData.mapper', () => {
  afterEach(() => {
    cleanup();
  })
  describe('transformStudyDataFolderFromApi', () => {
    it('should transform StudyDataFileResponse to StudyDataFolder', () => {
      const res: StudyDataFolderResponse = {
        id: 'folder-id',
        studyId: 'study-id',
        parentId: 'parent-id',
        name: 'folder-name',
        type: 'FOLDER'
      };
      const expectedResult: StudyDataFolder = {
        id: 'folder-id',
        studyId: 'study-id',
        parentId: 'parent-id',
        name: 'folder-name',
        studyDataType: 'FOLDER'
      };
      expect(transformStudyDataFolderFromApi(res)).toEqual(expectedResult);
    });
  });

  describe('transformStudyDataFileFromApi', () => {
    const mockStudyDataFileResponse: StudyDataFileResponse = {
      id: '123',
      studyId: '456',
      parentId: '789',
      name: 'example.txt',
      type: 'text',
      fileType: StudyDataFileType.RAW_DATA,
      filePath: '/path/to/example.txt',
      fileSize: 1024,
      filePreview: 'compressed_preview.zip',
      createdAt: new Date('2023-10-01T12:00:00.000Z').toString()
    };
    const expectedResult: StudyDataFile = {
      id: '123',
      studyId: '456',
      parentId: '789',
      name: 'example.txt',
      studyDataType: 'text',
      type: StudyDataFileType.RAW_DATA,
      path: '/path/to/example.txt',
      size: '1 KB',
      preview: 'test mock ungzip',
      createdAt: "Formatted date"
    };
    it('should transform StudyDataFileResponse to StudyDataFile', () => {
      const transformedData = transformStudyDataFileFromApi(mockStudyDataFileResponse)
      expect(transformedData).toEqual(expectedResult);
    });
    it('[NEGATIVE] should transform to StudyDataFile with empty data', () => {
      const transformedData = transformStudyDataFileFromApi({...mockStudyDataFileResponse, filePreview: ""})
      expect(transformedData).toEqual({...expectedResult, preview: ""});
    });
  });

  describe('transformSubjectInfoFromApi', () => {
    it('should transform SubjectInfoResponse to SubjectInfo', () => {
      const res: SubjectInfoResponse = {
        studyId: 'study-id',
        subjectNumber: 'subject-id',
        status: SubjectStatus.COMPLETED
      };
      const expectedResult: SubjectInfo = {
        studyId: 'study-id',
        subjectNumber: 'subject-id',
        status: SubjectStatus.COMPLETED
      };
      expect(transformSubjectInfoFromApi(res)).toEqual(expectedResult);
    });
  });
});
