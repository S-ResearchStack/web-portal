import React from 'react';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import { act, render, screen } from '@testing-library/react';
import { theme } from 'src/styles';
import { history } from 'src/modules/navigation/store';
import { ThemeProvider } from 'styled-components/';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import StudySettings from 'src/modules/study-settings/StudySettings';
import { createTestStore } from '../store/testing';
import { mockProjectId, mockUserInfoList } from "src/modules/study-settings/studySettings.slice.mock";
import { transformUserInfoFromApi } from "src/modules/study-settings/studySettings.mapper";
import userEvent from '@testing-library/user-event';

describe('StudySettings', () => {
  it('should render', async () => {
    const store = createTestStore({
      'studySettings/membersList': {
        isLoading: false,
        fetchArgs: null,
        prevFetchArgs: null,
        data: mockUserInfoList.map(u => transformUserInfoFromApi(u, mockProjectId)),
      },
    });

    await act(() => {
      render(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <StudySettings isSwitchStudy isSwitchStudyInTransition />
            </ConnectedRouter>
          </Provider>
        </ThemeProvider>
      );
    });

    expect(await screen.findByTestId('settings')).toBeInTheDocument();
  });

  it('should render using the admin role', async () => {
    const store = createTestStore({
      'user': {
        id: "user-id",
        firstName: "F",
        lastName: "L",
        company: "company",
        team: "team",
        email: "email@email.com",
        officePhoneNumber: "001",
        mobilePhoneNumber: "002",
        roles: [
          {
            projectId: 'test-study',
            roles: ['studyAdmin'],
          }
        ]
      },
      'studies': {
        isLoading: false,
        studies: [
          {
            id: 'test-study',
            name: 'test',
            color: 'primary',
            createdAt: 1652648400000,
          },
        ],
        selectedStudyId: 'test-study',
      },
      'studySettings/membersList': {
        isLoading: false,
        fetchArgs: null,
        prevFetchArgs: null,
        data: mockUserInfoList.map(u => transformUserInfoFromApi(u, mockProjectId)),
      },
    });

    await act(() => {
      render(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <StudySettings isSwitchStudy isSwitchStudyInTransition />
            </ConnectedRouter>
          </Provider>
        </ThemeProvider>
      );
    });

    expect(await screen.findByTestId('settings')).toBeInTheDocument();

    const invite = await screen.getAllByText('Invite member');
    await userEvent.click(invite?.[0]);
    expect(await screen.findByTestId('slide')).toBeInTheDocument();
  });

  it('[NEGATIVE] should render with empty store', async () => {
    const store = createTestStore({});
    await act(() => {
      render(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <StudySettings isSwitchStudy isSwitchStudyInTransition />
            </ConnectedRouter>
          </Provider>
        </ThemeProvider>
      );
    });

    expect(await screen.findByTestId('settings')).toBeInTheDocument();
  });
});
