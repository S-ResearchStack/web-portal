import React from 'react';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import { render } from '@testing-library/react';
import { ThemeProvider } from 'styled-components/';
import { TouchBackend } from 'react-dnd-touch-backend';
import { DndProvider } from 'react-dnd';
import { theme } from 'src/styles';
import handler from './index';

/* eslint-disable @typescript-eslint/no-explicit-any */

describe('scalable', () => {
  it('type should be slider', async () => {
    expect(handler.type).toEqual('slider');
  });

  it('should return empty question', async () => {
    expect(handler.createEmpty()).toEqual({
      type: 'slider',
      id: 'survey_question1',
      title: '',
      description: '',
      answers: [
        { id: 'survey_question2', label: '', value: 0 },
        { id: 'survey_question3', label: '', value: 10 },
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
        type: 'slider',
        title: '',
        description: '',
        answers: [
          { id: 'survey_question2', label: '', value: 0 },
          { id: 'survey_question3', label: '', value: 10 },
        ],
        options: {
          optional: false,
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
      { id: 'survey_question2', label: 'Label1', value: 0 },
      { id: 'survey_question3', label: 'Label2', value: 10 },
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
      answers: [],
    };
    expect(handler.convertFromOtherType(qi as any)).toEqual({
      ...qi,
      type: 'slider',
      answers: [
        { id: 'survey_question2', label: '', value: 0 },
        { id: 'survey_question3', label: '', value: 10 },
      ],
      options: {
        optional: false,
      },
    });
  });

  it('[NEGATIVE] convertFromOtherType should return empty question', async () => {
    expect(handler.convertFromOtherType({} as any)).toEqual({
      type: 'slider',
      id: undefined,
      title: undefined,
      description: undefined,
      answers: [
        { id: 'survey_question2', label: '', value: 0 },
        { id: 'survey_question3', label: '', value: 10 },
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
      type: 'SCALE',
      properties: {
        tag: 'SLIDER',
        lowLabel: 'Low Label',
        highLabel: 'High Label',
        low: 1,
        high: 9,
      },
    },
  };

  it('fromApi should return converted question', async () => {
    expect(handler.fromApi(taskItemFromApi as any)).toEqual({
      type: 'slider',
      id: 'name',
      title: 'Question Title',
      description: 'Question Description',
      answers: [
        { id: 'low', label: 'Low Label', value: 1 },
        { id: 'high', label: 'High Label', value: 9 },
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
        type: 'SCALE',
        properties: {
          tag: 'SLIDER',
          low: 0,
          lowLabel: 'Label1',
          high: 10,
          highLabel: 'Label2',
        },
      },
    });
  });

  it('[NEGATIVE] toApi should not crash with empty data', async () => {
    expect(handler.toApi({} as any)).toBeUndefined();
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

  it('[NEGATIVE] transformAnswersOnQuestionChange should return empty object if invalid answers data', async () => {
    expect(
      handler.transformAnswersOnQuestionChange({
        question: notEmptyQuestionItem as any,
        previousQuestion: notEmptyQuestionItem as any,
        answers: { value: '0' },
      })
    ).toEqual({});
  });

  it('transformAnswersOnQuestionChange should return value', async () => {
    expect(
      handler.transformAnswersOnQuestionChange({
        question: notEmptyQuestionItem as any,
        previousQuestion: notEmptyQuestionItem as any,
        answers: { value: 5 },
      })
    ).toEqual({ value: 5 });
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
        {handler.renderPreviewContent({
          question: notEmptyQuestionItem as any,
          answers: { value: 0 },
          onAnswersChange,
          onChange,
        })}
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();
  });

  it('[NEGATIVE] renderPreviewContent should return null if maxAnswer is not defined', async () => {
    const onAnswersChange = jest.fn();
    const onChange = jest.fn();

    expect(
      handler.renderPreviewContent({
        question: { ...notEmptyQuestionItem, answers: [{ id: '1', label: '1', value: 0 }] } as any,
        answers: { value: 0 },
        onChange,
        onAnswersChange,
      })
    ).toBeNull();
  });
});
