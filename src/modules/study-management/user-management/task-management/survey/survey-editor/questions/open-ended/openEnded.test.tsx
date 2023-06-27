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

describe('open-ended', () => {
  it('type should be open-ended', async () => {
    expect(handler.type).toEqual('open-ended');
  });

  it('should return empty question', async () => {
    expect(handler.createEmpty()).toEqual({
      type: 'open-ended',
      id: 'survey_question1',
      title: '',
      description: '',
      answers: [],
      options: {
        optional: false,
      },
    });
  });

  it('isEmpty should return true', async () => {
    expect(
      handler.isEmpty({
        id: '1',
        type: 'open-ended',
        title: '',
        description: '',
        answers: [],
        options: {
          optional: false,
        },
      })
    ).toBeTrue();
  });

  const notEmptyQuestionItem = {
    id: '1',
    type: 'open-ended',
    title: 'Title',
    description: 'Description',
    answers: [],
    options: {
      optional: false,
    },
  };

  it('isEmpty should return false', async () => {
    expect(handler.isEmpty(notEmptyQuestionItem as any)).toBeFalse();
  });

  it('[NEGATIVE] isEmpty should not crash if invalid data received', async () => {
    expect(handler.isEmpty({} as any)).toBeTrue();
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
        includeOther: true,
      },
      answers: [
        { id: '1', value: 'Label1' },
        { id: '2', value: 'Label2' },
      ],
    };
    expect(handler.convertFromOtherType(qi as any)).toEqual({
      ...qi,
      type: 'open-ended',
      answers: [],
      options: {
        optional: false,
      },
    });
  });

  it('[NEGATIVE] convertFromOtherType should return empty question', async () => {
    expect(handler.convertFromOtherType({} as any)).toEqual({
      type: 'open-ended',
      id: undefined,
      title: undefined,
      description: undefined,
      answers: [],
      options: {
        optional: false,
      },
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
      type: 'TEXT',
      properties: {
        tag: 'TEXT',
      },
    },
  };

  it('fromApi should return converted question', async () => {
    expect(handler.fromApi(taskItemFromApi as any)).toEqual({
      type: 'open-ended',
      id: 'name',
      title: 'Question Title',
      description: 'Question Description',
      answers: [],
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
        contents: { ...taskItemFromApi.contents, type: 'CHOICE' },
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
        type: 'TEXT',
        properties: {
          tag: 'TEXT',
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
        type: 'TEXT',
        properties: {
          tag: 'TEXT',
        },
      },
    });
  });

  it("[NEGATIVE] transformAnswersOnQuestionChange should return empty object if types don't match", async () => {
    expect(
      handler.transformAnswersOnQuestionChange({
        question: notEmptyQuestionItem as any,
        previousQuestion: { type: 'dropdown' } as any,
        answers: { 1: 'answer' },
      })
    ).toEqual({});
  });

  it('transformAnswersOnQuestionChange should return value', async () => {
    expect(
      handler.transformAnswersOnQuestionChange({
        question: notEmptyQuestionItem as any,
        previousQuestion: notEmptyQuestionItem as any,
        answers: { 1: 'answer' },
      })
    ).toEqual({ 1: 'answer' });
  });

  it('renderEditorContent should render editor content', async () => {
    const onChange = jest.fn();
    const confirmOptionRemoval = jest.fn();

    const { baseElement } = render(
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
  });

  it('[NEGATIVE] renderEditorContent should render if question is undefined', async () => {
    const onChange = jest.fn();
    const confirmOptionRemoval = jest.fn();

    const { baseElement } = render(
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
  });

  it('renderPreviewContent should render preview content', async () => {
    const onAnswersChange = jest.fn();
    const onChange = jest.fn();

    const { baseElement, getByTestId } = render(
      <ThemeProvider theme={theme}>
        <DndProvider backend={TouchBackend} options={{ enableMouseEvents: true }}>
          {handler.renderPreviewContent({
            question: notEmptyQuestionItem as any,
            answers: { survey_question2: 0 },
            onAnswersChange,
            onChange,
          })}
        </DndProvider>
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    const textarea = getByTestId('open-ended-textarea');
    const answer = 'answer';

    await act(async () => userEvent.type(textarea, answer));
    expect(textarea).toHaveValue(answer);
    await waitFor(() => {
      expect(onAnswersChange).toHaveBeenCalled();
    });
  });

  it('[NEGATIVE] renderPreviewContent should not crash if answers are not defined', async () => {
    const onAnswersChange = jest.fn();
    const onChange = jest.fn();

    const { baseElement } = render(
      <ThemeProvider theme={theme}>
        <DndProvider backend={TouchBackend} options={{ enableMouseEvents: true }}>
          {handler.renderPreviewContent({
            question: notEmptyQuestionItem as any,
            answers: undefined as any,
            onAnswersChange,
            onChange,
          })}
        </DndProvider>
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();
  });

  it('isPreviewQuestionAnswered should return true', async () => {
    expect(
      handler.isPreviewQuestionAnswered({
        question: notEmptyQuestionItem as any,
        answers: { value: '1' },
      })
    ).toBeTrue();
  });

  it('[NEGATIVE] isPreviewQuestionAnswered should return true if question is not defined but answers are defined', async () => {
    expect(
      handler.isPreviewQuestionAnswered({
        question: undefined as any,
        answers: { value: 'answer' },
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
});
