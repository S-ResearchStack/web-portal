import surveyListReducers from './surveyList.slice';
import surveyPageReducers from './surveyPage.slice';
import surveyEditorReducers from './survey-editor/surveyEditor.slice';
import publishSurveyReducers from './survey-editor/publish-survey/publishSurvey.slice';

export * from './surveyList.slice';

export default {
  ...surveyEditorReducers,
  ...publishSurveyReducers,
  ...surveyListReducers,
  ...surveyPageReducers,
};
