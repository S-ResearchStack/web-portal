// Import the necessary modules and mocks
import {
  mockSubjectInfoListResponse,
  mockSessionInfoListResponses,
  mockTaskInfoListResponses,
  mockTrialInfoListResponse,
  mockMetaInfoResponse,
  mockAttachmentInfoResponse,
  mockRawDataInfoResponse,
} from './studyData.mock';

describe('Study mock Data Tests', () => {
  it('should contain correct data', () => {
    expect(mockSubjectInfoListResponse.length).toBe(10);
    expect(mockSessionInfoListResponses.length).toBe(12);
    expect(mockTaskInfoListResponses.length).toBe(4);
    expect(mockTrialInfoListResponse.length).toBe(4);
    expect(JSON.parse(mockMetaInfoResponse.metaInfo)).toBeTruthy();
    expect(mockAttachmentInfoResponse.attachments.length).toBe(2);
    mockAttachmentInfoResponse.attachments.forEach((attachment) => {
      expect(attachment.fullName).toBeTruthy();
      expect(attachment.name).toBeTruthy();
      expect(attachment.path).toBe('');
      expect(attachment.size).toBeGreaterThanOrEqual(0);
      expect(attachment.preview).toBeTruthy();
      expect(attachment.createdAt).toBeTruthy();
    });
    expect(mockRawDataInfoResponse.rawDataList.length).toBe(2);
    mockRawDataInfoResponse.rawDataList.forEach((rawData) => {
      expect(rawData.fullName).toBeTruthy();
      expect(rawData.name).toBeTruthy();
      expect(rawData.path).toBe('');
      expect(rawData.size).toBeGreaterThanOrEqual(0);
      expect(rawData.preview).toBeTruthy();
      expect(rawData.createdAt).toBeTruthy();
    });
  });
});
