import autoRefreshReducers from './autoRefresh.slice';
import dashboardListReducers from './dashboardList.slice';
import chartListReducers from './chart-list/chartList.slice';
import chartEditorReducers from './chart-editor/chartEditor.slice';
import sourceModalReducers from './chart-editor/sourceModal.slice';

import './dashboard.mock';

export default {
  ...chartListReducers,
  ...chartEditorReducers,
  ...sourceModalReducers,
  ...autoRefreshReducers,
  ...dashboardListReducers,
};
