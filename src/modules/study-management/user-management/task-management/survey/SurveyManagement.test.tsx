import React from 'react';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';

import { ThemeProvider } from 'styled-components';
import 'jest-styled-components';
import '@testing-library/jest-dom';
import theme from 'src/styles/theme';
import { history } from 'src/modules/navigation/store';
import { act, render, screen } from '@testing-library/react';
import { userEvent } from '@storybook/testing-library';
import { createTestStore } from 'src/modules/store/testing';
import SurveyManagement from './SurveyManagement';

describe('SurveyManagement', () => {
  it('should render', async () => {
    const store = createTestStore({
      'studyManagement/surveyList': {
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
      'studyManagement/activitiesList': {
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
              type: 'GAIT_AND_BALANCE',
              group: 'MOTOR',
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
              type: 'WALK_TEST',
              group: 'FITNESS',
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

    const tabs = await screen.findAllByTestId('tab');
    expect(tabs).toHaveLength(2);

    await act(() => {
      userEvent.click(tabs[1]);
    });
  });
});
