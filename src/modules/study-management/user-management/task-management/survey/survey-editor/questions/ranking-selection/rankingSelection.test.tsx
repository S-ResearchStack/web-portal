import React from 'react';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import { render, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from 'styled-components/';
import { TouchBackend } from 'react-dnd-touch-backend';
import { DndProvider } from 'react-dnd';
import { theme } from 'src/styles';
import handler from './index';

/* eslint-disable @typescript-eslint/no-explicit-any */

describe('ranking-selection', () => {
  it('type should be rank', async () => {
    expect(handler.type).toEqual('rank');
  });

  it('should return empty question', async () => {
    expect(handler.createEmpty()).toEqual({
      type: 'rank',
      id: 'survey_question1',
      title: '',
      description: '',
      answers: [
        { id: 'survey_question2', value: 'Enter option 1' },
        { id: 'survey_question3', value: 'Enter option 2' },
      ],
      options: {
        optional: false,
      },
    });
  });

  it('isEmpty should return true', async () => {
    expect(
      handler.isEmpty({
        id: '1',
        type: 'rank',
        title: '',
        description: '',
        answers: [
          { id: 'survey_question2', value: 'Enter option 1' },
          { id: 'survey_question3', value: 'Enter option 2' },
        ],
        options: {
          optional: false,
        },
      })
    ).toBeTrue();
  });

  const notEmptyQuestionItem = {
    id: '1',
    type: 'rank',
    title: 'Title',
    description: 'Description',
    answers: [
      { id: 'survey_question2', value: 'Label1' },
      { id: 'survey_question3', value: 'Label2' },
    ],
    options: {
      optional: false,
    },
  };

  it('isEmpty should return false', async () => {
    expect(handler.isEmpty(notEmptyQuestionItem as any)).toBeFalse();
  });

  it('[NEGATIVE] isEmpty should not crash if invalid data received', async () => {
    expect(handler.isEmpty({} as any)).toBeUndefined();
  });

  it('convertFromOtherType should return converted question', async () => {
    const qi = {
      type: 'multiple',
      id: 'Question1',
      title: 'Title',
      description: 'Description',
      skipLogic: undefined,
      options: {
        optional: false,
        includeOther: false,
      },
      answers: [
        { id: '1', value: 'Label1' },
        { id: '2', value: 'Label2' },
      ],
    };
    expect(handler.convertFromOtherType(qi as any)).toEqual({
      ...qi,
      type: 'rank',
      answers: [
        { id: '1', value: 'Label1' },
        { id: '2', value: 'Label2' },
      ],
      options: {
        optional: false,
      },
    });
  });

  it('[NEGATIVE] convertFromOtherType should return empty question', async () => {
    expect(handler.convertFromOtherType({} as any)).toEqual({
      type: 'rank',
      id: undefined,
      title: undefined,
      description: undefined,
      answers: [
        { id: 'survey_question2', value: 'Enter option 1' },
        { id: 'survey_question3', value: 'Enter option 2' },
      ],
      options: {
        optional: false,
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
      required: false,
      type: 'RANK',
      properties: {
        tag: 'RANK',
        options: [{ value: 'Value 1' }, { value: 'Value 2' }],
      },
    },
  };

  it('fromApi should return converted question', async () => {
    expect(handler.fromApi(taskItemFromApi as any)).toEqual({
      type: 'rank',
      id: 'name',
      title: 'Question Title',
      description: 'Question Description',
      answers: [
        { id: 'survey_question1', value: 'Value 1' },
        { id: 'survey_question2', value: 'Value 2' },
      ],
      options: {
        optional: true,
      },
    });
  });

  it('[NEGATIVE] fromApi should return undefined if task type is not a question', async () => {
    expect(handler.fromApi({ ...taskItemFromApi, type: 'ROW' })).toBeUndefined();
  });

  it('[NEGATIVE] fromApi should return undefined if question type is not a scale', async () => {
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
        type: 'RANK',
        properties: {
          tag: 'RANK',
          options: [{ value: 'Label1' }, { value: 'Label2' }],
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
        type: 'RANK',
        properties: {
          tag: 'RANK',
          options: [],
        },
      },
    });
  });

  it("[NEGATIVE] transformAnswersOnQuestionChange should return empty object if types don't match", async () => {
    expect(
      handler.transformAnswersOnQuestionChange({
        question: notEmptyQuestionItem as any,
        previousQuestion: { type: 'dropdown' } as any,
        answers: { 1: '1' },
      })
    ).toEqual({});
  });

  it('transformAnswersOnQuestionChange should return value', async () => {
    expect(
      handler.transformAnswersOnQuestionChange({
        question: notEmptyQuestionItem as any,
        previousQuestion: notEmptyQuestionItem as any,
        answers: { survey_question2: 0 },
      })
    ).toEqual({ survey_question2: 0 });
  });

  it('renderEditorContent should render editor content', async () => {
    const onChange = jest.fn();
    const confirmOptionRemoval = jest.fn();

    const { baseElement, getByTestId, queryAllByTestId } = render(
      <ThemeProvider theme={theme}>
        <DndProvider backend={TouchBackend} options={{ enableMouseEvents: true }}>
          {handler.renderEditorContent({
            surveyId: '',
            question: notEmptyQuestionItem as any,
            onChange,
            confirmOptionRemoval,
          })}
        </DndProvider>
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    const addOptionField = getByTestId('question-card-add-option');
    const newOptionTitle = 'New Option';

    await act(() => userEvent.type(addOptionField, newOptionTitle));
    expect(addOptionField).toHaveValue(newOptionTitle);
    await waitFor(
      () => {
        expect(onChange).toHaveBeenCalled();
      },

      // required because survey input has a debounce for invoking onChange callback
      { timeout: 2500 }
    );

    const firstOptionDeleteButton = queryAllByTestId('delete-option-button')[1];
    await act(async () => userEvent.click(firstOptionDeleteButton));
    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
    });
  });

  it('[NEGATIVE] renderEditorContent should return null if question is undefined', async () => {
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

    const { baseElement } = render(
      <ThemeProvider theme={theme}>
        <DndProvider backend={TouchBackend} options={{ enableMouseEvents: true }}>
          {handler.renderPreviewContent({
            containerRef: React.createRef(),
            question: notEmptyQuestionItem as any,
            answers: { survey_question2: 0 },
            onAnswersChange,
            onChange,
          })}
        </DndProvider>
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
        answers: { survey_question2: 0 },
        onChange,
        onAnswersChange,
      })
    ).toBeNull();
  });

  it('isPreviewQuestionAnswered should return true', async () => {
    expect(
      handler.isPreviewQuestionAnswered({
        question: notEmptyQuestionItem as any,
        answers: { 1: '1' },
      })
    ).toBeTrue();
  });

  it('[NEGATIVE] isPreviewQuestionAnswered should return false is question is not defined', async () => {
    expect(
      handler.isPreviewQuestionAnswered({
        question: undefined as any,
        answers: { 1: '1' },
      })
    ).toBeFalse();
  });

  it('[NEGATIVE] isPreviewQuestionAnswered should return false is question answers are not defined', async () => {
    expect(
      handler.isPreviewQuestionAnswered({
        question: { ...notEmptyQuestionItem, answers: undefined } as any,
        answers: { 1: '1' },
      })
    ).toBeFalse();
  });
});
