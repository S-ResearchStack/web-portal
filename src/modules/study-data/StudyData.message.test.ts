import { FAILED_TO_GET_META_INFO, 
  FAILED_TO_GET_STUDY_DATA_FILE_INFO_LIST, 
  SUBJECT_STATUS_CHANGED 
} from "./StudyData.message";
import {StudyDataType} from "src/modules/study-data/studyData.enum";

describe('StudyData message', () => {
  it('[NEGATIVE] should return correct message for FAILED_TO_GET_META_INFO', () => {
    expect(FAILED_TO_GET_META_INFO(StudyDataType.FILE)).toBe("Failed to get FILE meta info.");
  })
  it('should return correct message for FAILED_TO_GET_STUDY_DATA_FILE_INFO_LIST', () => {
    expect(FAILED_TO_GET_STUDY_DATA_FILE_INFO_LIST(StudyDataType.FILE)).
    toBe("Failed to get FILE file info list.");
  })
  it('should return correct message for SUBJECT_STATUS_CHANGED', () => {
    expect(SUBJECT_STATUS_CHANGED("test_subject", "test_status")).
    toBe("Status of subject test_subject has been successfully changed to test_status");
  })
})
