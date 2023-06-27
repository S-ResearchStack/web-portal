import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import React from 'react';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'styled-components';
import userEvent from '@testing-library/user-event';
import { theme } from 'src/styles';
import { createTestStore } from 'src/modules/store/testing';
import CreateActivityTask from './CreateActivityTask';

describe('CreateActivityTask', () => {
  it('should render', async () => {
    const store = createTestStore({
      studies: {
        studies: [
          {
            id: 'test',
            name: 'Study Name',
            color: 'secondarySkyBlue',
            createdAt: 1652648400000,
          },
        ],
        selectedStudyId: 'test',
        isLoading: false,
      },
    });

    const onRequestClose = jest.fn();

    render(
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          <CreateActivityTask onRequestClose={onRequestClose} open />
        </Provider>
      </ThemeProvider>
    );

    expect(screen.getByText('Tapping Speed')).toBeInTheDocument();

    await userEvent.click(screen.getByText('Audio'));
    expect(screen.getByText('Sustained Phonation')).toBeInTheDocument();

    await userEvent.click(screen.getByText('Sustained Phonation'));
    await userEvent.click(screen.getByText('Create'));
    expect(screen.getByText('Creating activity...')).toBeVisible();
  });

  it('[NEGATIVE] should render with empty store', () => {
    const store = createTestStore({});

    const onRequestClose = jest.fn();

    render(
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          <CreateActivityTask onRequestClose={onRequestClose} open />
        </Provider>
      </ThemeProvider>
    );

    expect(screen.getByText('Create Activity')).toBeInTheDocument();
  });
});
