import surveyListReducers from './survey/surveyList.slice';
import surveyEditorReducers from './survey/survey-editor/surveyEditor.slice';
import publishSurveyReducers from './publish-task/publishTask.slice';
import activitiesListReducers from './activity/activitiesList.slice';
import activityEditorReducers from './activity/activity-editor/activityEditor.slice';

export default {
  ...surveyEditorReducers,
  ...publishSurveyReducers,
  ...surveyListReducers,
  ...activitiesListReducers,
  ...activityEditorReducers,
};
