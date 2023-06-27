import React from 'react';
import { Provider } from 'react-redux';

import 'jest-styled-components';
import { act, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from 'styled-components';
import { ConnectedRouter } from 'connected-react-router';

import theme from 'src/styles/theme';
import { AppDispatch, makeStore } from 'src/modules/store/store';
import { makeHistory } from 'src/modules/navigation/store';
import {
  fetchStudies,
  selectedStudyIdSelector,
  setSelectedStudyId,
  studiesSelector,
} from 'src/modules/studies/studies.slice';
import { editedSurveySelector, setSurvey, surveyFromApi } from '../surveyEditor.slice';
import { mockTasks } from '../../surveyList.slice';
import SurveyPreview from './SurveyPreview';

// TODO: This test written assuming all questions are inside single section so next/prev navigate between questions
// TODO: However current mock data includes several sections so the test needs to be reworked
describe('Preview', () => {
  let store: ReturnType<typeof makeStore>;
  let history: ReturnType<typeof makeHistory>;
  let dispatch: AppDispatch;

  beforeEach(() => {
    history = makeHistory();
    store = makeStore(history);
    dispatch = store.dispatch;
  });

  it('should lifecycle', async () => {
    let renderResult: ReturnType<typeof render>;

    await dispatch(fetchStudies({ force: true }));
    const studies = studiesSelector(store.getState());
    expect(studies).not.toHaveLength(0);

    dispatch(setSelectedStudyId(studies[0].id));
    expect(selectedStudyIdSelector(store.getState())).toBe(studies[0].id);

    const surveyId = '1';
    const surveyMock = surveyFromApi(studies[0].id, { ...mockTasks[0], id: surveyId });
    dispatch(setSurvey(surveyMock));

    const editedSurvey = editedSurveySelector(store.getState());
    expect(editedSurvey).not.toBeUndefined();

    await act(async () => {
      renderResult = render(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <SurveyPreview />
            </ConnectedRouter>
          </Provider>
        </ThemeProvider>
      );
    });

    const surveyPreview = await screen.findByTestId('preview');
    const surveyPreviewScreen = await screen.findByTestId('survey-preview-questions');
    expect(surveyPreview).toMatchSnapshot();
    expect(surveyPreviewScreen).toBeInTheDocument();

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const { rerender } = renderResult;

    await act(() => {
      rerender(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <SurveyPreview />
            </ConnectedRouter>
          </Provider>
        </ThemeProvider>
      );
    });

    expect(surveyPreview).toMatchSnapshot();

    const getQuestionTitle = (idx: number) =>
      editedSurvey.questions.map((s) => s.children).flat()[idx].title +
      (editedSurvey.questions.map((s) => s.children).flat()[idx].options.optional ? '' : '*');
    const getQuestionFirstAnswer = (idx: number) =>
      editedSurvey.questions.map((s) => s.children).flat()[idx].answers[0];

    const firstQuestionTitle = getQuestionTitle(0);
    let firstQuestion = await screen.findByText(firstQuestionTitle);
    expect(firstQuestion).toBeInTheDocument();

    const firstAnswer = await screen.findByText(getQuestionFirstAnswer(0).value);
    const firstAnswerLabel = firstAnswer.closest('label') as HTMLLabelElement;
    const firstAnswerInput = firstAnswerLabel.nextSibling as HTMLInputElement;

    await userEvent.click(firstAnswerLabel);
    expect(firstAnswerInput).toBeChecked();

    const next = await screen.findByTestId('survey-preview-next');
    const prev = await screen.findByTestId('survey-preview-prev');

    await userEvent.click(next);

    const secondQuestionTitle = getQuestionTitle(1);
    const secondQuestion = await screen.findByText(secondQuestionTitle);
    expect(secondQuestion).toBeInTheDocument();
    expect(surveyPreview).toMatchSnapshot();

    await userEvent.click(prev);
    firstQuestion = await screen.findByText(firstQuestionTitle);
    expect(firstQuestion).toBeInTheDocument();
    expect(surveyPreview).toMatchSnapshot();
  });
});
