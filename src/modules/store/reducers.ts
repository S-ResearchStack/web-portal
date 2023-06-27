import { combineReducers } from '@reduxjs/toolkit';
import { connectRouter } from 'connected-react-router';
import type { Reducer } from 'redux';

import authReducer from 'src/modules/auth/auth.slice';
import studySettingsReducer from 'src/modules/study-settings/studySettings.slice';
import snackbarReducer from 'src/modules/snackbar/snackbar.slice';
import overviewReducers from 'src/modules/overview/overview.slice';
import studiesReducer from 'src/modules/studies/studies.slice';
import studyManagementReducer from 'src/modules/study-management/studyManagement.slice';
import dataCollectionReducer from 'src/modules/data-collection/dataCollection.slice';
import sidebarReducer from 'src/modules/main-layout/sidebar/sidebar.slice';
import fileUploadReducer from 'src/modules/file-upload/fileUpload.slice';
import { history } from 'src/modules/navigation/store';
import { DataSliceState } from 'src/modules/store/createDataSlice';
import forgotPasswordReducers from 'src/modules/auth/forgot-password/forgotPassword.slice';
import resetPasswordReducers from 'src/modules/auth/forgot-password/resetPassword.slice';
import objectStorageReducers from 'src/modules/object-storage/objectStorage.slice';

const createReducer = <T, V>(asyncReducers?: { [key: string]: Reducer<DataSliceState<T, V>> }) =>
  combineReducers({
    ...authReducer,
    router: connectRouter(history),
    snackbar: snackbarReducer,
    dataCollection: dataCollectionReducer,
    sidebar: sidebarReducer,
    ...studySettingsReducer,
    ...overviewReducers,
    ...studyManagementReducer,
    ...forgotPasswordReducers,
    ...resetPasswordReducers,
    ...fileUploadReducer,
    ...asyncReducers,
    ...objectStorageReducers,
    ...studiesReducer,
  });

export default createReducer;
