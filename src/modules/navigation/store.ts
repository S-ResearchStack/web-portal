import { createSelector } from '@reduxjs/toolkit';
import { matchPath } from 'react-router-dom';
import { createBrowserHistory, createMemoryHistory, Location } from 'history';

import { RootState } from 'src/modules/store/store';

export enum Path {
  Root = '/',

  SignIn = '/signin',
  AccountActivation = '/account/activation',
  AccountCreate = '/account/create',
  AccountConfirm = '/account/confirm',
  AccountVerification = '/email-verification',
  CreateStudy = '/create-study',

  Overview = '/overview',
  OverviewSubject = '/overview/participants/:subjectId',
  TrialManagement = '/trial-management',
  TrialManagementSubject = '/trial-management/participants/:subjectId',
  TrialManagementEditSurvey = '/trial-management/surveys/:surveyId/edit',
  TrialManagementSurveyResults = '/trial-management/surveys/:surveyId/results',
  UserAnalytics = '/user-analytics',
  DataCollection = '/data-collection',
  DataCollectionSubject = '/data-collection/participants/:subjectId',
  StudySettings = '/study-settings',
}

export type LocationState = {
  from: Location;
};

export const makeHistory = () =>
  process.env.NODE_ENV !== 'test'
    ? createBrowserHistory({ basename: process.env.PUBLIC_PATH })
    : createMemoryHistory();

export const history = makeHistory();

const sectionPaths = [
  Path.Overview,
  Path.OverviewSubject,
  Path.TrialManagement,
  Path.UserAnalytics,
  Path.DataCollection,
  Path.StudySettings,
] as const;

export const sectionPathSelector = createSelector(
  (state: RootState) => state.router,
  (r) => sectionPaths.find((s) => matchPath((r.location as unknown as Location).pathname, s))
);
