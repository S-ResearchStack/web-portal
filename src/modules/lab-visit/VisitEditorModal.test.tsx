import React from 'react';
import 'jest-styled-components';
import { act, render, RenderResult, screen, waitFor } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import '@testing-library/jest-dom';
import { userEvent } from '@storybook/testing-library';
import sleep from 'src/common/utils/waitFor';
import theme from 'src/styles/theme';
import { makeStore } from 'src/modules/store/store';
import { fetchStudies, StudiesState } from 'src/modules/studies/studies.slice';
import { format } from 'src/common/utils/datetime';
import { history } from 'src/modules/navigation/store';
import {
  LabVisitItem,
  labVisitParticipantSuggestionsSlice,
  labVisitResearcherSuggestionsSlice,
  labVisitSlice,
  MAX_DOCUMENT_SIZE,
  saveLabVisitSelector,
} from './labVisit.slice';
import { UPLOAD_SUCCESS_DELAY } from './VisitDocuments';
import VisitEditorModal from './VisitEditorModal';
import { createTestStore } from '../store/testing';

const studyId='studyId';
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

beforeAll(() => {
  Element.prototype.scrollTo = jest.fn();
});

const handleRequestClose = jest.fn();
const handleSave = jest.fn();
const visitData: LabVisitItem = {
  id: 1,
  subjectNumber: '',
  startTime: Date.now(),
  endTime: Date.now(),
  picId: '',
  note: '',
  filePaths: undefined,
};

describe('VisitEditorModal', () => {
  let store: ReturnType<typeof createTestStore>;
  store = createTestStore({studies: studiesState})
  it('should render', async () => {
    let result: RenderResult | undefined;

    await act(() => {
      result = render(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <VisitEditorModal
                data={visitData}
                onRequestClose={handleRequestClose}
                onSaved={handleSave}
              />
            </ConnectedRouter>
          </Provider>
        </ThemeProvider>
      );
    });

    await waitFor(
      () =>
        !!labVisitSlice.stateSelector(store.getState()).data &&
        !!labVisitParticipantSuggestionsSlice.stateSelector(store.getState()).data &&
        !!labVisitResearcherSuggestionsSlice.stateSelector(store.getState()).data
    );

    // Documents
    const documents = await screen.findByTestId('visit-documents');
    expect(documents).toBeInTheDocument();

    const oversizedFile = new File([''], 'oversized-file.png', { type: 'image/png' });
    Object.defineProperty(oversizedFile, 'size', { value: MAX_DOCUMENT_SIZE + 1 });

    const files = [oversizedFile, new File([''], 'file.png', { type: 'image/png' })];

    const documentsFileInput = await screen.findByTestId('visit-documents-files-input');
    expect(documentsFileInput).toBeInTheDocument();
    await act(() => userEvent.upload(documentsFileInput, files));

    // wait UI interactions after uploading
    await act(() => sleep(UPLOAD_SUCCESS_DELAY * 1.5));

    const documentList = await screen.findAllByTestId('visit-documents-item');
    expect(documentList.length).toEqual(files.filter((i) => i !== oversizedFile).length);

    // Participant Email
    const participantEmailInput = (await screen.findByTestId(
      'visit-participant-email'
    )) as HTMLInputElement;
    expect(participantEmailInput).toBeInTheDocument();

    const participantEmail = await store.getState()['labVisit/participantSuggestions'].data;
    const firstParticipantEmailValue = participantEmail ? participantEmail[0].subjectNumber : '0';
    userEvent.type(participantEmailInput, firstParticipantEmailValue);
    expect(participantEmailInput.value).toEqual(firstParticipantEmailValue);

    // PIC
    const picInput = (await screen.findByTestId('pic-input')) as HTMLInputElement;
    expect(picInput).toBeInTheDocument();

    const picList = store.getState()['labVisit/researcherSuggestions'].data;
    const firstPic = picList ? picList[0].name : 'First';
    const picValue = 'First';
    userEvent.type(picInput, picValue);
    expect(picInput.value).toEqual(picValue);

    // Notes
    const notesTextArea = (await screen.findByTestId(
      'visit-notes-textarea'
    )) as HTMLTextAreaElement;
    expect(notesTextArea).toBeInTheDocument();

    const notesValue = 'Hello world';
    userEvent.type(notesTextArea, notesValue);
    expect(notesTextArea.value).toEqual(notesValue);

    // Dates
    const expectDate = async (testIdSuffix: 'start' | 'end') => {
      // select date
      const startDate = await screen.findByTestId(`visit-date-${testIdSuffix}`);
      expect(startDate).toBeInTheDocument();

      await act(() => userEvent.click(startDate));
      const startDateCalendar = await screen.findByTestId('calendar-popover');
      expect(startDateCalendar).toBeInTheDocument();

      const firstAllowedStartDate = (
        await screen.findAllByTestId('calendar-popover-enabled-date')
      )[0];
      expect(firstAllowedStartDate).toBeInTheDocument();

      const firstAllowedStartDateValue = format(
        Number(firstAllowedStartDate.dataset.date as string),
        'EEEE, MMM dd, yyyy'
      );
      const firstAllowedStartDateLabel = startDate.querySelector('[data-testid="input-label"]');
      userEvent.click(firstAllowedStartDate);
      expect(firstAllowedStartDateLabel?.textContent).toEqual(firstAllowedStartDateValue);

      // select time
      const startTime = await screen.findByTestId(`visit-time-${testIdSuffix}`);
      expect(startTime).toBeInTheDocument();
      userEvent.click(startTime);

      const startTimeDropdown = await screen.findByTestId('menu-container');
      expect(startTimeDropdown).toBeInTheDocument();

      const firstAllowedStartTime = startTimeDropdown.querySelector(
        '[data-testid="menu-item"]:not([data-disabled="true"])'
      ) as HTMLElement;
      expect(firstAllowedStartTime).toBeInTheDocument();

      userEvent.click(firstAllowedStartTime);
      expect(startTime.textContent).toEqual(firstAllowedStartTime.textContent);
    };

    await expectDate('start');
    await expectDate('end');

    // Save
    const saveBtn = await screen.findByTestId('accept-button');
    expect(saveBtn).toBeInTheDocument();
    expect(saveBtn).not.toHaveAttribute('disabled');

    await act(() => userEvent.click(saveBtn));
    await waitFor(() => saveLabVisitSelector(store.getState()).isSending);
    await waitFor(() => !saveLabVisitSelector(store.getState()).isSending);

    expect(saveLabVisitSelector(store.getState()).error).toBeUndefined();
  });

  it('[NEGATIVE] should render with broken props', () => {
    const result = render(
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          <ConnectedRouter history={history}>
            <VisitEditorModal
              data={{}}
              onRequestClose={undefined as unknown as () => void}
              onSaved={undefined as unknown as () => void}
            />
          </ConnectedRouter>
        </Provider>
      </ThemeProvider>
    );

    expect(screen.getByText('Add In-Lab Visit')).toBeInTheDocument();
    expect(screen.getByText('Visit Information')).toBeInTheDocument();
    expect(screen.getByText('Subject number')).toBeInTheDocument();
    expect(screen.getByTestId('accept-button')).toBeInTheDocument();

  });

  it('should close modal when cancel add/edit lab-visit item', async () => {
    const result = await act(() =>
      render(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <VisitEditorModal
                data={visitData}
                onRequestClose={handleRequestClose}
                onSaved={handleSave}
              />
            </ConnectedRouter>
          </Provider>
        </ThemeProvider>
      )
    );

    //edit somethings
    const notesTextArea = (await screen.findByTestId(
      'visit-notes-textarea'
    )) as HTMLTextAreaElement;
    expect(notesTextArea).toBeInTheDocument();

    const notesValue = 'Hello world';
    userEvent.type(notesTextArea, notesValue);
    expect(notesTextArea.value).toEqual(notesValue);

    //close modal
    const cancelButton = await screen.findByTestId('decline-button');
    expect(cancelButton).toBeInTheDocument();
    await userEvent.click(cancelButton);

    //comfirm
    const confirmTitle = (await screen.findAllByTestId('modal-title'))[1];
    expect(confirmTitle).toHaveTextContent('Unsaved Changes');
    const leaveButton = (await screen.findAllByTestId('accept-button'))[1];
    await userEvent.click(leaveButton);
  });
});

describe('UploadDocuments', () => {
  let store: ReturnType<typeof createTestStore>;
  store = createTestStore({studies: studiesState})
  beforeEach(async () => {
    await act(() => {
      render(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <VisitEditorModal
                data={visitData}
                onRequestClose={handleRequestClose}
                onSaved={handleSave}
              />
            </ConnectedRouter>
          </Provider>
        </ThemeProvider>
      );
    });
  });

  it('should render document drop area', async () => {
    //upload file
    const documents = await screen.findByTestId('visit-documents');
    expect(documents).toBeInTheDocument();

    const documentsFileDrop = await screen.findByTestId('visit-documents-drop-area');
    expect(documentsFileDrop).toBeInTheDocument();
  });

  it('[NEGATIVE] upload invalid file', async () => {
    const documents = await screen.findByTestId('visit-documents');
    expect(documents).toBeInTheDocument();

    const file = 'invalid' as unknown as File;

    const documentsFileInput = await screen.findByTestId('visit-documents-files-input');
    expect(documentsFileInput).toBeInTheDocument();
    await act(() => userEvent.upload(documentsFileInput, file));
  });

})
