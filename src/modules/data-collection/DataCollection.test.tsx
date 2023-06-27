import React from 'react';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import { screen, render, waitFor } from '@testing-library/react';

import theme from 'src/styles/theme';
import { history } from 'src/modules/navigation/store';
import { ThemeProvider } from 'styled-components/';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import userEvent from '@testing-library/user-event';

import { createTestStore } from '../store/testing';
import DataCollection from './DataCollection';
import { dataLoadingSelector, tablesLoadingSelector } from './dataCollection.slice';

describe('DataCollection', () => {
  global.URL.createObjectURL = jest.fn().mockImplementation(() => 'mock_obj_url');

  it('should render', async () => {
    const store = createTestStore({
      studies: {
        studies: [
          {
            id: 'test',
            name: 'test',
            color: 'black',
            createdAt: 0,
          },
        ],
        isLoading: false,
        selectedStudyId: 'test',
      },
    });
    const { baseElement } = render(
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          <ConnectedRouter history={history}>
            <DataCollection />
          </ConnectedRouter>
        </Provider>
      </ThemeProvider>
    );

    await waitFor(() => expect(tablesLoadingSelector(store.getState())).toBeFalse());
    await userEvent.click(screen.getByText('Select a table'));
    await userEvent.click(screen.getByText('table_0'));
    await waitFor(() => expect(dataLoadingSelector(store.getState())).toBeFalse());
    expect(baseElement).toMatchSnapshot();

    await userEvent.click(screen.getByText('Run'));
    await waitFor(() => expect(dataLoadingSelector(store.getState())).toBeFalse());

    await userEvent.click(screen.getByText('Export .csv'));

    await userEvent.click(screen.getByTestId('go-to-next'));
    await waitFor(() => expect(dataLoadingSelector(store.getState())).toBeFalse());

    await userEvent.click(screen.getByText('table_0_col_0'));
    await waitFor(() => expect(dataLoadingSelector(store.getState())).toBeFalse());
  });
});
