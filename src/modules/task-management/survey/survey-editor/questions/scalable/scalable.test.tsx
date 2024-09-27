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
  const expectId = expect.any(String);

  const emptyQuestion = {
    type: 'slider',
    id: expectId,
    title: '',
    description: '',
    answers: [
      { id: expectId, label: '', value: 0 },
      { id: expectId, label: '', value: 10 },
    ],
    options: {
      optional: false,
    },
  };

  const notEmptyQuestion = {
    id: 'id',
    type: 'single',
    title: 'Title',
    description: 'Description',
    answers: [
      { id: 'survey_question2', label: 'Low Label', value: 0 },
      { id: 'survey_question3', label: 'High Label', value: 10 },
    ],
    options: {
      optional: false,
    },
  };

  const taskItemFromApi = {
    id: 'id',
    type: 'SCALE',
    tag: 'SLIDER',
    title: 'Question Title',
    explanation: 'Question Description',
    required: false,
    itemProperties: {
      lowLabel: 'Low Label',
      highLabel: 'High Label',
      low: 0,
      high: 10,
    },
  };

  it('type should be slider', async () => {
    expect(handler.type).toEqual('slider');
  });

  it('[NEGATIVE] should return empty question', async () => {
    expect(handler.createEmpty()).toEqual(emptyQuestion);
  });

  it('isEmpty should return true', async () => {
    expect(handler.isEmpty(emptyQuestion as any)).toBeTrue();
  });

  it('isEmpty should return false', async () => {
    expect(handler.isEmpty(notEmptyQuestion as any)).toBeFalse();
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
        { id: expectId, label: '', value: 0 },
        { id: expectId, label: '', value: 10 },
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
        { id: expectId, label: '', value: 0 },
        { id: expectId, label: '', value: 10 },
      ],
      options: {
        optional: false,
      },
    });
  });

  it('fromApi should return converted question', async () => {
    expect(handler.fromApi(taskItemFromApi as any)).toEqual({
      type: 'slider',
      id: expectId,
      title: 'Question Title',
      description: 'Question Description',
      answers: [
        { id: expectId, label: 'Low Label', value: 0 },
        { id: expectId, label: 'High Label', value: 10 },
      ],
      options: {
        optional: true,
      },
    });
  });

  it('[NEGATIVE] fromApi should return undefined if question type is not a scale', async () => {
    expect(
      handler.fromApi({
        ...taskItemFromApi,
        type: '',
      } as any)
    ).toBeUndefined();
  });

  it('toApi should return converted question', async () => {
    expect(handler.toApi(notEmptyQuestion as any)).toEqual({
      id: expectId,
      type: 'SCALE',
      tag: 'SLIDER',
      title: 'Title',
      explanation: 'Description',
      required: true,
      itemProperties: {
        low: 0,
        lowLabel: 'Low Label',
        high: 10,
        highLabel: 'High Label',
      },
    });
  });

  it('[NEGATIVE] toApi should not crash with empty data', async () => {
    expect(handler.toApi({} as any)).toBeUndefined();
  });

  it('renderEditorContent should render editor content', async () => {
    const onChange = jest.fn();
    const confirmOptionRemoval = jest.fn();

    const { baseElement } = render(
      <ThemeProvider theme={theme}>
        <DndProvider backend={TouchBackend} options={{ enableMouseEvents: true }}>
          {handler.renderEditorContent({
            surveyId: '',
            question: notEmptyQuestion as any,
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
});
