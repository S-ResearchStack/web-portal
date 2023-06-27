import surveyListReducers from './user-management/task-management/survey/surveyList.slice';
import surveyPageReducers from './user-management/task-management/survey/surveyPage.slice';
import surveyEditorReducers from './user-management/task-management/survey/survey-editor/surveyEditor.slice';
import publishSurveyReducers from './user-management/task-management/publish-task/publishTask.slice';
import labVisitsReducers from './participant-management/lab-visit/labVisit.slice';
import skipLogicReducers from './user-management/task-management/survey/survey-editor/skip-logic/skipLogic.slice';
import activitiesListReducers from './user-management/task-management/activity/activitiesList.slice';
import educationListReducers from './user-management/education-management/educationList.slice';
import activityEditorReducers from './user-management/task-management/activity/activity-editor/activityEditor.slice';
import activityPageReducers from './user-management/task-management/activity/activityPage.slice';
import createActivityReducers from './user-management/task-management/activity/createActivityTask.slice';
import createEducationReducers from './user-management/education-management/createPublication.slice';
import educationEditorReducers from './user-management/education-management/education-editor/educationEditor.slice';
import publishEducationReducers from './user-management/education-management/education-editor/publishEducation.slice';
import participantTimezonesReducers from './user-management/common/participantTimezones.slice';

export * from './user-management/task-management/survey/surveyList.slice';

export default {
  ...surveyEditorReducers,
  ...publishSurveyReducers,
  ...surveyListReducers,
  ...surveyPageReducers,
  ...skipLogicReducers,
  ...labVisitsReducers,
  ...activitiesListReducers,
  ...createActivityReducers,
  ...activityEditorReducers,
  ...activityPageReducers,
  ...educationListReducers,
  ...createEducationReducers,
  ...educationEditorReducers,
  ...participantTimezonesReducers,
  ...publishEducationReducers,
};
