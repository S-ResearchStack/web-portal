/* eslint-disable import/first */
import React from 'react';
import '@testing-library/jest-dom';
import 'jest-styled-components';

import theme from 'src/styles/theme';
import { history } from 'src/modules/navigation/store';
import { ThemeProvider } from 'styled-components/';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { act, render, screen } from '@testing-library/react';
import { userEvent } from '@storybook/testing-library';
import ActivityPage from 'src/modules/study-management/user-management/task-management/activity/ActivityPage';
import { createTestStore } from 'src/modules/store/testing';
import { convertResponseData } from 'src/modules/study-management/user-management/task-management/activity/activityPage.slice';
import { mockResponses } from 'src/modules/study-management/user-management/task-management/activity/activityPage.mock';

describe('ActivityPage', () => {
  it('should render', async () => {
    const store = createTestStore({
      'studyManagement/activity': {
        isLoading: false,
        fetchArgs: null,
        prevFetchArgs: null,
        data: {
          activityInfo: {
            id: 'test',
            revisionId: 0,
            title: 'test',
            publishedAt: 0,
          },
          analytics: {
            targetParticipants: 10,
            completedParticipants: 5,
            responseRatePercents: 50,
            avgCompletionTimeMs: 1000,
            byGender: [
              {
                id: 'test',
                label: 'test',
                count: 5,
                total: 10,
                percentage: 50,
              },
            ],
            byAge: [
              {
                id: 'test',
                label: 'test',
                count: 5,
                total: 10,
                percentage: 50,
              },
            ],
          },
          responses: await convertResponseData(
            mockResponses.GAIT_AND_BALANCE.data?.surveyResponse as never,
            '',
            ''
          ),
        },
      },
    });
    await act(() => {
      render(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <ActivityPage />
            </ConnectedRouter>
          </Provider>
        </ThemeProvider>
      );
    });

    expect(await screen.findByTestId('activity-page')).toBeInTheDocument();

    const tabs = await screen.findAllByTestId('tab');
    expect(tabs).toHaveLength(2);

    act(() => {
      userEvent.click(tabs[1]);
    });
  });
});
