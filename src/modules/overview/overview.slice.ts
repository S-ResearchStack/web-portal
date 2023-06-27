import overviewSubjectReducers from 'src/modules/overview/overview-subject/overviewSubject.slice';
import participantListReducers from './participantsList.slice';
import avgRestingHrOverDayReducers from './avgRestingHrOverDay.slice';
import avgRestingHrWithAgeReducers from './avgRestingHrWithAge.slice';
import studyProgressReducers from './studyProgress.slice';
import participantDropoutReducers from './participantDropout.slice';
import participantEnrollmentReducers from './participantEnrollment.slice';
import taskListReducers from './taskCompliance.slice';

export * from './participantsList.slice';
export * from './avgRestingHrOverDay.slice';
export * from './avgRestingHrWithAge.slice';
export * from './studyProgress.slice';
export * from './participantDropout.slice';
export * from './participantEnrollment.slice';
export * from './taskCompliance.slice';

export default {
  ...overviewSubjectReducers,
  ...avgRestingHrOverDayReducers,
  ...avgRestingHrWithAgeReducers,
  ...participantListReducers,
  ...studyProgressReducers,
  ...participantDropoutReducers,
  ...participantEnrollmentReducers,
  ...taskListReducers,
};
