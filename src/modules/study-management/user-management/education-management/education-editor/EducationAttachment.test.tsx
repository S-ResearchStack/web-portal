import React from 'react';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import 'jest-styled-components';
import '@testing-library/jest-dom';
import { PublicationContentSource } from 'src/modules/api';
import { createTestStore } from 'src/modules/store/testing';
import { StudiesState } from 'src/modules/studies/studies.slice';
import theme from 'src/styles/theme';
import { makeHistory } from 'src/modules/navigation/store';
import { ThemeProvider } from 'styled-components/';
import EducationAttachment, { MAX_FILE_SIZE_BYTES } from './EducationAttachment';
import {
  EducationEditorState,
  PublicationContentSection,
  PublicationItem,
} from './educationEditor.slice';
import { pdfSourceUrl, scratchSourceUrl, videoSourceUrl } from '../educationList.slice';

const publicationImageItemId = 'test-id-1';
const publicationTextItemId = 'test-id-2';

const educationContentItem: PublicationContentSection = {
  id: 'education-content-test-id',
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
  id: 'test-id',
  revisionId: 0,
  title: 'test',
  status: 'DRAFT',
  source: 'SCRATCH',
  attachment: scratchSourceUrl,
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
      createdAt: 1684505658637,
    },
  ],
  selectedStudyId: 'test',
};

const poster = {
  value: scratchSourceUrl,
  loading: false,
};

jest.mock('react-use/lib/useAsync', () => ({
  __esModule: true,
  default: () =>
    Promise.resolve({
      poster,
    }),
}));

describe('EducationAttachment', () => {
  const onChange = jest.fn();

  const type: PublicationContentSource = 'SCRATCH';
  const attachment = pdfSourceUrl;
  const testId = 'education-attachment-SCRATCH';

  let store: ReturnType<typeof createTestStore>;
  let history: ReturnType<typeof makeHistory>;

  beforeEach(() => {
    history = makeHistory();
    store = createTestStore(
      {
        studies: studiesState,
        'studyManagement/educationEditor': { ...educationEditState },
        fileUpload: {
          'attachment-upload-key': {
            uses: 1,
            isSending: false,
          },
        },
      },
      history
    );
  });

  it('should render', async () => {
    const { getByTestId } = await act(() =>
      render(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <EducationAttachment attachment={attachment} type={type} onChange={onChange} />
            </ConnectedRouter>
          </Provider>
        </ThemeProvider>
      )
    );

    expect(getByTestId(testId)).toBeInTheDocument();
    expect(getByTestId('label-image')).toBeInTheDocument();
  });

  it('should render with different content types', async () => {
    const educationEditScratchSourceState = {
      ...educationEditState,
      data: {
        ...educationEditData,
        attachment: pdfSourceUrl,
        source: 'PDF' as PublicationContentSource,
      },
    };
    store = createTestStore(
      {
        studies: studiesState,
        'studyManagement/educationEditor': { ...educationEditScratchSourceState },
      },
      history
    );

    const { rerender } = await act(() =>
      render(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <EducationAttachment
                attachment={pdfSourceUrl}
                type={'SCRATCH' as PublicationContentSource}
                onChange={onChange}
              />
            </ConnectedRouter>
          </Provider>
        </ThemeProvider>
      )
    );

    const scratchAttachment = await screen.queryByTestId('education-attachment-SCRATCH');
    expect(scratchAttachment).not.toBeNull();

    const educationEditVideoSourceState = {
      ...educationEditState,
      data: {
        ...educationEditData,
        attachment: videoSourceUrl,
        source: 'VIDEO' as PublicationContentSource,
      },
    };

    store = createTestStore(
      {
        studies: studiesState,
        'studyManagement/educationEditor': { ...educationEditVideoSourceState },
      },
      history
    );

    jest.mock('react-use/lib/useAsync', () => ({
      __esModule: true,
      default: () =>
        Promise.resolve({
          poster: {
            value: videoSourceUrl,
            loading: false,
          },
        }),
    }));

    await act(async () =>
      rerender(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <EducationAttachment
                attachment={videoSourceUrl}
                type={'VIDEO' as PublicationContentSource}
                onChange={onChange}
              />
            </ConnectedRouter>
          </Provider>
        </ThemeProvider>
      )
    );

    const videoAttachment = await screen.queryByTestId('education-attachment-VIDEO');
    expect(videoAttachment).not.toBeNull();
  });

  it('should upload file', async () => {
    const { getByTestId } = await act(() =>
      render(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <EducationAttachment
                loading={false}
                attachment={attachment}
                type="SCRATCH"
                onChange={onChange}
              />
            </ConnectedRouter>
          </Provider>
        </ThemeProvider>
      )
    );

    const fileInput = getByTestId('file-input');
    expect(fileInput).toBeInTheDocument();

    const testFile = new File(['test'], 'test-file.png');

    fireEvent.change(fileInput, {
      target: { files: [testFile] },
    });

    expect(store.getState().fileUpload['attachment-upload-key'].isSending).toBeTrue();
  });

  it('[NEGATIVE] should not upload to big file', async () => {
    const { getByTestId } = await act(() =>
      render(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <EducationAttachment
                loading={false}
                attachment={attachment}
                type="SCRATCH"
                onChange={onChange}
              />
            </ConnectedRouter>
          </Provider>
        </ThemeProvider>
      )
    );

    const fileInput = getByTestId('file-input');
    expect(fileInput).toBeInTheDocument();

    const testFile = new File(['heavyFile'], 'heavy-test-file.png');
    Object.defineProperty(testFile, 'size', { value: MAX_FILE_SIZE_BYTES + 1 });

    fireEvent.change(fileInput, {
      target: { files: [testFile] },
    });

    expect(store.getState().fileUpload['attachment-upload-key'].isSending).not.toBeTrue();
  });

  it('should render loading state', async () => {
    const { getByTestId } = await act(() =>
      render(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <EducationAttachment
                type={type}
                attachment={attachment}
                onChange={onChange}
                loading
              />
            </ConnectedRouter>
          </Provider>
        </ThemeProvider>
      )
    );

    expect(getByTestId(testId)).toBeInTheDocument();
    expect(getByTestId('loading')).toBeInTheDocument();
  });

  it('[NEGATIVE] should render error state', async () => {
    const { getByTestId } = await act(() =>
      render(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <EducationAttachment type={type} attachment={attachment} onChange={onChange} error />
            </ConnectedRouter>
          </Provider>
        </ThemeProvider>
      )
    );

    const backdrop = getByTestId('backdrop');

    expect(getByTestId(testId)).toBeInTheDocument();
    expect(backdrop).toHaveStyle('opacity: 1');

    await userEvent.click(backdrop);
    expect(onChange).not.toHaveBeenCalled();
  });
});
