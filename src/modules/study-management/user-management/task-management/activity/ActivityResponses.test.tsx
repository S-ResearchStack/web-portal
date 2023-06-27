import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import { enableFetchMocks } from 'jest-fetch-mock';
import React from 'react';
import { ThemeProvider } from 'styled-components';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { theme } from 'src/styles';
import { ActivityTaskResponse } from 'src/modules/api';
import { createTestStore } from 'src/modules/store/testing';
import ActivityResponses from './ActivityResponses';

describe('ActivityResponses', () => {
  beforeAll(() => {
    global.URL.createObjectURL = jest.fn().mockImplementation(() => 'blob://test');
    enableFetchMocks();
  });

  it('should render', async () => {
    const store = createTestStore({});
    const data: ActivityTaskResponse = {
      columns: [
        { key: 'c1', label: 'column 1' },
        { key: 'c2', label: 'column 2' },
      ],
      responses: [
        {
          userId: 'u1',
          result: { c1: { label: 'response1', url: 'test', fileSize: 10 } },
        },
        {
          userId: 'u2',
          result: { c2: { label: 'response12', url: '', fileSize: 0 } },
        },
        {
          userId: 'u2',
          result: {
            c1: { label: 'response21', url: 'test', fileSize: 10 },
            c2: { label: 'response22', url: '', fileSize: 0 },
          },
        },
      ],
    };
    const refetch = jest.fn();

    render(
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          <ActivityResponses data={data} refetch={refetch} />
        </Provider>
      </ThemeProvider>
    );

    expect(screen.getByText('No ID entered yet')).toBeVisible();

    await userEvent.type(screen.getByPlaceholderText('Enter participant ID'), 'u2');
    expect(screen.getByText('response12')).toBeVisible();
    expect(screen.getByText('response21')).toBeVisible();

    await userEvent.click(screen.getByText('column 1'));

    await userEvent.click(screen.getByText('Export all'));
    await userEvent.click(screen.getByText('response21'));
    await userEvent.click(screen.getAllByTestId('download-row')[0]);
  });

  it('[NEGATIVE] should render with no data', () => {
    const store = createTestStore({});
    const refetch = jest.fn();

    render(
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          <ActivityResponses data={{ columns: [], responses: [] }} refetch={refetch} />
        </Provider>
      </ThemeProvider>
    );

    expect(screen.getByText('No ID entered yet')).toBeVisible();
  });
});
