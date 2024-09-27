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

describe('date-time', () => {
  const expectId = expect.any(String);

  const emptyQuestion = {
    type: 'date-time',
    id: expectId,
    title: '',
    description: '',
    answers: [],
    options: {
      optional: false,
      isRange: false,
    },
    config: { isDate: true, isTime: true },
  };

  const notEmptyQuestion = {
    id: 'id',
    type: 'date-time',
    title: 'Title',
    description: 'Description',
    options: {
      optional: false,
      isRange: false,
    },
    config: { isDate: true, isTime: false },
  };

  const taskItemFromApi = {
    id: 'id',
    type: 'DATETIME',
    tag: 'DATETIME',
    title: 'Question Title',
    explanation: 'Question Description',
    required: true,
    itemProperties: {
      isDate: true,
      isTime: false,
      isRange: false,
    },
  };

  it('type should be date-time', async () => {
    expect(handler.type).toEqual('date-time');
  });

  it('[NEGATIVE] should return empty question', async () => {
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

  it('isEmpty should return false', async () => {
    expect(handler.isEmpty(notEmptyQuestion as any)).toBeFalse();
  });

  it('convertFromOtherType should return converted question', async () => {
    const qi = {
      type: 'single',
      id: 'Question1',
      title: 'Title',
      description: 'Description',
      options: {
        optional: false,
        includeOther: false,
      },
      answers: [{ answer1: 'answer1' }, { answer2: 'answer2' }],
    };
    expect(handler.convertFromOtherType(qi as any)).toEqual({
      ...qi,
      type: 'date-time',
      options: {
        optional: false,
        isRange: false,
      },
      answers: [],
      config: {
        isDate: true,
        isTime: true,
      },
    });
  });

  it('[NEGATIVE] convertFromOtherType should return empty question', async () => {
    expect(handler.convertFromOtherType({} as any)).toEqual({
      type: 'date-time',
      id: undefined,
      title: undefined,
      description: undefined,
      answers: [],
      options: {
        optional: false,
        isRange: false,
      },
      config: {
        isDate: true,
        isTime: true,
      },
    });
  });

  it('fromApi should return converted question', async () => {
    expect(handler.fromApi(taskItemFromApi as any)).toEqual({
      type: 'date-time',
      id: expectId,
      title: 'Question Title',
      description: 'Question Description',
      answers: [],
      options: {
        optional: false,
        isRange: false,
      },
      config: {
        isDate: true,
        isTime: false,
      },
    });
  });

  it('[NEGATIVE] fromApi should return undefined if question type is not an dropdown', async () => {
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
      type: 'DATETIME',
      tag: 'DATETIME',
      title: 'Title',
      explanation: 'Description',
      required: true,
      itemProperties: {
        isDate: true,
        isTime: false,
        isRange: false,
      },
    });
  });

  it('[NEGATIVE] toApi should not crash with empty data', async () => {
    expect(handler.toApi({} as any)).toEqual({
      id: undefined,
      type: 'DATETIME',
      tag: 'DATETIME',
      title: undefined,
      explanation: undefined,
      required: false,
      itemProperties: {
        isDate: undefined,
        isTime: undefined,
        isRange: undefined,
      },
    });
  });

  it('renderEditorContent should render editor content', async () => {
    const onChange = jest.fn();
    const confirmOptionRemoval = jest.fn();

    const { baseElement, getByTestId } = render(
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

    const addRowButton = getByTestId('date-time-options-add-row');
    await act(async () => userEvent.click(addRowButton));
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

  it('[NEGATIVE] renderEditorContent should return null if question config is undefined', async () => {
    const onChange = jest.fn();
    const confirmOptionRemoval = jest.fn();

    expect(
      handler.renderEditorContent({
        surveyId: '',
        question: { ...notEmptyQuestion, config: undefined } as any,
        onChange,
        confirmOptionRemoval,
      })
    ).toBeNull();
  });

  it('[NEGATIVE] renderEditorContent should return null if question options are undefined', async () => {
    const onChange = jest.fn();
    const confirmOptionRemoval = jest.fn();

    expect(
      handler.renderEditorContent({
        surveyId: '',
        question: { ...notEmptyQuestion, options: undefined } as any,
        onChange,
        confirmOptionRemoval,
      })
    ).toBeNull();
  });
});
