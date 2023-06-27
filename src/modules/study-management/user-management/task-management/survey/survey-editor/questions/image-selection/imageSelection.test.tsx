import React from 'react';
import { Provider } from 'react-redux';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import { render } from '@testing-library/react';
import { ThemeProvider } from 'styled-components/';
import { TouchBackend } from 'react-dnd-touch-backend';
import { DndProvider } from 'react-dnd';
import { ConnectedRouter } from 'connected-react-router';
import { theme } from 'src/styles';
import { makeStore } from 'src/modules/store/store';
import { makeHistory } from 'src/modules/navigation/store';
import handler from './index';

/* eslint-disable @typescript-eslint/no-explicit-any */

describe('image-selection', () => {
  it('type should be images', async () => {
    expect(handler.type).toEqual('images');
  });

  const emptyQuestion = {
    type: 'images',
    id: 'survey_question1',
    title: '',
    description: '',
    answers: [
      {
        id: 'survey_question2',
        image: '',
        touched: true,
        value: '',
      },
      {
        id: 'survey_question3',
        image: '',
        touched: true,
        value: '',
      },
      {
        id: 'survey_question4',
        image: '',
        touched: false,
        value: '',
      },
    ],
    options: {
      optional: false,
      imageLabels: true,
      multiSelect: true,
    },
  };

  it('should return empty question', async () => {
    expect(handler.createEmpty()).toEqual(emptyQuestion);
  });

  it('isEmpty should return true', async () => {
    expect(handler.isEmpty(emptyQuestion as any)).toBeTrue();
  });

  it('[NEGATIVE] isEmpty should return true if question is undefined', async () => {
    expect(handler.isEmpty(undefined as any)).toBeTrue();
  });

  it('[NEGATIVE] isEmpty should return true if question answers is undefined', async () => {
    expect(handler.isEmpty({ ...emptyQuestion, answers: undefined } as any)).toBeTrue();
  });

  const notEmptyQuestionItem = {
    id: '1',
    type: 'images',
    title: 'Title',
    description: 'Description',
    answers: [
      { id: 'survey_question2', value: '1', image: 'https://picsum.photos/200', touched: true },
      { id: 'survey_question3', value: '2', image: 'https://picsum.photos/200', touched: true },
      { id: 'survey_question4', value: '3', image: 'https://picsum.photos/200', touched: false },
    ],
    options: {
      optional: false,
      imageLabels: true,
      multiSelect: false,
    },
  };

  const notEmptyQuestionItemMulti = {
    id: '1',
    type: 'images',
    title: 'Title',
    description: 'Description',
    answers: [
      { id: 'survey_question2', value: '1', image: 'https://picsum.photos/200', touched: true },
      { id: 'survey_question3', value: '2', image: 'https://picsum.photos/200', touched: true },
      { id: 'survey_question4', value: '3', image: 'https://picsum.photos/200', touched: false },
    ],
    options: {
      optional: false,
      imageLabels: true,
      multiSelect: true,
    },
  };

  it('isEmpty should return false', async () => {
    expect(handler.isEmpty(notEmptyQuestionItem as any)).toBeFalse();
  });

  it('convertFromOtherType should return converted question', async () => {
    const qi = {
      type: 'single',
      id: 'Question1',
      title: 'Title',
      description: 'Description',
      skipLogic: undefined,
      options: {
        optional: false,
        includeOther: false,
      },
      answers: [],
    };
    expect(handler.convertFromOtherType(qi as any)).toEqual({
      ...qi,
      type: 'images',
      options: {
        optional: false,
        imageLabels: true,
        multiSelect: true,
      },
      answers: [
        {
          id: 'survey_question2',
          image: '',
          touched: true,
          value: '',
        },
        {
          id: 'survey_question3',
          image: '',
          touched: true,
          value: '',
        },
        {
          id: 'survey_question4',
          image: '',
          touched: false,
          value: '',
        },
      ],
    });
  });

  it('[NEGATIVE] convertFromOtherType should return empty question', async () => {
    expect(handler.convertFromOtherType({} as any)).toEqual({
      type: 'images',
      id: undefined,
      title: undefined,
      description: undefined,
      answers: [
        {
          id: 'survey_question2',
          image: '',
          touched: true,
          value: '',
        },
        {
          id: 'survey_question3',
          image: '',
          touched: true,
          value: '',
        },
        {
          id: 'survey_question4',
          image: '',
          touched: false,
          value: '',
        },
      ],
      options: {
        optional: false,
        imageLabels: true,
        multiSelect: true,
      },
      sectionId: undefined,
      skipLogic: undefined,
    });
  });

  const taskItemFromApi = {
    name: 'name',
    sequence: 1,
    type: 'QUESTION',
    contents: {
      title: 'Question Title',
      explanation: 'Question Description',
      required: true,
      type: 'CHOICE',
      properties: {
        tag: 'IMAGE',
        options: [
          { label: 'Label1', value: 'https://picsum.photos/200' },
          { label: 'Label2', value: 'https://picsum.photos/200' },
        ],
      },
    },
  };

  const taskItemFromApiMulti = {
    name: 'name',
    sequence: 1,
    type: 'QUESTION',
    contents: {
      title: 'Question Title',
      explanation: 'Question Description',
      required: true,
      type: 'CHOICE',
      properties: {
        tag: 'MULTIIMAGE',
        options: [
          { label: 'Label1', value: 'https://picsum.photos/200' },
          { label: 'Label2', value: 'https://picsum.photos/200' },
        ],
      },
    },
  };

  it('fromApi should return converted question', async () => {
    expect(handler.fromApi(taskItemFromApi as any)).toEqual({
      type: 'images',
      id: 'name',
      title: 'Question Title',
      description: 'Question Description',
      answers: [
        {
          id: 'survey_question1',
          value: 'Label1',
          touched: true,
          image: 'https://picsum.photos/200',
        },
        {
          id: 'survey_question2',
          value: 'Label2',
          touched: true,
          image: 'https://picsum.photos/200',
        },
        {
          id: 'survey_question3',
          value: '',
          image: '',
          touched: false,
        },
      ],
      options: {
        optional: false,
        imageLabels: true,
        multiSelect: false,
      },
    });

    expect(handler.fromApi(taskItemFromApiMulti as any)).toEqual({
      type: 'images',
      id: 'name',
      title: 'Question Title',
      description: 'Question Description',
      answers: [
        {
          id: 'survey_question4',
          value: 'Label1',
          touched: true,
          image: 'https://picsum.photos/200',
        },
        {
          id: 'survey_question5',
          value: 'Label2',
          touched: true,
          image: 'https://picsum.photos/200',
        },
        {
          id: 'survey_question6',
          value: '',
          image: '',
          touched: false,
        },
      ],
      options: {
        optional: false,
        imageLabels: true,
        multiSelect: true,
      },
    });
  });

  it('[NEGATIVE] fromApi should return undefined if task type is not a question', async () => {
    expect(handler.fromApi({ ...taskItemFromApi, type: 'ROW' })).toBeUndefined();
  });

  it('[NEGATIVE] fromApi should return undefined if question type is not an image', async () => {
    expect(
      handler.fromApi({
        ...taskItemFromApi,
        contents: { ...taskItemFromApi.contents, type: 'TEXT' },
      } as any)
    ).toBeUndefined();
  });

  it('toApi should return converted question', async () => {
    expect(handler.toApi(notEmptyQuestionItem as any)).toEqual({
      name: '1',
      type: 'QUESTION',
      sequence: 0,
      contents: {
        title: 'Title',
        explanation: 'Description',
        required: true,
        type: 'CHOICE',
        properties: {
          tag: 'IMAGE',
          options: [
            { label: '1', value: 'https://picsum.photos/200' },
            { label: '2', value: 'https://picsum.photos/200' },
          ],
        },
      },
    });

    expect(handler.toApi(notEmptyQuestionItemMulti as any)).toEqual({
      name: '1',
      type: 'QUESTION',
      sequence: 0,
      contents: {
        title: 'Title',
        explanation: 'Description',
        required: true,
        type: 'CHOICE',
        properties: {
          tag: 'MULTIIMAGE',
          options: [
            { label: '1', value: 'https://picsum.photos/200' },
            { label: '2', value: 'https://picsum.photos/200' },
          ],
        },
      },
    });
  });

  it('[NEGATIVE] toApi should not crash with empty data', async () => {
    expect(handler.toApi({} as any)).toEqual({
      name: undefined,
      type: 'QUESTION',
      sequence: 0,
      contents: {
        title: undefined,
        explanation: undefined,
        required: false,
        type: 'CHOICE',
        properties: {
          tag: 'IMAGE',
          options: [],
        },
      },
    });
  });

  it('transformAnswersOnQuestionChange should return empty object', async () => {
    expect(
      handler.transformAnswersOnQuestionChange({
        question: notEmptyQuestionItem as any,
        previousQuestion: { ...notEmptyQuestionItem, type: 'dropdown' } as any,
        answers: { survey_question2: 1 },
      })
    ).toEqual({});
  });

  it('transformAnswersOnQuestionChange should remove all answers except first if multiselect is disabled', async () => {
    expect(
      handler.transformAnswersOnQuestionChange({
        question: {
          ...notEmptyQuestionItem,
          options: { ...notEmptyQuestionItem.options, multiSelect: false },
        } as any,
        previousQuestion: {
          ...notEmptyQuestionItem,
          options: { ...notEmptyQuestionItem.options, multiSelect: true },
        } as any,
        answers: { survey_question2: 1, survey_question3: 1, survey_question4: 1 },
      })
    ).toEqual({ survey_question2: 1 });
  });

  it('transformAnswersOnQuestionChange should filter invalid answers', async () => {
    expect(
      handler.transformAnswersOnQuestionChange({
        question: notEmptyQuestionItem as any,
        previousQuestion: notEmptyQuestionItem as any,
        answers: { survey_question2: 1, survey_question3: 1, survey_question4: 1, other: 1 },
      })
    ).toEqual({ survey_question2: 1, survey_question3: 1, survey_question4: 1 });
  });

  it('[NEGATIVE] transformAnswersOnQuestionChange should return empty object if all answers are invalid', async () => {
    expect(
      handler.transformAnswersOnQuestionChange({
        question: notEmptyQuestionItem as any,
        previousQuestion: {
          ...notEmptyQuestionItem,
          answers: [{ id: '1', value: '1' }],
        } as any,
        answers: undefined as any,
      })
    ).toEqual({});
  });

  it('isPreviewQuestionAnswered should return true', async () => {
    expect(
      handler.isPreviewQuestionAnswered({
        question: notEmptyQuestionItem as any,
        answers: { survey_question2: 1, survey_question3: 1, survey_question4: 1 },
      })
    ).toBeTrue();
  });

  it('[NEGATIVE] isPreviewQuestionAnswered should return true if question is not defined but answers are defined', async () => {
    expect(
      handler.isPreviewQuestionAnswered({
        question: undefined as any,
        answers: { survey_question2: 1, survey_question3: 1, survey_question4: 1 },
      })
    ).toBeTrue();
  });

  it('[NEGATIVE] isPreviewQuestionAnswered should return false if answers are not defined', async () => {
    expect(
      handler.isPreviewQuestionAnswered({
        question: notEmptyQuestionItem as any,
        answers: undefined as any,
      })
    ).toBeFalse();
  });

  it('[NEGATIVE] isPreviewQuestionAnswered should return false if question is not defined and answers are not defined', async () => {
    expect(
      handler.isPreviewQuestionAnswered({
        question: undefined as any,
        answers: undefined as any,
      })
    ).toBeFalse();
  });

  it('renderEditorContent should render editor content', async () => {
    const onChange = jest.fn();
    const confirmOptionRemoval = jest.fn();

    const history: ReturnType<typeof makeHistory> = makeHistory();
    const store: ReturnType<typeof makeStore> = makeStore(history);

    const { baseElement } = render(
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          <ConnectedRouter history={history}>
            <DndProvider backend={TouchBackend} options={{ enableMouseEvents: true }}>
              {handler.renderEditorContent({
                surveyId: '',
                question: notEmptyQuestionItem as any,
                onChange,
                confirmOptionRemoval,
              })}
            </DndProvider>
          </ConnectedRouter>
        </Provider>
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();
  });

  it('renderEditorContent should return null if question is undefined', async () => {
    const onChange = jest.fn();
    const confirmOptionRemoval = jest.fn();

    expect(
      handler.renderEditorContent({
        surveyId: '',
        question: undefined as any,
        onChange,
        confirmOptionRemoval,
      })
    ).toBeNull();
  });

  it('renderPreviewContent should render preview content', async () => {
    const onAnswersChange = jest.fn();
    const onChange = jest.fn();

    const store: ReturnType<typeof makeStore> = makeStore();

    const { baseElement } = render(
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          {handler.renderPreviewContent({
            question: {
              ...notEmptyQuestionItem,
              options: { ...notEmptyQuestionItem.options, includeOther: true },
            } as any,
            answers: { 1: '1' },
            onAnswersChange,
            onChange,
          })}
        </Provider>
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();
  });

  it('[NEGATIVE] renderPreviewContent should return null if question is undefined', async () => {
    const onAnswersChange = jest.fn();
    const onChange = jest.fn();

    expect(
      handler.renderPreviewContent({
        question: undefined as any,
        answers: { survey_question2: 1, survey_question3: 1, survey_question4: 1 },
        onChange,
        onAnswersChange,
      })
    ).toBeNull();
  });

  it('[NEGATIVE] renderPreviewContent should return null if answers is undefined', async () => {
    const onAnswersChange = jest.fn();
    const onChange = jest.fn();

    expect(
      handler.renderPreviewContent({
        question: notEmptyQuestionItem as any,
        answers: undefined as any,
        onChange,
        onAnswersChange,
      })
    ).toBeNull();
  });
});
