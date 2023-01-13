import React from 'react';
import 'src/__mocks__/setupResponsiveContainerMock';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import { act, render, screen } from '@testing-library/react';
import { theme } from 'src/styles';
import { history } from 'src/modules/navigation/store';
import { ThemeProvider } from 'styled-components/';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { createTestStore } from '../store/testing';
import SurveyResponsesByAgeCard from './SurveyResponsesByAgeCard';

describe('SurveyResponsesByAgeCard', () => {
  it('should render', async () => {
    const store = createTestStore({
      'overview/surveyResponsesByAge': {
        isLoading: false,
        fetchArgs: null,
        prevFetchArgs: null,
        data: [
          {
            group: 'test',
            count: '10',
            total: 20,
            percentage: 50,
          },
        ],
      },
    });

    await act(() => {
      render(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <SurveyResponsesByAgeCard />
            </ConnectedRouter>
          </Provider>
        </ThemeProvider>
      );
    });

    expect(await screen.findByTestId('survey-responses-by-age-card')).toBeInTheDocument();
  });

  it('[NEGATIVE] should render with empty store', async () => {
    const store = createTestStore({});

    await act(() => {
      render(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <SurveyResponsesByAgeCard />
            </ConnectedRouter>
          </Provider>
        </ThemeProvider>
      );
    });

    expect(await screen.findByTestId('survey-responses-by-age-card')).toBeInTheDocument();
  });
});
