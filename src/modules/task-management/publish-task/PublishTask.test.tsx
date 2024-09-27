import React from 'react';
import { Provider } from 'react-redux';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import { history } from 'src/modules/navigation/store';
import { ConnectedRouter } from 'connected-react-router';
import { act, render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@storybook/testing-library';

import { createTestStore } from 'src/modules/store/testing';
import theme from 'src/styles/theme';
import { ThemeProvider } from 'styled-components/';
import { StudiesState } from 'src/modules/studies/studies.slice';
import { SurveyEditorState } from '../survey/survey-editor/surveyEditor.slice';
import { publishTaskSelector } from './publishTask.slice';
import PublishTask from './PublishTask';

const studiesState: StudiesState = {
  isLoading: false,
  studies: [
    {
      id: 'test',
      name: 'test',
      color: 'primary',
      createdAt: 1652648400000,
    },
  ],
  selectedStudyId: 'test',
};

const surveyEditState: SurveyEditorState = {
  isLoading: false,
  data: {
    studyId: 'test',
    id: '1',
    title: 'test-title',
    description: 'test-description',
    questions: [
      {
        id: 'category-id',
        title: '',
        children: [
          {
            id: 'id',
            title: 'test-title',
            type: 'single',
            description: 'test-description',
            options: {
              optional: true,
              includeOther: false,
            },
            answers: [
              { id: 'survey_question2', value: 'Option 1' },
              { id: 'survey_question3', value: 'Option 2' },
            ],
          },
        ],
      },
    ],
  }
};

describe('PublishTask', () => {
  it('should render by type survey', async () => {
    const onClose = jest.fn();

    const store = createTestStore({
      'studies': studiesState,
      'task/surveyEditor': { ...surveyEditState },
    });

    await act(() => {
      render(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <PublishTask type="survey" open onClose={onClose} />
            </ConnectedRouter>
          </Provider>
        </ThemeProvider>
      );
    });

    expect(await screen.getByText('Publish Survey')).toBeInTheDocument();

    const publishButton = await screen.findByTestId('publish-task-publish');
    const schedule = await screen.findByTestId('schedule-dropdown');
    const validDuration = await screen.findByTestId('valid-duration-dropdown');

    await act(async () => {
      await userEvent.click(schedule);
    });

    const scheduleItems = await screen.getAllByTestId('menu-item');
    expect(scheduleItems.length).toBe(4);

    await userEvent.click(scheduleItems[3]);
    await userEvent.click(scheduleItems[2]);
    await userEvent.click(scheduleItems[1]);

    await act(async () => {
      await userEvent.click(validDuration);
    });

    const validDurationItems = await screen.getAllByTestId('menu-item');
    expect(validDurationItems.length).toBe(5);

    await userEvent.click(validDurationItems[4]);
    await userEvent.click(validDurationItems[3]);
    await userEvent.click(validDurationItems[2]);
    await userEvent.click(validDurationItems[1]);

    await act(() => {
      userEvent.click(publishButton);
    });

    await waitFor(() => publishTaskSelector(store.getState()).isSending);
    await waitFor(() => !publishTaskSelector(store.getState()).isSending);

    expect(onClose).toHaveBeenCalled();
  });

  it('should render by type activity', async () => {
    const onClose = jest.fn();

    const store = createTestStore({
      'studies': studiesState,
    });

    await act(() => {
      render(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <PublishTask type="activity" open onClose={onClose} />
            </ConnectedRouter>
          </Provider>
        </ThemeProvider>
      );
    });

    expect(await screen.getByText('Publish Activity Task')).toBeInTheDocument();

    const cancelhButton = await screen.findByTestId('publish-task-cancel');
    userEvent.click(cancelhButton);

    expect(onClose).toHaveBeenCalled();
  });
});
