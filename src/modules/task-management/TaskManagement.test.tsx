import React from 'react';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';

import { ThemeProvider } from 'styled-components';
import 'jest-styled-components';
import '@testing-library/jest-dom';
import theme from 'src/styles/theme';
import { history } from 'src/modules/navigation/store';
import { act, render, screen } from '@testing-library/react';
import { userEvent } from '@storybook/testing-library';
import { createTestStore } from 'src/modules/store/testing';
import TaskManagement from './TaskManagement';
import { BaseTaskStatus } from 'src/modules/api';

describe('TaskManagement', () => {
  it('[NEGATIVE] should render empty survey', async () => {
    const store = createTestStore({
      'task/surveyList': {
        isLoading: false,
        fetchArgs: null,
        prevFetchArgs: null,
        data: {
          drafts: [],
          published: [],
        },
      },
      'task/activitiesList': {
        isLoading: false,
        fetchArgs: null,
        prevFetchArgs: null,
        data: {
          drafts: [],
          published: [],
        },
      },
    });

    await act(() => {
      render(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <TaskManagement />
            </ConnectedRouter>
          </Provider>
        </ThemeProvider>
      );
    });

    expect(await screen.findByTestId('task-management')).toBeInTheDocument();

    expect(await screen.getByText('No surveys yet')).toBeInTheDocument();
  });

  it('should render', async () => {
    const store = createTestStore({
      'task/surveyList': {
        isLoading: false,
        fetchArgs: null,
        prevFetchArgs: null,
        data: {
          drafts: [
            {
              id: 'test-draft',
              title: 'test',
              description: 'test',
              status: BaseTaskStatus.CREATED,
              totalParticipants: 100,
              respondedParticipants: 0,
              modifiedAt: 0,
            },
          ],
          published: [
            {
              id: 'test-published',
              title: 'test',
              description: 'test',
              status: BaseTaskStatus.PUBLISHED,
              totalParticipants: 100,
              respondedParticipants: 50,
              modifiedAt: 0,
            },
          ],
        },
      },
      'task/activitiesList': {
        isLoading: false,
        fetchArgs: null,
        prevFetchArgs: null,
        data: {
          drafts: [
            {
              id: 'test-draft',
              title: 'test',
              description: 'test',
              status: BaseTaskStatus.CREATED,
              type: 'GAIT_AND_BALANCE',
              group: 'MOTOR',
              totalParticipants: 100,
              respondedParticipants: 0,
              modifiedAt: 0,
            },
          ],
          published: [
            {
              id: 'test-published',
              title: 'test',
              description: 'test',
              status: BaseTaskStatus.PUBLISHED,
              type: 'WALK_TEST',
              group: 'FITNESS',
              totalParticipants: 100,
              respondedParticipants: 50,
              modifiedAt: 0,
            },
          ],
        },
      },
    });

    await act(() => {
      render(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <TaskManagement />
            </ConnectedRouter>
          </Provider>
        </ThemeProvider>
      );
    });

    expect(await screen.findByTestId('task-management')).toBeInTheDocument();

    const createSurveyButton = await screen.getByText('Create Survey');
    expect(createSurveyButton).toBeInTheDocument();

    const tabs = await screen.findAllByTestId('tab');
    expect(tabs).toHaveLength(2);

    await act(() => {
      userEvent.click(tabs[1]);
    });

    const createActivityButton = await screen.getByText('Create Activity');
    expect(createActivityButton).toBeInTheDocument();

    await act(() => {
      userEvent.click(createActivityButton);
    });

    expect(await screen.getByText('Select an activity template to start with.')).toBeInTheDocument();
  });

  it('[NEGATIVE] should render empty activity', async () => {
    const store = createTestStore({
      'task/surveyList': {
        isLoading: false,
        fetchArgs: null,
        prevFetchArgs: null,
        data: {
          drafts: [],
          published: [],
        },
      },
      'task/activitiesList': {
        isLoading: false,
        fetchArgs: null,
        prevFetchArgs: null,
        data: {
          drafts: [],
          published: [],
        },
      },
    });

    await act(() => {
      render(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <TaskManagement />
            </ConnectedRouter>
          </Provider>
        </ThemeProvider>
      );
    });

    expect(await screen.findByTestId('task-management')).toBeInTheDocument();

    const tabs = await screen.findAllByTestId('tab');
    await act(() => {
      userEvent.click(tabs[1]);
    });

    expect(await screen.getByText('No activity tasks yet')).toBeInTheDocument();
  });
});
