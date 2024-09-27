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
import { SurveyEditorState } from './surveyEditor.slice';

const surveyEditState: SurveyEditorState = {
  isLoading: false,
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
  jest.setTimeout(240000);

  let store: ReturnType<typeof createTestStore>;
  let history: ReturnType<typeof makeHistory>;

  beforeEach(() => {
    history = makeHistory();
    store = createTestStore(
      {
        studies: studiesState,
        'task/surveyEditor': { ...surveyEditState },
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
    await act(async () => render(getComponent()));

    // check question and type something
    const survey = await screen.findByTestId('editor');
    expect(survey).toBeInTheDocument();

    const publishButton = await screen.findByTestId('editor-header-publish');
    await act(async () => userEvent.click(publishButton));
    expect(screen.queryByTestId('publish-task')).toBeNull();

    const [title] = await survey.querySelectorAll('input');
    expect(title).toBeInTheDocument();
    await act(() => {
      userEvent.type(title, 'Survey title');
    });

    const question1 = await screen.findByTestId('question-1');
    const [question1Title] = question1.querySelectorAll('textarea');
    await act(() => {
      userEvent.type(question1Title, 'Question title');
    });

    const addQuestionButton = await screen.findByTestId('add-question-2');
    await act(async () => userEvent.click(addQuestionButton));

    const question2 = await screen.findByTestId('question-2');
    expect(question2).toBeInTheDocument();

    const [question2Title] = question2.querySelectorAll('textarea');
    await act(() => {
      userEvent.type(question2Title, 'Question title');
    });

    const copyQuestionButton = await screen.findByTestId('copy-question-1');
    await act(async () => userEvent.click(copyQuestionButton));

    const question3 = await screen.findByTestId('question-3');
    expect(question3).toBeInTheDocument();

    const deleteQuestionButton = await screen.findByTestId('delete-question-3');
    await act(async () => userEvent.click(deleteQuestionButton));

    await act(async () => userEvent.click(publishButton));

    expect(screen.queryByTestId('publish-task')).toBeInTheDocument();
  });

  it('should uodate question when change type', async () => {
    let renderResult: ReturnType<typeof render>;

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

    //dropdown
    const questionTypeDropdown = await screen.findByTestId('dropdown-question-type');
    expect(questionTypeDropdown).toBeInTheDocument();

    //Slider scale
    await userEvent.click(questionTypeDropdown);
    const sliderScaleOption = await screen.findByText('Slider scale');
    expect(sliderScaleOption).toBeInTheDocument();
    await userEvent.click(sliderScaleOption);
    const numberInput = await screen.findAllByTestId('number-input');
    const minNumberInput = numberInput[0];
    const maxNumberInput = numberInput[1];
    await userEvent.clear(minNumberInput);
    await userEvent.type(minNumberInput, '2');
    await userEvent.clear(maxNumberInput);
    await userEvent.type(maxNumberInput, '9');

    const labelInput = await screen.findAllByTestId('label-input');
    const minLabelInput = labelInput[0];
    const maxLabelInput = labelInput[1];
    await userEvent.clear(minLabelInput);
    await userEvent.type(minLabelInput, 'Min');
    await userEvent.clear(maxLabelInput);
    await userEvent.type(maxLabelInput, 'Max');
  });

  it('should show modal to confirm delete question', async () => {
    let renderResult: ReturnType<typeof render>;

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

    const addQuestionButton = await screen.findByTestId('add-question-2');
    await act(async () => userEvent.click(addQuestionButton));

    const questionTitle2 = await screen.findByTestId('question-title-2');
    expect(questionTitle2).toBeInTheDocument();
    await userEvent.type(questionTitle2, 'Question Title 2');

    const deleteQuestionButton = await screen.findByTestId('delete-question-2');
    await act(async () => userEvent.click(deleteQuestionButton));
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
