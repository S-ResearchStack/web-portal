import { combineReducers } from '@reduxjs/toolkit';
import { connectRouter } from 'connected-react-router';
import type { Reducer } from 'redux';

import authReducer from 'src/modules/auth/auth.slice';
import studySettingsReducer from 'src/modules/study-settings/studySettings.slice';
import snackbarReducer from 'src/modules/snackbar/snackbar.slice';
import dashboardReducers from 'src/modules/dashboard/dashboard.slice';
import overviewReducers from 'src/modules/overview/overview.slice';
import studiesReducer from 'src/modules/studies/studies.slice';
import studyManagementReducer from 'src/modules/subject/studyManagement.slice';
import educationManagementReducer from 'src/modules/education-management/educationManagement.slice';
import taskManagementReducer from 'src/modules/task-management/taskManagement.slice';
import labVisitsReducers from 'src/modules/lab-visit/labVisit.slice';
import sidebarReducer from 'src/modules/main-layout/sidebar/sidebar.slice';
import fileUploadReducer from 'src/modules/file-upload/fileUpload.slice';
import { history } from 'src/modules/navigation/store';
import { DataSliceState } from 'src/modules/store/createDataSlice';
import studyDataReducer from 'src/modules/study-data/studyData.slice';
import studyRequirementReducer from "src/modules/studies/ParticipationRequirement.slice"
import participantTimezonesReducers from '../common/participantTimezones.slice';

const createReducer = <T, V>(asyncReducers?: { [key: string]: Reducer<DataSliceState<T, V>> }) =>
  combineReducers({
    ...authReducer,
    router: connectRouter(history),
    snackbar: snackbarReducer,
    sidebar: sidebarReducer,
    ...studySettingsReducer,
    ...dashboardReducers,
    ...overviewReducers,
    ...studyManagementReducer,
    ...educationManagementReducer,
    ...taskManagementReducer,
    ...labVisitsReducers,
    ...fileUploadReducer,
    ...asyncReducers,
    ...studiesReducer,
    ...studyDataReducer,
    ...studyRequirementReducer,
    ...participantTimezonesReducers
  });

export default createReducer;
