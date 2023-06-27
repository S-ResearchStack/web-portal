import { createSelector } from '@reduxjs/toolkit';
import { matchPath } from 'react-router-dom';
import { createBrowserHistory, createMemoryHistory, Location } from 'history';

import { RootState } from 'src/modules/store/store';
import { isInsideTest } from 'src/common/utils/testing';

export enum Path {
  Root = '/',

  SignIn = '/signin',

  // user invited by other user via email
  AccountActivation = '/account-activation',

  // sign up by user
  AccountCreate = '/account/create',
  AccountConfirm = '/account/confirm',
  AccountVerification = '/email-verification',

  // forgot password
  ForgotPassword = '/account/forgot',
  ForgotPasswordConfirm = '/account/forgot/confirm',
  ResetPassword = '/password-reset',
  ResetPasswordComplete = '/account/forgot/complete',

  CreateStudy = '/create-study',

  Overview = '/overview',
  OverviewSubject = '/overview/participants/:subjectId',
  StudyManagement = '/study-management',
  StudyManagementSubject = '/study-management/participants/:subjectId',
  StudyManagementEditSurvey = '/study-management/surveys/:surveyId/edit',
  StudyManagementEditActivity = '/study-management/activity/:activityId/edit',
  StudyManagementEditEducation = '/study-management/education/:educationId/edit',
  StudyManagementSurveyResults = '/study-management/surveys/:surveyId/results',
  StudyManagementActivityResults = '/study-management/activities/:activityId/results',
  UserAnalytics = '/user-analytics',
  DataCollection = '/data-collection',
  DataCollectionSubject = '/data-collection/participants/:subjectId',
  StudySettings = '/study-settings',
}

export const makeHistory = () =>
  !isInsideTest
    ? createBrowserHistory({ basename: process.env.PUBLIC_PATH })
    : createMemoryHistory();

export const history = makeHistory();

const sectionPaths = [
  Path.Overview,
  Path.OverviewSubject,
  Path.StudyManagement,
  Path.UserAnalytics,
  Path.DataCollection,
  Path.StudySettings,
] as const;

export const sectionPathSelector = createSelector(
  (state: RootState) => state.router,
  (r) => sectionPaths.find((s) => matchPath((r.location as unknown as Location).pathname, s))
);
