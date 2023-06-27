/* eslint-disable import/first */
import React from 'react';
import { Provider } from 'react-redux';

import '@testing-library/jest-dom';
import 'jest-styled-components';
import { ConnectedRouter } from 'connected-react-router';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { makeStore } from 'src/modules/store/store';
import { StudiesState } from 'src/modules/studies/studies.slice';
import theme from 'src/styles/theme';
import { makeHistory } from 'src/modules/navigation/store';
import { ThemeProvider } from 'styled-components/';
import { createTestStore } from 'src/modules/store/testing';
import { createEducationSelector } from './createPublication.slice';
import CreatePublication from './CreatePublication';

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

describe('CreatePublication', () => {
  const onRequestClose = jest.fn();

  let store: ReturnType<typeof makeStore>;
  let history: ReturnType<typeof makeHistory>;

  beforeEach(() => {
    history = makeHistory();
    store = createTestStore(
      {
        'education/createPublication': {
          isCreating: false,
        },
        'studyManagement/educationEditor': {
          isSaving: false,
          isLoading: false,
          data: undefined,
        },
        studies: { ...studiesState },
      },
      history
    );
  });

  it('should render', async () => {
    const { getByTestId } = render(
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          <ConnectedRouter history={history}>
            <CreatePublication open onRequestClose={onRequestClose} />
          </ConnectedRouter>
        </Provider>
      </ThemeProvider>
    );

    expect(getByTestId('create-publication')).toBeInTheDocument();
    expect(getByTestId('creating-loader')).toBeInTheDocument();
  });

  it('should set publication type', async () => {
    render(
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          <ConnectedRouter history={history}>
            <CreatePublication open onRequestClose={onRequestClose} />
          </ConnectedRouter>
        </Provider>
      </ThemeProvider>
    );

    expect(history.location.pathname).toBe('/');

    const acceptButton = screen.queryByTestId('accept-button');
    expect(acceptButton).toBeInTheDocument();
    expect(acceptButton).toBeDisabled();

    const scratchTab = screen.getByText('Create from scratch');

    await userEvent.click(scratchTab);
    expect(acceptButton).not.toBeDisabled();

    await userEvent.click(acceptButton as HTMLElement);

    await waitFor(() => expect(createEducationSelector(store.getState()).isCreating).toBeTrue());
    await waitFor(() => expect(createEducationSelector(store.getState()).isCreating).toBeFalse());

    await waitFor(() => history.location.pathname !== '/study-management');
    expect(history.location.pathname).toInclude('/study-management/education');
  });

  it('[NEGATIVE] should call onRequestClose cb', async () => {
    const { getByTestId } = render(
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          <ConnectedRouter history={history}>
            <CreatePublication open onRequestClose={onRequestClose} />
          </ConnectedRouter>
        </Provider>
      </ThemeProvider>
    );

    const declineButton = getByTestId('decline-button');

    await userEvent.click(declineButton);

    expect(onRequestClose).toHaveBeenCalled();
  });
});
