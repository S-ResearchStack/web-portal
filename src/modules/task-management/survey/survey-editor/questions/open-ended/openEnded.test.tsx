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
  const expectId = expect.any(String);

  const emptyQuestion = {
    id: expectId,
    type: 'open-ended',
    title: '',
    description: '',
    options: {
      optional: false,
    },
    answers: []
  };

  const notEmptyQuestion = {
    id: 'id',
    type: 'open-ended',
    title: 'Title',
    description: 'Description',
    options: {
      optional: false,
    },
  };

  const taskItemFromApi = {
    id: 'id',
    type: 'TEXT',
    tag: 'TEXT',
    title: 'Question Title',
    explanation: 'Question Description',
    required: false,
  };

  it('type should be open-ended', async () => {
    expect(handler.type).toEqual('open-ended');
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
    expect(handler.isEmpty({} as any)).toBeTrue();
  });

  it('convertFromOtherType should return converted question', async () => {
    const qi = {
      type: 'multiple',
      id: 'Question1',
      title: 'Title',
      description: 'Description',
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

  it('fromApi should return converted question', async () => {
    expect(handler.fromApi(taskItemFromApi as any)).toEqual({
      type: 'open-ended',
      id: expectId,
      title: 'Question Title',
      description: 'Question Description',
      answers: [],
      options: {
        optional: true,
      },
    });
  });

  it('[NEGATIVE] fromApi should return undefined if question type is not a scale', async () => {
    expect(
      handler.fromApi({
        ...taskItemFromApi,
        type: 'CHOICE',
      } as any)
    ).toBeUndefined();
  });

  it('toApi should return converted question', async () => {
    expect(handler.toApi(notEmptyQuestion as any)).toEqual({
      id: expectId,
      type: 'TEXT',
      tag: 'TEXT',
      title: 'Title',
      explanation: 'Description',
      required: true,
    });
  });

  it('[NEGATIVE] toApi should not crash with empty data', async () => {
    expect(handler.toApi({} as any)).toEqual({
      id: undefined,
      type: 'TEXT',
      tag: 'TEXT',
      title: undefined,
      explanation: undefined,
      required: false,
    });
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

  it('[NEGATIVE] renderEditorContent should render if question is undefined', async () => {
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
});
