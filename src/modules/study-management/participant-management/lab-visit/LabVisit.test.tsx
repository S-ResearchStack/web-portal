import React from 'react';
import 'jest-styled-components';
import { act, render, screen, waitFor } from '@testing-library/react';
import theme from 'src/styles/theme';
import { makeStore } from 'src/modules/store/store';
import { history } from 'src/modules/navigation/store';
import { ThemeProvider } from 'styled-components';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { fetchStudies } from 'src/modules/studies/studies.slice';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import LabVisit from './LabVisit';
import { labVisitSlice } from './labVisit.slice';

describe('LabVisit', () => {
  beforeAll(() => {
    Element.prototype.scrollTo = jest.fn();
    jest.setSystemTime(1680842869025);
  });

  it('should render', async () => {
    const store = makeStore();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await store.dispatch(fetchStudies({ force: true }));

    let container: HTMLElement | undefined;

    act(() => {
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

    expect(container?.firstChild).toMatchSnapshot();

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
    const store = makeStore();
    act(() => {
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

    expect(screen.getByText('No Data')).toBeInTheDocument();
  });
});
