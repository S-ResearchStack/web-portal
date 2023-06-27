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
import { EducationList, educationListDataSelector, scratchSourceUrl } from '../educationList.slice';
import PublishEducationalContent from './PublishEducationalContent';
import {
  EducationEditorState,
  PublicationContentSection,
  PublicationItem,
} from './educationEditor.slice';

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

const educationContentItem: PublicationContentSection = {
  id: 'education-content-test-id',
  children: [
    {
      id: 'text-card',
      type: 'TEXT',
      text: 'test-text',
      sequence: 0,
    },
  ],
};

const publication: PublicationItem = {
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
  data: publication,
};

const educationList: EducationList = {
  drafts: [{ ...publication }],
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
        'studyManagement/educationEditor': { ...educationEditState },
        'studyManagement/educationList': {
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
    const { getByTestId } = await act(() => render(getComponent()));

    expect(getByTestId('publish-educational-content')).toBeInTheDocument();

    const dropdown = getByTestId('value-item');
    expect(dropdown).toBeInTheDocument();
    await userEvent.click(dropdown);

    const acceptButton = getByTestId('accept-button');
    await userEvent.click(acceptButton);

    expect(educationListDataSelector(store.getState())?.drafts.length).toBe(0);
    expect(educationListDataSelector(store.getState())?.published.length).toBe(1);
    expect(educationListDataSelector(store.getState())?.published[0].publishedAt).toEqual(
      expect.any(Number)
    );
  });

  it('[NEGATIVE] should call onClose cb', async () => {
    const { getByTestId } = await act(() => render(getComponent()));

    const declineButton = getByTestId('decline-button');

    await userEvent.click(declineButton);

    expect(onClose).toHaveBeenCalled();
  });
});
