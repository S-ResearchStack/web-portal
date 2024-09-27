import '@testing-library/jest-dom';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConnectedRouter } from 'connected-react-router';
import 'jest-styled-components';
import React from 'react';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'styled-components';
import API from 'src/modules/api';
import { history } from 'src/modules/navigation/store';
import { StudiesState } from 'src/modules/studies/studies.slice';
import theme from 'src/styles/theme';
import LabVisit from './LabVisit';
import { labVisitSlice } from './labVisit.slice';
import { createTestStore } from '../store/testing';

const studyId='studyId'
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

const setListError = () => {
  API.mock.provideEndpoints({
    getLabVisits() {
      return API.mock.failedResponse({ status: 400 });
    },
  });
};

const setListEmpty = () => {
  API.mock.provideEndpoints({
    getLabVisits() {
      return API.mock.response({
        totalCount: 0,
        page: 1,
        size: 10,
        sortBy: 'id',
        orderBy: 'desc',
        list: [],
      });
    },
  });
};

describe('LabVisit', () => {
  beforeAll(() => {
    Element.prototype.scrollTo = jest.fn();
  });
  let store: ReturnType<typeof createTestStore>;
  store = createTestStore({studies: studiesState})
  it('should render', async () => {
    let container: HTMLElement | undefined;

    await act(() => {
      container = render(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <LabVisit />
            </ConnectedRouter>
          </Provider>
        </ThemeProvider>
      ).container;
    });

    await waitFor(() => !!labVisitSlice.stateSelector(store.getState()).data);

    //change page
    const nextPageBtn = await screen.findByTestId('go-to-next');
    expect(nextPageBtn).toBeInTheDocument();
    await userEvent.click(nextPageBtn);
    const firstPageBtn = await screen.findByTestId('go-to-first');
    expect(firstPageBtn).toBeInTheDocument();
    await userEvent.click(firstPageBtn);

    //download btn
    const firstDownloadBtn = (await screen.findAllByTestId('download-documents-button'))[0];
    expect(firstDownloadBtn).toBeInTheDocument();
    await userEvent.click(firstDownloadBtn);

    // notes modal
    const firstShowNotesBtn = (await screen.findAllByTestId('show-notes-button'))[0];
    expect(firstShowNotesBtn).toBeInTheDocument();
    await userEvent.click(firstShowNotesBtn);

    const notesEditorTitle = await screen.findByTestId('modal-title');
    expect(notesEditorTitle).toBeInTheDocument();
    expect(notesEditorTitle.textContent).toEqual('Notes');

    const declineNotesEditorBtn = await screen.findByTestId('decline-button');
    expect(declineNotesEditorBtn).toBeInTheDocument();
    await userEvent.click(declineNotesEditorBtn);

    await userEvent.click(firstShowNotesBtn);
    const editNotesEditorBtn = await screen.findByTestId('accept-button');
    expect(editNotesEditorBtn).toBeInTheDocument();
    await userEvent.click(editNotesEditorBtn);

    // edit modal
    const firstEditVisitBtn = (await screen.findAllByTestId('edit-visit-button'))[0];
    expect(firstEditVisitBtn).toBeInTheDocument();
    await userEvent.click(firstEditVisitBtn);

    const visitEditorTitle = await screen.findByTestId('modal-title');
    expect(visitEditorTitle).toBeInTheDocument();
    expect(visitEditorTitle.textContent).toEqual('Edit In-Lab Visit');

    const declineVisitEditorBtn = await screen.findByTestId('decline-button');
    expect(declineVisitEditorBtn).toBeInTheDocument();
    await userEvent.click(declineVisitEditorBtn);

    // add modal
    const addVisitBtn = await screen.findByTestId('add-visit-button');
    expect(addVisitBtn).toBeInTheDocument();
    await userEvent.click(addVisitBtn);
  });

  it('[NEGATIVE] should render with API error', async () => {
    setListError();
    await act(() => {
      render(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <LabVisit />
            </ConnectedRouter>
          </Provider>
        </ThemeProvider>
      );
    });

    await waitFor(() => !!labVisitSlice.stateSelector(store.getState()).error);

    expect(screen.getByText('Server Error')).toBeInTheDocument();
    const reloadBtn = await screen.findByTestId('reload-button');
    expect(reloadBtn).toBeInTheDocument();
    await userEvent.click(reloadBtn);
  });

  it('[NEGATIVE] should render with empty list', async () => {
    setListEmpty();
    await act(() => {
      render(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <LabVisit />
            </ConnectedRouter>
          </Provider>
        </ThemeProvider>
      );
    });

    const emptyIcon = await screen.findByTestId('empty-icon');
    expect(emptyIcon).toBeInTheDocument();
    expect(screen.getByText('No Data')).toBeInTheDocument();
  });
});
