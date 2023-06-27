import React from 'react';

import 'jest-styled-components';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import theme from 'src/styles/theme';
import { history } from 'src/modules/navigation/store';
import { ThemeProvider } from 'styled-components/';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { act, render, screen } from '@testing-library/react';
import { createTestStore } from 'src/modules/store/testing';

import EducationManagement from './EducationManagement';

describe('EducationManagement', () => {
  const store = createTestStore({
    'studyManagement/educationList': {
      isLoading: false,
      fetchArgs: null,
      prevFetchArgs: null,
      data: {
        drafts: [
          {
            id: 'test-draft',
            title: 'test',
            status: 'DRAFT',
            revisionId: 1,
            source: 'PDF',
            modifiedAt: new Date().valueOf(),
          },
        ],
        published: [
          {
            id: 'test-published',
            title: 'test',
            status: 'PUBLISHED',
            revisionId: 2,
            source: 'SCRATCH',
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

  it('should render loading state', async () => {
    const storeWithIsCreating = {
      ...store,
      'education/createPublication': {
        isCreating: false,
      },
    };

    const { getByTestId } = render(
      <ThemeProvider theme={theme}>
        <Provider store={storeWithIsCreating}>
          <ConnectedRouter history={history}>
            <EducationManagement />
          </ConnectedRouter>
        </Provider>
      </ThemeProvider>
    );

    expect(getByTestId('creating-loader')).toBeInTheDocument();
  });

  it('[NEGATIVE] should render empty state', async () => {
    const storeWithEmptyData = createTestStore({
      'studyManagement/educationList': {
        isLoading: false,
        fetchArgs: null,
        prevFetchArgs: null,
        data: { published: [], drafts: [] },
      },
      'education/createPublication': {
        isCreating: false,
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
