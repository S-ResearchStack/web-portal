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
  const expectId = expect.any(String);

  const emptyQuestion = {
    type: 'rank',
    id: expectId,
    title: '',
    description: '',
    answers: [
      { id: expectId, value: 'Enter option 1' },
      { id: expectId, value: 'Enter option 2' },
    ],
    options: {
      optional: false,
    },
  };

  const notEmptyQuestion = {
    id: 'id',
    type: 'rank',
    title: 'Title',
    description: 'Description',
    answers: [
      { id: 'survey_question2', value: 'RANK 1' },
      { id: 'survey_question3', value: 'RANK 2' },
    ],
    options: {
      optional: false,
    },
  };

  const taskItemFromApi = {
    id: 'id',
    type: 'RANKING',
    tag: 'RANKING',
    title: 'Question Title',
    explanation: 'Question Description',
    required: false,
    itemProperties: {
      options: [{ value: 'RANK 1', label: 'RANK 1' }, { value: 'RANK 2', label: 'RANK 2' }],
    },
  };

  it('type should be rank', async () => {
    expect(handler.type).toEqual('rank');
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
      answers: [
        { id: '1', value: 'RANK 1' },
        { id: '2', value: 'RANK 2' },
      ],
    };
    expect(handler.convertFromOtherType(qi as any)).toEqual({
      ...qi,
      type: 'rank',
      answers: [
        { id: expectId, value: 'RANK 1' },
        { id: expectId, value: 'RANK 2' },
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
        { id: expectId, value: 'Enter option 1' },
        { id: expectId, value: 'Enter option 2' },
      ],
      options: {
        optional: false,
      },
    });
  });

  it('fromApi should return converted question', async () => {
    expect(handler.fromApi(taskItemFromApi as any)).toEqual({
      type: 'rank',
      id: expectId,
      title: 'Question Title',
      description: 'Question Description',
      answers: [
        { id: expectId, value: 'RANK 1' },
        { id: expectId, value: 'RANK 2' },
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
      type: 'RANKING',
      tag: 'RANKING',
      title: 'Title',
      explanation: 'Description',
      required: true,
      itemProperties: {
        options: [{ value: 'RANK 1', label: 'RANK 1' }, { value: 'RANK 2', label: 'RANK 2' }],
      },
    });
  });

  it('[NEGATIVE] toApi should not crash with empty data', async () => {
    expect(handler.toApi({} as any)).toEqual({
      id: undefined,
      type: 'RANKING',
      tag: 'RANKING',
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
