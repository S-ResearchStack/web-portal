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
import SurveyResponsesByGenderCard from './SurveyResponsesByGenderCard';

describe('SurveyResponsesByGenderCard', () => {
  it('should render', async () => {
    const store = createTestStore({
      'overview/surveyResponsesByGender': {
        isLoading: false,
        fetchArgs: null,
        prevFetchArgs: null,
        data: {
          totalPercents: 90,
          items: [
            {
              group: 'test',
              count: 10,
              total: 20,
              percentage: 50,
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
              <SurveyResponsesByGenderCard />
            </ConnectedRouter>
          </Provider>
        </ThemeProvider>
      );
    });

    expect(await screen.findByTestId('survey-responses-by-gender-card')).toBeInTheDocument();
  });

  it('[NEGATIVE] should render with empty store', async () => {
    const store = createTestStore({});

    await act(() => {
      render(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <SurveyResponsesByGenderCard />
            </ConnectedRouter>
          </Provider>
        </ThemeProvider>
      );
    });

    expect(await screen.findByTestId('survey-responses-by-gender-card')).toBeInTheDocument();
  });
});
