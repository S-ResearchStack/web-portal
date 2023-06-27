import React from 'react';
import { Provider } from 'react-redux';
import { TouchBackend } from 'react-dnd-touch-backend';
import { DndProvider } from 'react-dnd';
import { act, render, screen } from '@testing-library/react';
import { ConnectedRouter } from 'connected-react-router';

import { ThemeProvider } from 'styled-components';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import { makeHistory } from 'src/modules/navigation/store';
import theme from 'src/styles/theme';
import { userEvent } from '@storybook/testing-library';
import { createTestStore } from 'src/modules/store/testing';
import { StudiesState } from 'src/modules/studies/studies.slice';
import SurveyEditor from './SurveyEditor';
import { surveyEditorSlice, SurveyEditorState, SurveyItem } from './surveyEditor.slice';

const surveyEditState: SurveyEditorState = {
  isSaving: false,
  isLoading: false,
  isCreating: false,
  survey: {
    studyId: 'test',
    id: 'test',
    revisionId: 0,
    title: 'test',
    description: 'test',
    questions: [
      {
        id: 'section-id',
        title: '',
        children: [
          {
            id: 'test-single',
            type: 'single',
            title: 'test-single',
            description: '',
            options: {
              includeOther: false,
              optional: true,
            },
            answers: [
              {
                id: '1',
                value: '1',
              },
              {
                id: '2',
                value: '2',
              },
            ],
          },
          {
            id: 'test-multiple',
            type: 'multiple',
            title: 'test-multiple',
            description: '',
            options: {
              includeOther: false,
              optional: true,
            },
            answers: [
              {
                id: '1',
                value: '1',
              },
              {
                id: '2',
                value: '2',
              },
            ],
          },
          {
            id: 'test-slider',
            type: 'slider',
            title: 'test-slider',
            description: '',
            options: {
              optional: true,
            },
            answers: [
              {
                id: 'low',
                label: 'low',
                value: 1,
              },
              {
                id: 'high',
                label: 'high',
                value: 10,
              },
            ],
          },
        ],
      },
    ],
  },
};

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

describe('SurveyEditor', () => {
  jest.setTimeout(60000);

  let store: ReturnType<typeof createTestStore>;
  let history: ReturnType<typeof makeHistory>;

  beforeEach(() => {
    history = makeHistory();
    store = createTestStore(
      {
        studies: studiesState,
        'survey/edit': { ...surveyEditState },
      },
      history
    );
  });

  it('should render', async () => {
    const getComponent = () => (
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          <ConnectedRouter history={history}>
            <DndProvider backend={TouchBackend} options={{ enableMouseEvents: true }}>
              <SurveyEditor />
            </DndProvider>
          </ConnectedRouter>
        </Provider>
      </ThemeProvider>
    );
    const renderResult = await act(async () => render(getComponent()));

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const { rerender } = renderResult;

    // check question and type something
    const question = await screen.findByTestId('question-test-single');
    expect(question).toBeInTheDocument();
    const [title, description, addOption] = question.querySelectorAll('textarea');
    expect(title).toBeInTheDocument();
    expect(description).toBeInTheDocument();
    expect(addOption).toBeInTheDocument();
    await act(() => {
      userEvent.type(title, 'new title');
      userEvent.type(description, 'new description');
      userEvent.type(addOption, 'new option');
    });

    // set errors and try to publish
    store.dispatch(
      surveyEditorSlice.actions.setSurvey({
        ...surveyEditState.survey,
        title: '',
      } as SurveyItem)
    );
    await act(async () => rerender(getComponent()));
    await act(async () => userEvent.click(await screen.findByTestId('editor-header-publish')));
    expect(screen.queryByTestId('publish-survey')).toBeNull();

    // open preview
    expect(screen.queryByTestId('preview')).toBeNull();
    userEvent.click(await screen.findByTestId('editor-header-preview'));
    expect(screen.queryByTestId('preview')).not.toBeNull();
    expect(screen.queryByTestId('editor-header-preview')).toBeNull();

    // clear errors and publish
    store.dispatch(
      surveyEditorSlice.actions.setSurvey({
        ...surveyEditState.survey,
      } as SurveyItem)
    );
    await act(async () => rerender(getComponent()));

    expect(screen.queryByTestId('publish-survey')).toBeNull();
    await act(async () => userEvent.click(await screen.findByTestId('editor-header-publish')));
    expect(screen.queryByTestId('publish-survey')).not.toBeNull();
  });

  it('[NEGATIVE] should render with empty store', async () => {
    let renderResult: ReturnType<typeof render>;
    store = createTestStore({}, history);

    await act(async () => {
      renderResult = render(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <DndProvider backend={TouchBackend} options={{ enableMouseEvents: true }}>
                <SurveyEditor />
              </DndProvider>
            </ConnectedRouter>
          </Provider>
        </ThemeProvider>
      );
    });

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const { baseElement } = renderResult;
    expect(baseElement).toBeInTheDocument();
  });
});
