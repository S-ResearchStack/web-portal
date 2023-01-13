import React from 'react';

import 'jest-styled-components';
import '@testing-library/jest-dom';
import 'src/__mocks__/setupWindowMatchMediaMock';
import 'src/__mocks__/setupResizeObserverMock';

import theme from 'src/styles/theme';
import { history } from 'src/modules/navigation/store';
import { ThemeProvider } from 'styled-components/';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import SurveyManagement from 'src/modules/trial-management/SurveyManagement';
import { act, render, screen } from '@testing-library/react';
import { createTestStore } from '../store/testing';

describe('SurveyManagement', () => {
  it('should render', async () => {
    const store = createTestStore({
      'trialManagement/surveyList': {
        isLoading: false,
        fetchArgs: null,
        prevFetchArgs: null,
        data: {
          drafts: [
            {
              id: 'test-draft',
              title: 'test',
              description: 'test',
              status: 'DRAFT',
              totalParticipants: 100,
              respondedParticipants: 0,
              modifiedAt: 0,
            },
          ],

          published: [
            {
              id: 'test-published',
              title: 'test',
              description: 'test',
              status: 'PUBLISHED',
              totalParticipants: 100,
              respondedParticipants: 50,
              modifiedAt: 0,
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
              <SurveyManagement />
            </ConnectedRouter>
          </Provider>
        </ThemeProvider>
      );
    });

    expect(await screen.findByTestId('survey-management')).toBeInTheDocument();
  });
});
