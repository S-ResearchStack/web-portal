import { StudyMember } from './studySettings.slice';

export type IndicatorColor = 'success' | 'warning' | 'error' | 'info';

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

export const getRoleTextByRoleId = (id: StudyMember['role']): string => {
  switch (id) {
    case 'team-admin':
      return 'Team Admin';
    case 'project-owner':
      return 'Project Owner';
    case 'researcher':
    default:
      return 'Researcher';
  }
};
