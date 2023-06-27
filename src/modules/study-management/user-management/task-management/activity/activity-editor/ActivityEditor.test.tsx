import React from 'react';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import { makeHistory } from 'src/modules/navigation/store';
import { act, render, screen } from '@testing-library/react';
import theme from 'src/styles/theme';
import { ThemeProvider } from 'styled-components/';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { TouchBackend } from 'react-dnd-touch-backend';
import { DndProvider } from 'react-dnd';
import { userEvent } from '@storybook/testing-library';
import { createTestStore } from 'src/modules/store/testing';
import { StudiesState } from 'src/modules/studies/studies.slice';
import { activityEditorSlice, ActivityEditorState } from './activityEditor.slice';
import { ActivityTaskItem } from './activityConversion';
import ActivityEditor from './ActivityEditor';

const activityEditState: ActivityEditorState = {
  isSaving: false,
  isLoading: false,
  data: {
    studyId: 'test',
    id: 'test',
    revisionId: 0,
    title: 'test',
    description: 'test',
    type: 'GAIT_AND_BALANCE',
    items: [
      {
        id: 'section-id',
        children: [
          {
            id: 'test-single',
            title: 'test-single',
            description: '',
            value: {
              transcription: 'test-transcription',
              completionDescription: 'test-description',
              completionTitle: 'test-title',
            },
          },
        ],
      },
    ],
  },
};

const studiesState: StudiesState = {
  isLoading: false,
  studies: [
    {
      id: 'test',
      name: 'test',
      color: 'primary',
      createdAt: 1652648400000,
    },
  ],
  selectedStudyId: 'test',
};

describe('ActivityEditor', () => {
  jest.setTimeout(60000);

  let store: ReturnType<typeof createTestStore>;
  let history: ReturnType<typeof makeHistory>;

  beforeEach(() => {
    history = makeHistory();
    store = createTestStore(
      {
        studies: studiesState,
        'studyManagement/activityEditor': { ...activityEditState },
      },
      history
    );
  });

  it('should render', async () => {
    const getComponent = () => (
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          <ConnectedRouter history={history}>
            <DndProvider backend={TouchBackend} options={{ enableMouseEvents: true }}>
              <ActivityEditor />
            </DndProvider>
          </ConnectedRouter>
        </Provider>
      </ThemeProvider>
    );
    const renderResult = await act(async () => render(getComponent()));

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const { rerender } = renderResult;

    // check item and type something
    const activity = await screen.findByTestId('survey-editor');
    expect(activity).toBeInTheDocument();
    const [description, completionTitle, completionDescription] =
      activity.querySelectorAll('input');
    expect(description).toBeInTheDocument();
    expect(completionTitle).toBeInTheDocument();
    expect(completionDescription).toBeInTheDocument();
    await act(() => {
      userEvent.type(description, 'new descr');
      userEvent.type(completionTitle, 'new completion title');
      userEvent.type(completionDescription, 'new completion description');
    });

    // set errors and try to publish
    store.dispatch(
      activityEditorSlice.actions.setActivityTask({
        ...activityEditState.data,
        items: [
          {
            ...activityEditState.data?.items[0],
            children: [
              {
                ...activityEditState.data?.items[0].children[0],
                value: {
                  completionTitle: '',
                  completionDescription: '',
                  transcription: '',
                },
              },
            ],
          },
        ],
      } as ActivityTaskItem)
    );
    await act(async () => rerender(getComponent()));
    await act(async () => userEvent.click(await screen.findByTestId('editor-header-publish')));
    expect(screen.queryByTestId('publish-survey')).toBeNull();

    // open preview
    expect(screen.queryByTestId('preview')).toBeNull();
    await act(async () => userEvent.click(await screen.findByTestId('editor-header-preview')));
    expect(screen.queryByTestId('preview')).not.toBeNull();
    expect(screen.queryByTestId('editor-header-preview')).toBeNull();
  });

  it('[NEGATIVE] should render with empty store', async () => {
    let renderResult: ReturnType<typeof render>;
    store = createTestStore({}, history);

    await act(async () => {
      renderResult = render(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <DndProvider backend={TouchBackend} options={{ enableMouseEvents: true }}>
                <ActivityEditor />
              </DndProvider>
            </ConnectedRouter>
          </Provider>
        </ThemeProvider>
      );
    });

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const { baseElement } = renderResult;
    expect(baseElement).toBeInTheDocument();
  });
});
