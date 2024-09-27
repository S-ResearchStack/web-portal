import React from 'react';
import { Provider } from 'react-redux';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import { render } from '@testing-library/react';
import { ThemeProvider } from 'styled-components/';
import { TouchBackend } from 'react-dnd-touch-backend';
import { DndProvider } from 'react-dnd';
import { ConnectedRouter } from 'connected-react-router';
import { theme } from 'src/styles';
import { makeStore } from 'src/modules/store/store';
import { makeHistory } from 'src/modules/navigation/store';
import handler from './index';

/* eslint-disable @typescript-eslint/no-explicit-any */

describe('image-selection', () => {
  const expectId = expect.any(String);

  const emptyQuestion = {
    type: 'images',
    id: expectId,
    title: '',
    description: '',
    answers: [
      {
        id: expectId,
        image: '',
        touched: true,
        value: '',
      },
      {
        id: expectId,
        image: '',
        touched: true,
        value: '',
      },
      {
        id: expectId,
        image: '',
        touched: false,
        value: '',
      },
    ],
    options: {
      optional: false,
      imageLabels: false,
      multiSelect: false,
    },
  };

  const notEmptyQuestion = {
    id: 'id',
    type: 'images',
    title: 'Title',
    description: 'Description',
    answers: [
      { id: 'survey_question2', value: 'Label 1', image: 'https://picsum.photos/200', touched: true },
      { id: 'survey_question3', value: 'Label 2', image: 'https://picsum.photos/200', touched: true },
      { id: 'survey_question4', value: '', image: '', touched: false },
    ],
    options: {
      optional: false,
      imageLabels: true,
      multiSelect: false,
    },
  };

  const taskItemFromApi = {
    type: 'CHOICE',
    tag: 'IMAGE',
    id: 'id',
    title: 'Question Title',
    explanation: 'Question Description',
    required: true,
    itemProperties: {
      options: [
        { label: 'Label 1', value: '200' },
        { label: 'Label 2', value: '200' },
      ],
    },
  };

  it('type should be images', async () => {
    expect(handler.type).toEqual('images');
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
      answers: [],
    };
    expect(handler.convertFromOtherType(qi as any)).toEqual({
      ...qi,
      type: 'images',
      options: {
        optional: false,
        imageLabels: false,
        multiSelect: false,
      },
      answers: [
        {
          id: expectId,
          image: '',
          touched: true,
          value: '',
        },
        {
          id: expectId,
          image: '',
          touched: true,
          value: '',
        },
        {
          id: expectId,
          image: '',
          touched: false,
          value: '',
        },
      ],
    });
  });

  it('[NEGATIVE] convertFromOtherType should return empty question', async () => {
    expect(handler.convertFromOtherType({} as any)).toEqual({
      type: 'images',
      id: undefined,
      title: undefined,
      description: undefined,
      answers: [
        {
          id: expectId,
          image: '',
          touched: true,
          value: '',
        },
        {
          id: expectId,
          image: '',
          touched: true,
          value: '',
        },
        {
          id: expectId,
          image: '',
          touched: false,
          value: '',
        },
      ],
      options: {
        optional: false,
        imageLabels: false,
        multiSelect: false,
      },
    });
  });

  it('fromApi should return converted question', async () => {
    expect(handler.fromApi(taskItemFromApi as any)).toEqual({
      type: 'images',
      id: expectId,
      title: 'Question Title',
      description: 'Question Description',
      answers: [
        {
          id: expectId,
          value: 'Label 1',
          touched: true,
          image: '200',
        },
        {
          id: expectId,
          value: 'Label 2',
          touched: true,
          image: '200',
        },
        {
          id: expectId,
          value: '',
          image: '',
          touched: false,
        },
      ],
      options: {
        optional: false,
        imageLabels: true,
        multiSelect: false,
      },
    });
  });

  it('[NEGATIVE] fromApi should return undefined if question type is not an image', async () => {
    expect(
      handler.fromApi({
        ...taskItemFromApi,
        type: '',
        tag: '',
      } as any)
    ).toBeUndefined();
  });

  it('toApi should return converted question', async () => {
    expect(handler.toApi(notEmptyQuestion as any)).toEqual({
      id: expectId,
      type: 'CHOICE',
      tag: 'IMAGE',
      title: 'Title',
      explanation: 'Description',
      required: true,
      itemProperties: {
        options: [{ label: 'Label 1', value: '200' }, { label: 'Label 2', value: '200' },],
      },
    });
  });

  it('[NEGATIVE] toApi should not crash with empty data', async () => {
    expect(handler.toApi({} as any)).toEqual({
      id: undefined,
      type: 'CHOICE',
      tag: 'IMAGE',
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

    const history: ReturnType<typeof makeHistory> = makeHistory();
    const store: ReturnType<typeof makeStore> = makeStore(history);

    const { baseElement } = render(
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          <ConnectedRouter history={history}>
            <DndProvider backend={TouchBackend} options={{ enableMouseEvents: true }}>
              {handler.renderEditorContent({
                surveyId: '',
                question: notEmptyQuestion as any,
                onChange,
                confirmOptionRemoval,
              })}
            </DndProvider>
          </ConnectedRouter>
        </Provider>
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
