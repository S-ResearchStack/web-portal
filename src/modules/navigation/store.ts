import { createSelector } from '@reduxjs/toolkit';
import { matchPath } from 'react-router-dom';
import { createBrowserHistory, createMemoryHistory, Location } from 'history';

import { RootState } from 'src/modules/store/store';
import { isInsideTest } from 'src/common/utils/testing';

export enum Path {
  Root = '/',

  Registration = '/registration',
  SignIn = '/signin',
  AccountCreate = '/account/create',

  CreateStudy = '/create-study',

  OverviewSubject = '/overview/participants/:subjectNumber',
  StudyManagement = '/study-management',
  StudyManagementSubject = '/study-management/participants/:subjectNumber',
  StudyManagementEditSurvey = '/study-management/surveys/:surveyId/edit',
  StudyManagementSurveyResults = '/study-management/surveys/:surveyId/results',
  StudyManagementActivityResults = '/study-management/activities/:activityId/results',

  Overview = '/overview',
  SubjectManagement = '/subject-management',
  StudyData = '/study-data',
  StudySettings = '/study-settings',
  LabVisitManagement = '/lab-visit',

  Dashboard = '/dashboard',
  CreateChart = '/dashboard/:dashboardId/chart/create',
  EditChart = '/dashboard/:dashboardId/chart/:chartId/edit',

  TaskManagement = '/task-management',
  CreateSurvey = '/task-management/survey/create',
  CreateActivity = '/task-management/activity/:activityType/create',
  EditActivity = '/task-management/activity/:activityId/edit',

  EducationalManagement = '/educational-management',
  CreateEducational = '/educational-management/:educationType/create',
  EditEducational = '/educational-management/:educationId/edit',
}

export const makeHistory = () =>
  !isInsideTest
    ? createBrowserHistory({ basename: process.env.PUBLIC_PATH })
    : createMemoryHistory();

export const history = makeHistory();

const sectionPaths = [
  Path.Overview,
  Path.Dashboard,
  Path.TaskManagement,
  Path.SubjectManagement,
  Path.StudyData,
  Path.EducationalManagement,
  Path.LabVisitManagement,
  Path.StudySettings
] as const;

export const sectionPathSelector = createSelector(
  (state: RootState) => state.router,
  (r) => sectionPaths.find((s) => matchPath((r.location as unknown as Location).pathname, s))
);
