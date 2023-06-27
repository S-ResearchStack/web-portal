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

describe('StudySettings', () => {
  it('should render', async () => {
    const store = createTestStore({
      'studySettings/membersList': {
        isLoading: false,
        fetchArgs: null,
        prevFetchArgs: null,
        data: {
          users: [
            {
              id: 'test-user-1',
              email: 'test-email-1',
              name: 'test',
              status: 'active',
              roles: ['principal-investigator'],
            },
            {
              id: 'test-user-2',
              email: 'test-email-2',
              name: 'test',
              status: 'active',
              roles: ['data-scientist'],
            },
          ],
        },
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

    expect(await screen.findByTestId('study-settings')).toBeInTheDocument();
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

    expect(await screen.findByTestId('study-settings')).toBeInTheDocument();
  });
});
