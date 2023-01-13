import React from 'react';
import 'jest-styled-components';
import { act, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from 'styled-components';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';

import 'src/__mocks__/setupWindowMatchMediaMock';
import 'src/__mocks__/setupResizeObserverMock';

import theme from 'src/styles/theme';
import { AppDispatch, makeStore } from 'src/modules/store/store';
import { makeHistory } from 'src/modules/navigation/store';
import {
  fetchStudies,
  selectedStudyIdSelector,
  setSelectedStudyId,
  studiesSelector,
} from 'src/modules/studies/studies.slice';
import {
  editedSurveySelector,
  loadSurvey,
} from 'src/modules/trial-management/survey-editor/surveyEditor.slice';
import Preview from './Preview';

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
    const onClose = jest.fn();

    let renderResult: ReturnType<typeof render>;

    await dispatch(fetchStudies({ force: true }));
    const studies = studiesSelector(store.getState());
    expect(studies).not.toHaveLength(0);

    await dispatch(setSelectedStudyId(studies[0].id));
    expect(selectedStudyIdSelector(store.getState())).toBe(studies[0].id);

    const surveyId = '1';
    await dispatch(
      loadSurvey({
        studyId: studies[0].id,
        surveyId,
        onError: jest.fn(),
      })
    );
    const editedSurvey = editedSurveySelector(store.getState());
    expect(editedSurvey).not.toBeUndefined();

    await act(async () => {
      renderResult = await render(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <Preview onClose={onClose} />
            </ConnectedRouter>
          </Provider>
        </ThemeProvider>
      );
    });

    const surveyPreview = await screen.findByTestId('survey-preview');
    const surveyPreviewScreen = await screen.findByTestId('survey-preview-screen');
    expect(surveyPreview).toMatchSnapshot();
    expect(surveyPreview).toHaveStyle('opacity: 0');
    expect(surveyPreviewScreen).toBeInTheDocument();

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const { rerender } = renderResult;

    await act(async () => {
      await rerender(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <Preview isOpen onClose={onClose} />
            </ConnectedRouter>
          </Provider>
        </ThemeProvider>
      );
    });

    expect(surveyPreview).toMatchSnapshot();
    expect(surveyPreview).toHaveStyle('opacity: 1');

    const getQuestionTitle = (idx: number) =>
      editedSurvey.questions[idx].title + (editedSurvey.questions[idx].optional ? '' : '*');
    const getQuestionFirstAnswer = (idx: number) => editedSurvey.questions[idx].answers[0];

    const firstQuestionTitle = getQuestionTitle(0);
    const firstQuestion = await screen.findByText(firstQuestionTitle);
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
    expect(firstQuestion).toBeInTheDocument();
    expect(surveyPreview).toMatchSnapshot();

    const close = await screen.findByTestId('survey-preview-close');
    await userEvent.click(close);
    expect(onClose).toHaveBeenCalled();
  });
});
