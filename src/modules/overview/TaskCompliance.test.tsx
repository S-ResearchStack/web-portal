import { screen, render, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import React from 'react';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'styled-components';
import userEvent from '@testing-library/user-event';
import { theme } from 'src/styles';
import { createTestStore } from '../store/testing';
import TaskCompliance from './TaskCompliance';

describe('TaskCompliance', () => {
  it('should render', async () => {
    const store = createTestStore({
      'overview/taskCompliance': {
        isLoading: false,
        fetchArgs: null,
        prevFetchArgs: null,
        data: [
          {
            id: '1',
            type: 'activity',
            revisionId: 0,
            title: 't1',
            description: 'd1',
            total: 100,
            responded: 20,
            progress: 0.2,
          },
          {
            id: '2',
            type: 'survey',
            revisionId: 0,
            title: 't2',
            description: 'd2',
            total: 100,
            responded: 20,
            progress: 0.2,
          },
        ],
      },
    });

    const result = render(
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          <TaskCompliance />
        </Provider>
      </ThemeProvider>
    );

    expect(result.baseElement).toMatchSnapshot();
    await act(() => userEvent.click(screen.getByTestId('sort-button')));
  });

  it('[NEGATIVE] should render with empty store', async () => {
    const store = createTestStore({});

    render(
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          <TaskCompliance />
        </Provider>
      </ThemeProvider>
    );

    expect(screen.getByText('Task compliance')).toBeInTheDocument();
  });
});
