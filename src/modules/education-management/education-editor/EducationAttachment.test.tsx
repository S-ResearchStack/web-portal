import React from 'react';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import 'jest-styled-components';
import '@testing-library/jest-dom';
import { createTestStore } from 'src/modules/store/testing';
import { StudiesState } from 'src/modules/studies/studies.slice';
import theme from 'src/styles/theme';
import { makeHistory } from 'src/modules/navigation/store';
import { ThemeProvider } from 'styled-components/';
import EducationAttachment, { MAX_FILE_SIZE_BYTES } from './EducationAttachment';
import {
  EducationEditorState,
  EducationItem,
  PublicationContentSection
} from './educationEditor.slice';
import { EducationalContentType } from 'src/modules/api';

const scratchSourceUrl = 'https://picsum.photos/500';
const pdfSourceUrl = 'https://cdn.filestackcontent.com/wcrjf9qPTCKXV3hMXDwK';
const videoSourceUrl = 'https://ucsf-eureka-static-test.s3.us-east-2.amazonaws.com/flower.mp4';

const studyId = 'test-study';
const publicationTextItemId = 'test-id-text';
const publicationImageItemId = 'test-id-image';
const publicationVideoItemId = 'test-id-video';

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
          id: publicationVideoItemId,
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
  id: 'test-id',
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

  const type = EducationalContentType.SCRATCH;
  const attachment = pdfSourceUrl;
  const testId = 'education-attachment-SCRATCH';

  let store: ReturnType<typeof createTestStore>;
  let history: ReturnType<typeof makeHistory>;

  beforeEach(() => {
    history = makeHistory();
    store = createTestStore(
      {
        studies: studiesState,
        'education/educationEditor': { ...educationEditState },
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
        attachment: { url: pdfSourceUrl, path: '' },
        type: 'PDF' as EducationalContentType,
      },
    };
    store = createTestStore(
      {
        studies: studiesState,
        'education/educationEditor': { ...educationEditScratchSourceState },
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
                type={EducationalContentType.SCRATCH}
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
        attachment: { url: videoSourceUrl, path: '' },
        type: 'VIDEO' as EducationalContentType,
      },
    };

    store = createTestStore(
      {
        studies: studiesState,
        'education/educationEditor': { ...educationEditVideoSourceState },
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
                type={'VIDEO' as EducationalContentType}
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
                type={EducationalContentType.SCRATCH}
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
                type={EducationalContentType.SCRATCH}
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
