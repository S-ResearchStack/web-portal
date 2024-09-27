import React from 'react';
import { Provider } from 'react-redux';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import { ConnectedRouter } from 'connected-react-router';
import { act, getByText, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { createTestStore } from 'src/modules/store/testing';
import { StudiesState } from 'src/modules/studies/studies.slice';
import theme from 'src/styles/theme';
import { makeHistory } from 'src/modules/navigation/store';
import { ThemeProvider } from 'styled-components/';
import { EducationalContentList } from 'src/modules/education-management/educationList.slice';
import PublishEducationalContent from './PublishEducation';
import {
  EducationEditorState,
  EducationItem,
  PublicationContentSection
} from './educationEditor.slice';
import { publishEducationSelector } from './publishEducation.slice';
import { EducationalContentType } from 'src/modules/api';

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

const educationList: EducationalContentList = {
  drafts: [{ ...educationEditData }],
  published: [],
};

describe('PublishEducationalContent', () => {
  const onClose = jest.fn();

  let store: ReturnType<typeof createTestStore>;
  let history: ReturnType<typeof makeHistory>;

  const getComponent = () => (
    <ThemeProvider theme={theme}>
      <Provider store={store}>
        <ConnectedRouter history={history}>
          <PublishEducationalContent open onClose={onClose} />
        </ConnectedRouter>
      </Provider>
    </ThemeProvider>
  );

  beforeEach(() => {
    history = makeHistory();
    store = createTestStore(
      {
        studies: studiesState,
        'education/publishEducation': {
          isSending: false,
          error: undefined,
        },
        'education/educationEditor': { ...educationEditState },
        'education/educationList': {
          isLoading: false,
          fetchArgs: null,
          prevFetchArgs: null,
          data: { ...educationList },
        },
      },
      history
    );
  });

  it('should render if open', async () => {
    const { baseElement, getByTestId } = await act(() => render(getComponent()));

    expect(getByTestId('publish-educational-content')).toBeInTheDocument();
    expect(getByText(baseElement, 'Publish Educational Content')).toBeInTheDocument();
  });

  it('[NEGATIVE] should not render if close', async () => {
    const { getByTestId } = await act(() =>
      render(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <PublishEducationalContent open={false} onClose={onClose} />
            </ConnectedRouter>
          </Provider>
        </ThemeProvider>
      )
    );

    const fade = getByTestId('backdrop');

    expect(fade).toBeInTheDocument();
    expect(fade.children.length).toBe(0);
  });

  it('should publish educational content', async () => {
    const { getByTestId, getAllByTestId } = await act(() => render(getComponent()));

    expect(getByTestId('publish-educational-content')).toBeInTheDocument();

    const datePicker = getByTestId('date-picker') as Element;
    expect(datePicker).toBeInTheDocument();
    await userEvent.click(datePicker);

    const dropdown = getByTestId('value-item');
    expect(dropdown).toBeInTheDocument();
    await userEvent.click(dropdown);

    const acceptButton = getByTestId('accept-button');
    await userEvent.click(acceptButton);

    expect(publishEducationSelector(store.getState()).error).toBeUndefined();
  });

  it('[NEGATIVE] should call onClose cb', async () => {
    const { getByTestId } = await act(() => render(getComponent()));

    const declineButton = getByTestId('decline-button');

    await userEvent.click(declineButton);

    expect(onClose).toHaveBeenCalled();
  });
});
