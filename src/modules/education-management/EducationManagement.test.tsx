import React from 'react';

import 'jest-styled-components';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import theme from 'src/styles/theme';
import { history } from 'src/modules/navigation/store';
import { ThemeProvider } from 'styled-components/';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { act, render, screen, waitFor } from '@testing-library/react';
import { createTestStore } from 'src/modules/store/testing';

import EducationManagement from './EducationManagement';
import { EducationalContentType } from '../api';

describe('EducationManagement', () => {
  const store = createTestStore({
    'education/educationList': {
      isLoading: false,
      fetchArgs: null,
      prevFetchArgs: null,
      data: {
        drafts: [
          {
            id: 'test-draft',
            title: 'test',
            status: 'DRAFT',
            type: EducationalContentType.PDF,
            modifiedAt: new Date().valueOf(),
          },
        ],
        published: [
          {
            id: 'test-published',
            title: 'test',
            status: 'PUBLISHED',
            type: EducationalContentType.SCRATCH,
            modifiedAt: new Date().valueOf(),
          },
        ],
      },
    },
  });

  it('should render', async () => {
    await act(() => {
      render(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <EducationManagement />
            </ConnectedRouter>
          </Provider>
        </ThemeProvider>
      );
    });

    expect(await screen.findByTestId('education-management')).toBeInTheDocument();
  });

  it('should open create publication modal', async () => {
    const { getByTestId } = render(
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          <ConnectedRouter history={history}>
            <EducationManagement />
          </ConnectedRouter>
        </Provider>
      </ThemeProvider>
    );

    const createPublicationButton = getByTestId('create-publication-button');
    expect(createPublicationButton).toBeInTheDocument();

    await userEvent.click(createPublicationButton);
    expect(getByTestId('create-publication')).toBeInTheDocument();
  });

  it('should open delete publication modal', async () => {
    const { getByTestId } = render(
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          <ConnectedRouter history={history}>
            <EducationManagement />
          </ConnectedRouter>
        </Provider>
      </ThemeProvider>
    );

    const button = getByTestId('delete-education-button');
    expect(button).toBeInTheDocument();

    await userEvent.click(button);
    expect(getByTestId('card-content')).toBeInTheDocument();

    const acceptButton = screen.getByTestId('accept-button');
    expect(acceptButton).toBeInTheDocument();

    await userEvent.click(acceptButton);
  });

  it('should open cancel publication modal', async () => {
    const { getByTestId } = render(
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          <ConnectedRouter history={history}>
            <EducationManagement />
          </ConnectedRouter>
        </Provider>
      </ThemeProvider>
    );

    const button = getByTestId('cancel-education-button');
    expect(button).toBeInTheDocument();

    await userEvent.click(button);
    expect(getByTestId('card-content')).toBeInTheDocument();

    const acceptButton = screen.getByTestId('accept-button');
    expect(acceptButton).toBeInTheDocument();

    await userEvent.click(acceptButton);
  });

  it('should open cancel publication modal', async () => {
    const { getByTestId } = render(
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          <ConnectedRouter history={history}>
            <EducationManagement />
          </ConnectedRouter>
        </Provider>
      </ThemeProvider>
    );

    const button = getByTestId('cancel-education-button');
    expect(button).toBeInTheDocument();

    await userEvent.click(button);
    expect(getByTestId('card-content')).toBeInTheDocument();

    const declineButton = screen.getByTestId('decline-button');
    expect(declineButton).toBeInTheDocument();

    await userEvent.click(declineButton);
  });

  it('[NEGATIVE] should render empty state', async () => {
    const storeWithEmptyData = createTestStore({
      'education/educationList': {
        isLoading: false,
        fetchArgs: null,
        prevFetchArgs: null,
        data: { published: [], drafts: [] },
      },
    });

    const { getByTestId } = render(
      <ThemeProvider theme={theme}>
        <Provider store={storeWithEmptyData}>
          <ConnectedRouter history={history}>
            <EducationManagement />
          </ConnectedRouter>
        </Provider>
      </ThemeProvider>
    );

    await userEvent.click(getByTestId('collapse-button'));

    expect(getByTestId('empty-list')).toBeInTheDocument();
  });
});
