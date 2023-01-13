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
import EligibilityQualificationsCard from './EligibilityQualificationsCard';

describe('EligibilityQualificationsCard', () => {
  it('should render', async () => {
    const store = createTestStore({
      'overview/eligibilityQualifications': {
        isLoading: false,
        fetchArgs: null,
        prevFetchArgs: null,
        data: [
          {
            group: 'test',
            value: 10,
            totalValue: 20,
          },
        ],
      },
    });

    await act(() => {
      render(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <EligibilityQualificationsCard />
            </ConnectedRouter>
          </Provider>
        </ThemeProvider>
      );
    });

    expect(await screen.findByTestId('eligibility-qualifications-card')).toBeInTheDocument();
  });

  it('[NEGATIVE] should render with empty store', async () => {
    const store = createTestStore({});

    await act(() => {
      render(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <EligibilityQualificationsCard />
            </ConnectedRouter>
          </Provider>
        </ThemeProvider>
      );
    });

    expect(await screen.findByTestId('eligibility-qualifications-card')).toBeInTheDocument();
  });
});
