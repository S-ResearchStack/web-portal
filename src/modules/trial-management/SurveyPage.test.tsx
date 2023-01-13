import React from 'react';

import 'src/__mocks__/setupWindowMatchMediaMock';
import 'src/__mocks__/setupResizeObserverMock';
import 'src/__mocks__/setupResponsiveContainerMock';
import '@testing-library/jest-dom';
import 'jest-styled-components';

import theme from 'src/styles/theme';
import { history } from 'src/modules/navigation/store';
import { ThemeProvider } from 'styled-components/';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { act, render, screen } from '@testing-library/react';
import { userEvent } from '@storybook/testing-library';
import SurveyPage from './SurveyPage';
import { createTestStore } from '../store/testing';

describe('SurveyPage', () => {
  it('should render', async () => {
    const store = createTestStore({
      'trialManagement/survey': {
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
                label: 'test',
                count: 5,
                total: 10,
                percentage: 50,
              },
            ],
            byAge: [
              {
                label: 'test',
                count: 5,
                total: 10,
                percentage: 50,
              },
            ],
          },
          responses: [
            {
              questionTitle: 'test-single',
              questionType: 'single',
              answers: [
                {
                  label: 'test',
                  count: 5,
                  total: 10,
                  percentage: 50,
                },
              ],
            },
            {
              questionTitle: 'test-multiple',
              questionType: 'multiple',
              answers: [
                {
                  label: 'test',
                  count: 5,
                  total: 10,
                  percentage: 50,
                },
              ],
            },
            {
              questionTitle: 'test-slider',
              questionType: 'slider',
              answers: [
                {
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
});
