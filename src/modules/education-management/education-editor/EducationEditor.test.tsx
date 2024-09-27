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
  EducationItem,
  PublicationContentSection
} from './educationEditor.slice';
import { EducationalContentType, ScratchContent } from 'src/modules/api';

const studyId = 'test-study';
const publicationTextItemId = 'test-id-text';
const publicationImageItemId = 'test-id-image';

const educationContentItem: PublicationContentSection = {
  id: 'section-id',
  children: [
    {
      id: 'test-image-1',
      description: '',
      coverImage: 'SCRATCH_1',
      blocks: [
        {
          id: publicationTextItemId,
          type: "TEXT",
          sequence: 0,
          text: "text"
        },
      ]
    },
  ],
};

const educationContentItems: PublicationContentSection = {
  id: 'section-id',
  children: [
    {
      id: 'test-image-1',
      description: '',
      coverImage: 'SCRATCH_1',
      blocks: [
        {
          id: publicationTextItemId,
          type: "TEXT",
          sequence: 0,
          text: "text"
        },
        {
          id: publicationImageItemId,
          type: "IMAGE",
          sequence: 1,
          images: [
            {
              id: "education264",
              url: "https://www.w3schools.com/css/img_lights.jpg",
              caption: "",
              path: "b48d43b6-0fd2-455d-8402-5579ca0f7c15",
              touched: true
            },
            {
              id: "education300",
              url: "",
              path: "",
              caption: "",
              touched: false
            }
          ]
        },
        {
          id: "education271",
          type: "VIDEO",
          sequence: 2,
          url: "https://www.w3schools.com/css/img_lights.jpg",
          text: "",
          path: "35ce8879-2c18-4f6f-9d6b-156e5bce1958",
          touched: true
        }
      ]
    },
  ],
};

const educationEditData: EducationItem = {
  studyId: studyId,
  id: '1',
  type: EducationalContentType.SCRATCH,
  status: 'DRAFT',
  title: '',
  category: '',
  content: [educationContentItems],
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
      id: studyId,
      name: 'test',
      color: 'primary',
      createdAt: 1652648400000,
    },
  ],
  selectedStudyId: studyId,
};

describe('EducationEditor', () => {
  let store: ReturnType<typeof createTestStore>;
  let history: ReturnType<typeof makeHistory>;

  beforeEach(() => {
    history = makeHistory();
    store = createTestStore(
      {
        studies: studiesState,
        'education/educationEditor': { ...educationEditState },
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
    const educationItem = await screen.findByTestId('editor');
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
      educationEditorSlice.actions.setEducation({
        ...educationEditState.data,
        title: '',
      } as EducationItem)
    );
    await act(async () => rerender(getComponent()));
    await act(async () => userEvent.click(await screen.findByTestId('editor-header-publish')));
    expect(screen.queryByTestId('publish-task')).toBeNull();
  });

  it('should remove publication', async () => {
    await act(async () => render(getComponent()));

    expect(
      store.getState()['education/educationEditor'].data?.content[0]?.children.length
    ).toBe(1);
    expect(
      (store.getState()['education/educationEditor'].data?.content[0]?.children[0] as ScratchContent).blocks.length
    ).toBe(3);

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
      expect(store.getState()['education/educationEditor'].isSaving).toBeFalsy()
    );

    expect(
      (store.getState()['education/educationEditor'].data?.content[0]?.children[0] as ScratchContent).blocks.length
    ).toBe(2);
  });

  it('[NEGATIVE] should not remove publication if it is last', async () => {
    store = createTestStore(
      {
        studies: studiesState,
        'education/educationEditor': {
          isSaving: false,
          isLoading: false,
          data: {
            ...educationEditData,
            content: [educationContentItem],
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
      (store.getState()['education/educationEditor'].data?.content[0]?.children[0] as ScratchContent).blocks.length
    ).toBe(1);

    expect(
      await screen.queryByTestId(`remove-publication-button-${publicationTextItemId}`)
    ).toBeNull();
  });

  it('should add new publication', async () => {
    await act(async () => render(getComponent()));

    expect(
      (store
        .getState()
      ['education/educationEditor'].data?.content[0]?.children[0] as ScratchContent).blocks.filter(
        (p) => p.type === 'TEXT'
      ).length
    ).toBe(1);

    expect(
      (store
        .getState()
      ['education/educationEditor'].data?.content[0]?.children[0] as ScratchContent).blocks.filter(
        (p) => p.type === 'IMAGE'
      ).length
    ).toBe(1);

    expect(
      (store
        .getState()
      ['education/educationEditor'].data?.content[0]?.children[0] as ScratchContent).blocks.filter(
        (p) => p.type === 'VIDEO'
      ).length
    ).toBe(1);

    const addTextItemButton = await screen.findByTestId('add-text-publication');
    const addImageItemButton = await screen.findByTestId('add-image-publication');
    const addVideoItemButton = await screen.findByTestId('add-video-publication');

    await act(async () => {
      userEvent.click(addTextItemButton);
    });

    expect(
      (store
        .getState()
      ['education/educationEditor'].data?.content[0]?.children[0] as ScratchContent).blocks.filter(
        (p) => p.type === 'TEXT'
      ).length
    ).toBe(2);

    await act(async () => {
      userEvent.click(addImageItemButton);
    });

    expect(
      (store
        .getState()
      ['education/educationEditor'].data?.content[0]?.children[0] as ScratchContent).blocks.filter(
        (p) => p.type === 'IMAGE'
      ).length
    ).toBe(2);

    await act(async () => {
      userEvent.click(addVideoItemButton);
    });

    expect(
      (store
        .getState()
      ['education/educationEditor'].data?.content[0]?.children[0] as ScratchContent).blocks.filter(
        (p) => p.type === 'VIDEO'
      ).length
    ).toBe(2);
  });

  it('[NEGATIVE] should not add new publication if education type is not SCRATCH', async () => {
    store = createTestStore(
      {
        studies: studiesState,
        'education/educationEditor': {
          isSaving: false,
          isLoading: false,
          data: {
            ...educationEditData,
            type: EducationalContentType.VIDEO,
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
    expect(await screen.queryByTestId('add-video-publication')).toBeNull();
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

    expect(store.getState()['education/educationEditor'].data?.category).toBe('');
    expect(store.getState()['education/educationEditor'].errors?.category.empty).toBeTrue();
    expect(store.getState()['education/educationEditor'].errors?.attachment.empty).toBeTrue();
  });
});
