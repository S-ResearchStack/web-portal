import React from 'react';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import { act, render, screen } from '@testing-library/react';
import { theme } from 'src/styles';
import { history } from 'src/modules/navigation/store';
import { ThemeProvider } from 'styled-components/';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { createTestStore } from '../store/testing';
import Overview from './Overview';
import { getStorageLastSeenStatus, setStorageLastSeenStatus } from './StudyOverview.slice';
import type { BasicInfoObject } from '../api';

const studyId = '3';
const overviewData = {
  study: {
    imageURL: '',
    logoURL: '',
    name: 'Some deleted study',
    id: studyId,
    description: 'test study description',
    organization: 'organization',
    stage: 'STARTED_OPEN',
    scope: 'Private',
    participationCode: 'secret',
    participationApprovalType: 'Auto',
    requirements: ['requirement'],
    investigationDevice: 'Galaxy Watch 6',
    referenceDevice: 'MPT-E14R',
    period: '10 day(s)',
    duration: '10 minute(s)/day',
    totalDuration: '0 day(s)',
  } as BasicInfoObject,
  subject: [],
  investigator: []
}

describe('Overview', () => {
  it('should render correctly', async () => {
    const store = createTestStore({
      auth: {
        authToken: 'authToken',
      },
      'overview/studyProgress': {
        isLoading: false,
        fetchArgs: null,
        prevFetchArgs: null,
        data: overviewData,
      },
    });

    await act(() => {
      render(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <Overview isSwitchStudy />
            </ConnectedRouter>
          </Provider>
        </ThemeProvider>
      );
    });

    expect(await screen.findByTestId('overview')).toBeDefined();
  });

  it('[NEGATIVE] should render with broken props', async () => {
    const store = createTestStore({
      auth: {
        authToken: 'authToken',
      },
      'overview/studyProgress': {
        isLoading: false,
        fetchArgs: null,
        prevFetchArgs: null,
        data: overviewData,
      },
    });

    await act(() => {
      render(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <Overview isSwitchStudy={undefined as any} />
            </ConnectedRouter>
          </Provider>
        </ThemeProvider>
      );
    });

    expect(await screen.findByTestId('overview')).toBeDefined();
  });

  it('should render width status updated', async () => {
    setStorageLastSeenStatus(studyId, 'started');
    expect(getStorageLastSeenStatus(studyId)).toBe('started');

    const store = createTestStore({
      studies: {
        studies: [
          {
            id: studyId,
            name: 'Test',
            color: 'secondaryRed',
            createdAt: 1652648400000,
          },
        ],
        selectedStudyId: studyId,
        isLoading: false,
      },
      'overview/studyProgress': {
        isLoading: false,
        fetchArgs: null,
        prevFetchArgs: null,
        data: overviewData,
      },
    });

    await act(() => {
      render(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <Overview />
            </ConnectedRouter>
          </Provider>
        </ThemeProvider>
      );
    });

    expect(await screen.findByTestId('overview')).toBeDefined();
  });

  it('[NEGATIVE] should render with empty store', async () => {
    const store = createTestStore({});

    await act(() => {
      render(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <Overview />
            </ConnectedRouter>
          </Provider>
        </ThemeProvider>
      );
    });

    expect(await screen.findByTestId('overview')).toBeDefined();
  });
});
