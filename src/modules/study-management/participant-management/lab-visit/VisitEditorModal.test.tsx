import React from 'react';
import 'jest-styled-components';
import { act, fireEvent, render, RenderResult, screen, waitFor } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import '@testing-library/jest-dom';

import sleep from 'src/common/utils/waitFor';
import theme from 'src/styles/theme';
import { store } from 'src/modules/store/store';
import { fetchStudies } from 'src/modules/studies/studies.slice';
import { healthDataOverviewListMock } from 'src/modules/overview/participantsList.slice';
import { userEvent } from '@storybook/testing-library';
import { format } from 'src/common/utils/datetime';
import { history } from 'src/modules/navigation/store';
import {
  LabVisitItem,
  labVisitParticipantSuggestionsSlice,
  labVisitSlice,
  MAX_DOCUMENT_SIZE,
  saveLabVisitSelector,
} from './labVisit.slice';
import { UPLOAD_SUCCESS_DELAY } from './VisitDocuments';
import VisitEditorModal from './VisitEditorModal';

beforeAll(() => {
  Element.prototype.scrollTo = jest.fn();
});

describe('VisitEditorModal', () => {
  it('should render', async () => {
    await act(async () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await store.dispatch(fetchStudies({ force: true }));
    });

    let result: RenderResult | undefined;

    const handleRequestClose = jest.fn();
    const handleSaved = jest.fn();
    const visitData: LabVisitItem = {
      visitId: 1,
      participantId: '',
      startTs: Date.now(),
      endTs: Date.now(),
      checkInBy: '',
      notes: '',
      filesPath: undefined,
    };

    await act(() => {
      result = render(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <VisitEditorModal
                data={visitData}
                onRequestClose={handleRequestClose}
                onSaved={handleSaved}
              />
            </ConnectedRouter>
          </Provider>
        </ThemeProvider>
      );
    });

    await waitFor(
      () =>
        !!labVisitSlice.stateSelector(store.getState()).data &&
        !!labVisitParticipantSuggestionsSlice.stateSelector(store.getState()).data
    );

    expect(result?.baseElement).toMatchSnapshot();

    // Participant ID
    const participantIdInput = (await screen.findByTestId(
      'visit-participant-id'
    )) as HTMLInputElement;
    expect(participantIdInput).toBeInTheDocument();

    const firstParticipantId = healthDataOverviewListMock[0]?.userId as string;
    const firstParticipantIdValue = firstParticipantId[0] || '0';
    userEvent.type(participantIdInput, firstParticipantIdValue);
    expect(participantIdInput.value).toEqual(firstParticipantIdValue);

    const participantIdSuggestions = await screen.findByTestId('visit-participant-id-suggestions');
    expect(participantIdSuggestions).toBeInTheDocument();

    const firstParticipantIdSuggestion = (
      await screen.findAllByTestId('visit-participant-id-suggestion-item')
    )[0];
    expect(firstParticipantIdSuggestion).toBeInTheDocument();

    userEvent.click(firstParticipantIdSuggestion);
    expect(participantIdInput.value).toEqual(firstParticipantId);

    // Check in by
    const checkedByInput = (await screen.findByTestId('checked-by-input')) as HTMLInputElement;
    expect(checkedByInput).toBeInTheDocument();

    const checkedByValue = 'John';
    userEvent.type(checkedByInput, checkedByValue);
    expect(checkedByInput.value).toEqual(checkedByValue);

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

    expect(result?.container.firstChild).toMatchSnapshot();

    // Documents
    const documents = await screen.findByTestId('visit-documents');
    expect(documents).toBeInTheDocument();

    const oversizedFile = new File([''], 'oversized-file.png', { type: 'image/png' });
    Object.defineProperty(oversizedFile, 'size', { value: MAX_DOCUMENT_SIZE + 1 });

    const files = [oversizedFile, new File([''], 'file.png', { type: 'image/png' })];

    const documentsFileInput = await screen.findByTestId('visit-documents-files-input');
    expect(documentsFileInput).toBeInTheDocument();
    await act(() => fireEvent.change(documentsFileInput, { target: { files } }));

    await waitFor(
      () => expect(screen.getByTestId('accept-button')).not.toHaveAttribute('disabled'),
      { timeout: 5_000 }
    );

    // wait UI interactions after uploading
    await act(() => sleep(UPLOAD_SUCCESS_DELAY * 1.5));

    const documentList = await screen.findAllByTestId('visit-documents-item');
    expect(documentList.length).toEqual(files.filter((i) => i !== oversizedFile).length);

    // Save
    const saveBtn = await screen.findByTestId('accept-button');
    expect(saveBtn).toBeInTheDocument();

    await act(() => userEvent.click(saveBtn));
    await waitFor(() => saveLabVisitSelector(store.getState()).isSending);
    await waitFor(() => !saveLabVisitSelector(store.getState()).isSending);

    expect(handleRequestClose).toHaveBeenCalled();
    expect(handleSaved).toHaveBeenCalled();
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

    expect(result?.baseElement).toMatchSnapshot();
  });
});
