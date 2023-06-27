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
  it('type should be date-time', async () => {
    expect(handler.type).toEqual('date-time');
  });

  const emptyQuestion = {
    type: 'date-time',
    id: 'survey_question1',
    title: '',
    description: '',
    answers: [],
    options: {
      optional: false,
      isRange: false,
    },
    config: { isDate: true, isTime: true },
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
    type: 'date-time',
    title: 'Title',
    description: 'Description',
    answers: [
      { id: 'survey_question2', value: { date: [new Date('2023-04-17')], time: undefined } },
    ],
    options: {
      optional: false,
      isRange: false,
    },
    config: { isDate: true, isTime: false },
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
      skipLogic: undefined,
      config: {
        isDate: true,
        isTime: true,
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
      required: true,
      type: 'DATETIME',
      properties: {
        tag: 'DATETIME',
        isDate: true,
        isTime: false,
        isRange: false,
      },
    },
  };

  it('fromApi should return converted question', async () => {
    expect(handler.fromApi(taskItemFromApi as any)).toEqual({
      type: 'date-time',
      id: 'name',
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

  it('[NEGATIVE] fromApi should return undefined if task type is not a question', async () => {
    expect(handler.fromApi({ ...taskItemFromApi, type: 'ROW' })).toBeUndefined();
  });

  it('[NEGATIVE] fromApi should return undefined if question type is not an dropdown', async () => {
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
        type: 'DATETIME',
        properties: {
          tag: 'DATETIME',
          isDate: true,
          isTime: false,
          isRange: false,
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
        type: 'DATETIME',
        properties: {
          tag: 'DATETIME',
          isDate: undefined,
          isTime: undefined,
          isRange: undefined,
        },
      },
    });
  });

  it('transformAnswersOnQuestionChange should return empty object', async () => {
    expect(
      handler.transformAnswersOnQuestionChange({
        question: notEmptyQuestionItem as any,
        previousQuestion: { ...notEmptyQuestionItem, type: 'image' } as any,
        answers: { 'date-time': { date: new Date('2023-04-17') } } as any,
      })
    ).toEqual({});
  });

  it('transformAnswersOnQuestionChange should return answers', async () => {
    const date = new Date('2023-04-17');

    expect(
      handler.transformAnswersOnQuestionChange({
        question: notEmptyQuestionItem as any,
        previousQuestion: notEmptyQuestionItem as any,
        answers: { 'date-time': { date } } as any,
      })
    ).toEqual({ 'date-time': { date } });
  });

  it('[NEGATIVE] transformAnswersOnQuestionChange should not crash if answers are undefined', async () => {
    expect(
      handler.transformAnswersOnQuestionChange({
        question: notEmptyQuestionItem as any,
        previousQuestion: notEmptyQuestionItem as any,
        answers: undefined as any,
      })
    ).toEqual(undefined);
  });

  it('isPreviewQuestionAnswered should return true if answer is empty and range not selected', async () => {
    expect(
      handler.isPreviewQuestionAnswered({
        question: notEmptyQuestionItem as any,
        answers: {},
      })
    ).toBeTrue();
  });

  it('isPreviewQuestionAnswered should return true', async () => {
    expect(
      handler.isPreviewQuestionAnswered({
        question: notEmptyQuestionItem as any,
        answers: { 'date-time': { date: new Date('2023-04-17') } } as any,
      })
    ).toBeTrue();
  });

  it('isPreviewQuestionAnswered should return true with ranges', async () => {
    expect(
      handler.isPreviewQuestionAnswered({
        question: {
          ...notEmptyQuestionItem,
          options: { ...notEmptyQuestionItem.options, isRange: true },
          config: { ...notEmptyQuestionItem.config, isTime: true },
        } as any,
        answers: {
          'date-time': {
            datesRange: [new Date('2023-04-10'), new Date('2023-04-17')],
            timesRange: [new Date('2023-04-10 12:00:00'), new Date('2023-04-17 12:00:00')],
          },
        } as any,
      })
    ).toBeTrue();
  });

  it('isPreviewQuestionAnswered should return false', async () => {
    expect(
      handler.isPreviewQuestionAnswered({
        question: notEmptyQuestionItem as any,
        answers: { 'date-time': { date: undefined } } as any,
      })
    ).toBeFalse();
  });

  it('[NEGATIVE] isPreviewQuestionAnswered should not crush if answers are not provided', async () => {
    expect(
      handler.isPreviewQuestionAnswered({
        question: notEmptyQuestionItem as any,
        answers: undefined as any,
      })
    ).toBeFalse();
  });

  it('[NEGATIVE] isPreviewQuestionAnswered should not crush if question is not provided', async () => {
    expect(
      handler.isPreviewQuestionAnswered({
        question: undefined as any,
        answers: { 'date-time': { date: undefined } } as any,
      })
    ).toBeFalse();
  });

  it('renderEditorContent should render editor content', async () => {
    const onChange = jest.fn();
    const confirmOptionRemoval = jest.fn();

    const { baseElement, getByTestId } = render(
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
        question: { ...notEmptyQuestionItem, config: undefined } as any,
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
        question: { ...notEmptyQuestionItem, options: undefined } as any,
        onChange,
        confirmOptionRemoval,
      })
    ).toBeNull();
  });

  it('renderPreviewContent should render preview content', async () => {
    const onAnswersChange = jest.fn();
    const onChange = jest.fn();

    const { baseElement, getByTestId, rerender, queryAllByTestId } = render(
      <ThemeProvider theme={theme}>
        {handler.renderPreviewContent({
          question: notEmptyQuestionItem as any,
          answers: {
            'date-time': {
              date: new Date('2023-04-17'),
              time: new Date('2023-04-17 12:00:00'),
              datesRange: [],
              timesRange: [],
            },
          },
          onAnswersChange,
          onChange,
        })}
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    const carouselItemMonth = getByTestId('date-picker-carousel-item-month-0');
    await act(async () => userEvent.click(carouselItemMonth));
    await waitFor(() => {
      expect(onAnswersChange).toHaveBeenCalled();
    });

    const carouselItemDay = getByTestId('date-picker-carousel-item-day-0');
    await act(async () => userEvent.click(carouselItemDay));
    await waitFor(() => {
      expect(onAnswersChange).toHaveBeenCalled();
    });

    const carouselItemYear = getByTestId('date-picker-carousel-item-year-0');
    await act(async () => userEvent.click(carouselItemYear));
    await waitFor(() => {
      expect(onAnswersChange).toHaveBeenCalled();
    });

    rerender(
      <ThemeProvider theme={theme}>
        {handler.renderPreviewContent({
          question: {
            ...notEmptyQuestionItem,
            config: { ...notEmptyQuestionItem.config, isTime: true },
          } as any,
          answers: {
            'date-time': {
              date: new Date('2023-04-17'),
              time: new Date('2023-04-17 12:00:00'),
              datesRange: [],
              timesRange: [],
            },
          },
          onAnswersChange,
          onChange,
        })}
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    const date = getByTestId('date-time-picker-carousel-item-date-0');
    await act(async () => userEvent.click(date));
    await waitFor(() => {
      expect(onAnswersChange).toHaveBeenCalled();
    });

    const time = getByTestId('time-picker-carousel-item-hour-0');
    await act(async () => userEvent.click(time));
    await waitFor(() => {
      expect(onAnswersChange).toHaveBeenCalled();
    });

    rerender(
      <ThemeProvider theme={theme}>
        {handler.renderPreviewContent({
          question: {
            ...notEmptyQuestionItem,
            config: { ...notEmptyQuestionItem.config, isDate: false, isTime: true },
          } as any,
          answers: {
            'date-time': {
              date: new Date('2023-04-17'),
              time: new Date('2023-04-17 12:00:00'),
              datesRange: [],
              timesRange: [],
            },
          },
          onAnswersChange,
          onChange,
        })}
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    const carouselItemHour = getByTestId('time-picker-carousel-item-hour-0');
    await act(async () => userEvent.click(carouselItemHour));
    await waitFor(() => {
      expect(onAnswersChange).toHaveBeenCalled();
    });

    const carouselItemMinute = getByTestId('time-picker-carousel-item-minute-0');
    await act(async () => userEvent.click(carouselItemMinute));
    await waitFor(() => {
      expect(onAnswersChange).toHaveBeenCalled();
    });

    const pmItem = getByTestId('time-picker-pm-2');
    await act(async () => userEvent.click(pmItem));
    await waitFor(() => {
      expect(onAnswersChange).toHaveBeenCalled();
    });

    rerender(
      <ThemeProvider theme={theme}>
        {handler.renderPreviewContent({
          question: {
            ...notEmptyQuestionItem,
            options: { ...notEmptyQuestionItem.options, isRange: true },
            config: { ...notEmptyQuestionItem.config, isTime: true },
          } as any,
          answers: {
            'date-time': {
              date: new Date('2023-04-17'),
              time: new Date('2023-04-17 12:00:00'),
              datesRange: [new Date('2023-04-17'), new Date('2023-04-18')],
              timesRange: [new Date('2023-04-17 12:00:00'), new Date('2023-04-18 12:00:00')],
            },
          },
          onAnswersChange,
          onChange,
        })}
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    const dateFieldStart = getByTestId('date-time-range-preview-range-item-0');
    await act(async () => userEvent.click(dateFieldStart));
    await waitFor(() => expect(getByTestId('calendar-popover-preview')).toBeVisible());

    const enabledDates = queryAllByTestId('calendar-popover-enabled-date');
    await act(async () => userEvent.click(enabledDates[0]));
    await waitFor(() => {
      expect(onAnswersChange).toHaveBeenCalled();
    });

    const dateTimeField = getByTestId('date-time-range-preview-range-time-item-0');
    await act(async () => userEvent.click(dateTimeField));
    await waitFor(() => expect(getByTestId('range-time-picker')).toBeVisible());

    await act(async () => userEvent.click(getByTestId('time-picker-carousel-item-hour-0')));
    await act(async () => userEvent.click(getByTestId('range-time-picker-close')));
    await waitFor(() => {
      expect(onAnswersChange).toHaveBeenCalled();
    });
  });

  it('[NEGATIVE] renderPreviewContent should return null if question is undefined', async () => {
    const onAnswersChange = jest.fn();
    const onChange = jest.fn();

    expect(
      handler.renderPreviewContent({
        question: undefined as any,
        answers: { 'date-time': { date: new Date('2023-04-17') } } as any,
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

  it('[NEGATIVE] renderPreviewContent should return null if question options are undefined', async () => {
    const onAnswersChange = jest.fn();
    const onChange = jest.fn();

    expect(
      handler.renderPreviewContent({
        question: { ...notEmptyQuestionItem, options: undefined } as any,
        answers: undefined as any,
        onChange,
        onAnswersChange,
      })
    ).toBeNull();
  });
});
