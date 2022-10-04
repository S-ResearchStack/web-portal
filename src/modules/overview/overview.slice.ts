import overviewSubjectReducers from 'src/modules/overview/overview-subject/overviewSubject.slice';
import participantListReducers from './participantsList.slice';
import surveyResponsesReducers from './surveyResponses.slice';
import eligibilityQualificationsReducers from './eligibilityQualifications.slice';
import avgRestingHrOverDayReducers from './avgRestingHrOverDay.slice';
import avgRestingHrWithAgeReducers from './avgRestingHrWithAge.slice';
import avgStepCountReducers from './avgStepCount.slice';
import avgHeartRateFluctuationsReducers from './avgHeartRateFluctuations.slice';

export * from './participantsList.slice';
export * from './surveyResponses.slice';
export * from './eligibilityQualifications.slice';
export * from './avgRestingHrOverDay.slice';
export * from './avgRestingHrWithAge.slice';
export * from './avgStepCount.slice';
export * from './avgHeartRateFluctuations.slice';

export default {
  ...overviewSubjectReducers,
  ...surveyResponsesReducers,
  ...eligibilityQualificationsReducers,
  ...avgRestingHrOverDayReducers,
  ...avgRestingHrWithAgeReducers,
  ...avgStepCountReducers,
  ...avgHeartRateFluctuationsReducers,
  ...participantListReducers,
};
