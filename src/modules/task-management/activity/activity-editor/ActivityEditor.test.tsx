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
import { ActivityEditorState } from './activityEditor.slice';
import ActivityEditor from './ActivityEditor';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn().mockReturnValue({ activityType: 'GAIT_AND_BALANCE' })
}));

const activityEditState: ActivityEditorState = {
  isLoading: false,
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
  jest.setTimeout(240000);
  
  let store: ReturnType<typeof createTestStore>;
  let history: ReturnType<typeof makeHistory>;

  beforeEach(() => {
    history = makeHistory();
    store = createTestStore(
      {
        'studies': studiesState,
        'task/activityEditor': { ...activityEditState },
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
    await act(async () => render(getComponent()));

    // check item and type something
    const activity = await screen.findByTestId('editor');
    expect(activity).toBeInTheDocument();

    const publishButton = await screen.findByTestId('editor-header-publish');

    const [title, description] = await activity.querySelectorAll('input');
    expect(title).toBeInTheDocument();
    expect(description).toBeInTheDocument();
    await act(() => {
      userEvent.clear(title);
      userEvent.clear(description);
    });

    await act(async () => userEvent.click(publishButton));
    expect(screen.queryByTestId('publish-task')).toBeNull();

    await act(() => {
      userEvent.type(title, 'Gait & Balance');
      userEvent.type(description, 'This activity collects measurements related to walking and standing.');
    });

    await act(async () => userEvent.click(publishButton));
    expect(screen.queryByTestId('publish-task')).toBeInTheDocument();
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
