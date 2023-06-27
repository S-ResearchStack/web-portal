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
import { createTestStore } from 'src/modules/store/testing';
import SurveyPage from './SurveyPage';

describe('SurveyPage', () => {
  it('should render', async () => {
    const store = createTestStore({
      'studyManagement/survey': {
        isLoading: false,
        fetchArgs: null,
        prevFetchArgs: null,
        data: {
          surveyInfo: {
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
          responses: [
            {
              id: 'single',
              questionTitle: 'test-single',
              questionType: 'single',
              answers: [
                {
                  id: 'test',
                  label: 'test',
                  count: 5,
                  total: 10,
                  percentage: 50,
                },
              ],
            },
            {
              id: 'multiple',
              questionTitle: 'test-multiple',
              questionType: 'multiple',
              answers: [
                {
                  id: 'test',
                  label: 'test',
                  count: 5,
                  total: 10,
                  percentage: 50,
                },
              ],
            },
            {
              id: 'slider',
              questionTitle: 'test-slider',
              questionType: 'slider',
              answers: [
                {
                  id: 'test',
                  label: 'test',
                  count: 5,
                  total: 10,
                  percentage: 50,
                },
              ],
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
              <SurveyPage />
            </ConnectedRouter>
          </Provider>
        </ThemeProvider>
      );
    });

    expect(await screen.findByTestId('survey-page')).toBeInTheDocument();

    const tabs = await screen.findAllByTestId('tab');
    expect(tabs).toHaveLength(2);

    act(() => {
      userEvent.click(tabs[1]);
    });
  });

  it('[NEGATIVE] should render with empty store', async () => {
    const store = createTestStore({});

    await act(() => {
      render(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <SurveyPage />
            </ConnectedRouter>
          </Provider>
        </ThemeProvider>
      );
    });

    expect(await screen.findByTestId('survey-page')).toBeInTheDocument();
  });
});
