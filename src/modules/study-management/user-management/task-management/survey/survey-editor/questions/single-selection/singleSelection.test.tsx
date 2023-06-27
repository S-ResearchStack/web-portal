import React from 'react';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import { act, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from 'styled-components/';
import { TouchBackend } from 'react-dnd-touch-backend';
import { DndProvider } from 'react-dnd';
import { theme } from 'src/styles';
import handler from './index';

/* eslint-disable @typescript-eslint/no-explicit-any */

describe('single-selection', () => {
  it('type should be single', async () => {
    expect(handler.type).toEqual('single');
  });

  it('should return empty question', async () => {
    expect(handler.createEmpty()).toEqual({
      type: 'single',
      id: 'survey_question1',
      title: '',
      description: '',
      answers: [
        { id: 'survey_question2', value: 'Enter option 1' },
        { id: 'survey_question3', value: 'Enter option 2' },
      ],
      options: {
        optional: false,
        includeOther: false,
      },
    });
  });

  it('isEmpty should return true', async () => {
    expect(
      handler.isEmpty({
        id: '1',
        type: 'single',
        title: '',
        description: '',
        answers: [],
        options: {
          optional: false,
          includeOther: false,
        },
      })
    ).toBeTrue();
  });

  const notEmptyQuestionItem = {
    id: '1',
    type: 'single',
    title: 'Title',
    description: 'Description',
    answers: [
      { id: 'survey_question2', value: 'Option1' },
      { id: 'survey_question3', value: 'Option2' },
    ],
    options: {
      optional: false,
      includeOther: false,
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
      answers: [],
    };
    expect(handler.convertFromOtherType(qi as any)).toEqual({ ...qi, type: 'single' });
  });

  it('[NEGATIVE] convertFromOtherType should return empty question', async () => {
    expect(handler.convertFromOtherType({} as any)).toEqual({
      type: 'single',
      id: undefined,
      title: undefined,
      description: undefined,
      answers: [
        { id: 'survey_question2', value: 'Enter option 1' },
        { id: 'survey_question3', value: 'Enter option 2' },
      ],
      options: {
        optional: false,
        includeOther: false,
      },
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
        tag: 'CHECKBOX',
        options: [{ value: 'Option 1' }, { value: 'Option 2' }],
      },
    },
  };

  it('fromApi should return converted question', async () => {
    expect(handler.fromApi(taskItemFromApi as any)).toEqual({
      type: 'single',
      id: 'name',
      title: 'Question Title',
      description: 'Question Description',
      answers: [
        { id: 'survey_question1', value: 'Option 1' },
        { id: 'survey_question2', value: 'Option 2' },
      ],
      options: {
        optional: false,
        includeOther: false,
      },
    });
  });

  it('[NEGATIVE] fromApi should return undefined if task type is not a question', async () => {
    expect(handler.fromApi({ ...taskItemFromApi, type: 'ROW' })).toBeUndefined();
  });

  it('[NEGATIVE] fromApi should return undefined if question type is not a choice', async () => {
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
          tag: 'RADIO',
          options: [{ value: 'Option1' }, { value: 'Option2' }],
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
          tag: 'RADIO',
          options: [],
        },
      },
    });
  });

  const question = {
    type: 'single',
    id: '1',
    title: 'Question Title',
    description: 'Question Description',
    answers: [],
    options: {
      optional: false,
      includeOther: false,
    },
  };

  it('transformAnswersOnQuestionChange should return empty object', async () => {
    expect(
      handler.transformAnswersOnQuestionChange({
        question: question as any,
        previousQuestion: { ...question, type: 'dropdown' },
        answers: { 1: '1' },
      })
    ).toEqual({});
  });

  it('transformAnswersOnQuestionChange should omit other option', async () => {
    expect(
      handler.transformAnswersOnQuestionChange({
        question: question as any,
        previousQuestion: {
          ...question,
          options: { ...question.options, includeOther: true },
        } as any,
        answers: { 1: '1', other: 'other' },
      })
    ).toEqual({ 1: '1' });
  });

  it('transformAnswersOnQuestionChange should filter invalid answers', async () => {
    expect(
      handler.transformAnswersOnQuestionChange({
        question: {
          ...question,
          answers: [{ id: '1', value: '1' }],
        } as any,
        previousQuestion: {
          ...question,
          answers: [
            { id: '1', value: '1' },
            { id: '2', value: '2' },
          ],
        } as any,
        answers: { 1: '1' },
      })
    ).toEqual({ 1: '1' });
  });

  it('[NEGATIVE] transformAnswersOnQuestionChange should return empty object with invalid answers', async () => {
    expect(
      handler.transformAnswersOnQuestionChange({
        question: question as any,
        previousQuestion: {
          ...question,
          answers: [{ id: '1', value: '1' }],
        } as any,
        answers: undefined as any,
      })
    ).toEqual({});
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

  it('[NEGATIVE] renderEditorContent should return null if question answers is empty', async () => {
    const onChange = jest.fn();
    const confirmOptionRemoval = jest.fn();

    expect(
      handler.renderEditorContent({
        surveyId: '',
        question: { ...notEmptyQuestionItem, answers: undefined } as any,
        onChange,
        confirmOptionRemoval,
      })
    ).toBeNull();
  });

  it('[NEGATIVE] renderEditorContent should return null if question options is empty', async () => {
    const onChange = jest.fn();
    const confirmOptionRemoval = jest.fn();

    expect(
      handler.renderEditorContent({
        surveyId: '',
        question: { ...notEmptyQuestionItem, options: undefined } as any,
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
        {handler.renderPreviewContent({
          question: notEmptyQuestionItem as any,
          answers: { 1: '1' },
          onAnswersChange,
          onChange,
        })}
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
        answers: { 1: '1' },
        onChange,
        onAnswersChange,
      })
    ).toBeNull();
  });

  it('[NEGATIVE] renderPreviewContent should return null if question answers is empty', async () => {
    const onAnswersChange = jest.fn();
    const onChange = jest.fn();

    expect(
      handler.renderPreviewContent({
        question: { ...notEmptyQuestionItem, answers: undefined } as any,
        answers: { 1: '1' },
        onChange,
        onAnswersChange,
      })
    ).toBeNull();
  });

  it('[NEGATIVE] renderPreviewContent should return null if question options is empty', async () => {
    const onChange = jest.fn();
    const onAnswersChange = jest.fn();

    expect(
      handler.renderPreviewContent({
        question: { ...notEmptyQuestionItem, options: undefined } as any,
        answers: { 1: '1' },
        onChange,
        onAnswersChange,
      })
    ).toBeNull();
  });
});
