import educationListReducers from './educationList.slice';
import deleteEducationReducers from './deleteEducation.slice';
import educationEditorReducers from './education-editor/educationEditor.slice';
import publishEducationReducers from './education-editor/publishEducation.slice';

export default {
  ...educationListReducers,
  ...deleteEducationReducers,
  ...educationEditorReducers,
  ...publishEducationReducers,
};
