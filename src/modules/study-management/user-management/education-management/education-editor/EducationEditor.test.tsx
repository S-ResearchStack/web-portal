import React from 'react';
import { Provider } from 'react-redux';
import { TouchBackend } from 'react-dnd-touch-backend';
import { DndProvider } from 'react-dnd';
import { act, render, screen, waitFor } from '@testing-library/react';
import { ConnectedRouter } from 'connected-react-router';

import { ThemeProvider } from 'styled-components';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import { makeHistory } from 'src/modules/navigation/store';
import theme from 'src/styles/theme';
import { userEvent } from '@storybook/testing-library';
import { createTestStore } from 'src/modules/store/testing';
import { StudiesState } from 'src/modules/studies/studies.slice';
import EducationEditor from './EducationEditor';
import {
  educationEditorSlice,
  EducationEditorState,
  PublicationContentSection,
  PublicationItem,
} from './educationEditor.slice';

const publicationImageItemId = 'test-id-1';
const publicationTextItemId = 'test-id-2';

const educationContentItem: PublicationContentSection = {
  id: 'section-id',
  children: [
    {
      id: publicationImageItemId,
      type: 'IMAGE',
      sequence: 1,
      images: [{ id: 'test-image', caption: '', image: '1' }],
    },
    {
      id: publicationTextItemId,
      type: 'TEXT',
      text: 'test-text',
      sequence: 0,
    },
  ],
};

const educationEditData: PublicationItem = {
  studyId: 'test',
  id: 'test',
  revisionId: 0,
  title: 'test',
  status: 'DRAFT',
  source: 'SCRATCH',
  educationContent: [educationContentItem],
};

const educationEditState: EducationEditorState = {
  isSaving: false,
  isLoading: false,
  data: educationEditData,
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

describe('EducationEditor', () => {
  let store: ReturnType<typeof createTestStore>;
  let history: ReturnType<typeof makeHistory>;

  beforeEach(() => {
    history = makeHistory();
    store = createTestStore(
      {
        studies: studiesState,
        'studyManagement/educationEditor': { ...educationEditState },
      },
      history
    );
  });

  const getComponent = () => (
    <ThemeProvider theme={theme}>
      <Provider store={store}>
        <ConnectedRouter history={history}>
          <DndProvider backend={TouchBackend} options={{ enableMouseEvents: true }}>
            <EducationEditor />
          </DndProvider>
        </ConnectedRouter>
      </Provider>
    </ThemeProvider>
  );

  it('should render', async () => {
    const renderResult = await act(async () => render(getComponent()));

    const { rerender } = renderResult;

    // type something
    const educationItem = await screen.findByTestId('survey-editor');
    expect(educationItem).toBeInTheDocument();
    const [description, category] = educationItem.querySelectorAll('input');
    expect(description).toBeInTheDocument();
    expect(category).toBeInTheDocument();
    await act(() => {
      userEvent.type(description, 'new descr');
      userEvent.type(category, 'new category');
    });

    // set errors and try to publish
    store.dispatch(
      educationEditorSlice.actions.setPublication({
        ...educationEditState.data,
        title: '',
      } as PublicationItem)
    );
    await act(async () => rerender(getComponent()));
    await act(async () => userEvent.click(await screen.findByTestId('editor-header-publish')));
    expect(screen.queryByTestId('publish-survey')).toBeNull();

    // open preview
    expect(screen.queryByTestId('preview')).toBeNull();
    userEvent.click(await screen.findByTestId('editor-header-preview'));
    expect(screen.queryByTestId('preview')).not.toBeNull();
    expect(screen.queryByTestId('editor-header-preview')).toBeNull();
  });

  it('should remove publication', async () => {
    await act(async () => render(getComponent()));

    expect(
      store.getState()['studyManagement/educationEditor'].data?.educationContent[0]?.children.length
    ).toBe(2);

    const removeButton = await screen.findByTestId(
      `remove-publication-button-${publicationImageItemId}`
    );
    await act(async () => {
      userEvent.click(removeButton);
    });

    const modalAcceptButton = await screen.findByTestId('accept-button');
    expect(modalAcceptButton).toBeInTheDocument();
    await act(async () => {
      userEvent.click(modalAcceptButton);
    });

    await waitFor(() =>
      expect(store.getState()['studyManagement/educationEditor'].isSaving).toBeFalsy()
    );

    expect(
      store.getState()['studyManagement/educationEditor'].data?.educationContent[0]?.children.length
    ).toBe(1);
  });

  it('[NEGATIVE] should not remove publication if it is last', async () => {
    store = createTestStore(
      {
        studies: studiesState,
        'studyManagement/educationEditor': {
          isSaving: false,
          isLoading: false,
          data: {
            ...educationEditData,
            educationContent: [
              {
                ...educationContentItem,
                children: [educationContentItem.children[0]],
              },
            ],
          },
        },
      },
      history
    );

    await act(async () => {
      render(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <DndProvider backend={TouchBackend} options={{ enableMouseEvents: true }}>
                <EducationEditor />
              </DndProvider>
            </ConnectedRouter>
          </Provider>
        </ThemeProvider>
      );
    });

    expect(
      store.getState()['studyManagement/educationEditor'].data?.educationContent[0]?.children.length
    ).toBe(1);

    expect(
      await screen.queryByTestId(`remove-publication-button-${publicationTextItemId}`)
    ).toBeNull();
  });

  it('should add new publication', async () => {
    await act(async () => render(getComponent()));

    expect(
      store
        .getState()
        ['studyManagement/educationEditor'].data?.educationContent[0]?.children.filter(
          (p) => p.type === 'TEXT'
        ).length
    ).toBe(1);

    expect(
      store
        .getState()
        ['studyManagement/educationEditor'].data?.educationContent[0]?.children.filter(
          (p) => p.type === 'IMAGE'
        ).length
    ).toBe(1);

    const addTextItemButton = await screen.findByTestId('add-text-publication');
    const addImageItemButton = await screen.findByTestId('add-image-publication');

    await act(async () => {
      userEvent.click(addTextItemButton);
    });

    await waitFor(() =>
      expect(store.getState()['studyManagement/educationEditor'].isSaving).toBeFalsy()
    );

    expect(
      store
        .getState()
        ['studyManagement/educationEditor'].data?.educationContent[0]?.children.filter(
          (p) => p.type === 'TEXT'
        ).length
    ).toBe(2);

    await act(async () => {
      userEvent.click(addImageItemButton);
    });
    expect(
      store
        .getState()
        ['studyManagement/educationEditor'].data?.educationContent[0]?.children.filter(
          (p) => p.type === 'TEXT'
        ).length
    ).toBe(2);
  });

  it('[NEGATIVE] should not add new publication if education type is not SCRATCH', async () => {
    store = createTestStore(
      {
        studies: studiesState,
        'studyManagement/educationEditor': {
          isSaving: false,
          isLoading: false,
          data: {
            ...educationEditData,
            source: 'VIDEO',
          },
        },
      },
      history
    );

    await act(async () => {
      render(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <DndProvider backend={TouchBackend} options={{ enableMouseEvents: true }}>
                <EducationEditor />
              </DndProvider>
            </ConnectedRouter>
          </Provider>
        </ThemeProvider>
      );
    });

    expect(await screen.queryByTestId('add-text-publication')).toBeNull();
    expect(await screen.queryByTestId('add-image-publication')).toBeNull();
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
                <EducationEditor />
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

  it('[NEGATIVE] should set errors', async () => {
    const { getByTestId } = await act(async () => render(getComponent()));

    const categoryInput = getByTestId('publication-category');

    expect(categoryInput).toBeInTheDocument();
    expect(categoryInput).toHaveTextContent('');

    const publishButton = getByTestId('editor-header-publish');

    userEvent.click(publishButton);

    expect(store.getState()['studyManagement/educationEditor'].errors?.category.empty).toBeTrue();
    expect(store.getState()['studyManagement/educationEditor'].errors?.attachment.empty).toBeTrue();
  });
});
