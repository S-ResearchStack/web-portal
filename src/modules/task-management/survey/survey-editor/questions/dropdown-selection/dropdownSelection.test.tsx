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

describe('dropdown-selection', () => {
  const expectId = expect.any(String);

  const emptyQuestion = {
    type: 'dropdown',
    id: expectId,
    title: '',
    description: '',
    answers: [
      { id: expectId, value: 'Enter option 1' },
      { id: expectId, value: 'Enter option 2' },
    ],
    options: {
      optional: false,
      includeOther: false,
    },
  };

  const notEmptyQuestion = {
    id: 'id',
    type: 'dropdown',
    title: 'Title',
    description: 'Description',
    answers: [
      { id: 'survey_question2', value: 'Option 1' },
      { id: 'survey_question3', value: 'Option 2' },
    ],
    options: {
      optional: false,
      includeOther: false,
    },
  };

  const taskItemFromApi = {
    type: 'CHOICE',
    id: 'id',
    title: 'Question Title',
    explanation: 'Question Description',
    required: true,
    itemProperties: {
      options: [{ value: 'Option 1', label: 'Option 1' }, { value: 'Option 2', label: 'Option 2' }],
    },
  };

  it('type should be dropdown', async () => {
    expect(handler.type).toEqual('dropdown');
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

  it('convertFromOtherType should return converted question with similar answers', async () => {
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
      type: 'dropdown',
      options: {
        optional: false,
        includeOther: false,
      },
      answers: [{ answer1: 'answer1' }, { answer2: 'answer2' }],
    });
  });

  it('convertFromOtherType should return converted question with empty answers', async () => {
    const qi = {
      type: 'images',
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
      type: 'dropdown',
      options: {
        optional: false,
        includeOther: false,
      },
      answers: [
        { id: expectId, value: 'Enter option 1' },
        { id: expectId, value: 'Enter option 2' },
      ],
    });
  });

  it('[NEGATIVE] convertFromOtherType should return empty question', async () => {
    expect(handler.convertFromOtherType({} as any)).toEqual({
      type: 'dropdown',
      id: undefined,
      title: undefined,
      description: undefined,
      answers: [
        { id: expectId, value: 'Enter option 1' },
        { id: expectId, value: 'Enter option 2' },
      ],
      options: {
        optional: false,
        includeOther: false,
      },
    });
  });

  it('fromApi should return converted question', async () => {
    expect(handler.fromApi(taskItemFromApi as any)).toEqual({
      type: 'dropdown',
      id: expectId,
      title: 'Question Title',
      description: 'Question Description',
      answers: [
        {
          id: expectId,
          value: 'Option 1',
        },
        {
          id: expectId,
          value: 'Option 2',
        },
      ],
      options: {
        optional: false,
        includeOther: false,
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
      type: 'CHOICE',
      tag: 'DROPDOWN',
      title: 'Title',
      explanation: 'Description',
      required: true,
      itemProperties: {
        options: [{ value: 'Option 1', label: 'Option 1' }, { value: 'Option 2', label: 'Option 2' }],
      },
    });
  });

  it('[NEGATIVE] toApi should not crash with empty data', async () => {
    expect(handler.toApi({} as any)).toEqual({
      id: undefined,
      type: 'CHOICE',
      tag: 'DROPDOWN',
      title: undefined,
      explanation: undefined,
      required: false,
      itemProperties: {
        options: [],
      },
    });
  });

  it('renderEditorContent should render editor content', async () => {
    const onChange = jest.fn();
    const confirmOptionRemoval = jest.fn();

    const { baseElement, getByTestId, queryAllByTestId } = render(
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

    const addOptionButton = getByTestId('add-option-button');
    await act(() => userEvent.click(addOptionButton));

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
});
