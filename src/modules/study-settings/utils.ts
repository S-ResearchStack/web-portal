import type { StudyMember } from './studySettings.slice';

type IndicatorColor = 'success' | 'warning' | 'error' | 'info';

export const getStatusTextByStatusId = (id: StudyMember['status']): string => {
  switch (id) {
    case 'invited':
      return 'Invited';
    case 'active':
    default:
      return 'Active';
  }
};

export const getStatusTypeByStatusId = (id: StudyMember['status']): IndicatorColor => {
  switch (id) {
    case 'invited':
      return 'info';
    case 'active':
    default:
      return 'success';
  }
};

export const NEW_STUDY_QUERY_PARAM_NAME = 'newStudy';

export const MOCK_ACCOUNT_ID = 'admin-id';
