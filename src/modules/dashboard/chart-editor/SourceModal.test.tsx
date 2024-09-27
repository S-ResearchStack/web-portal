import React from 'react';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import { act, render, RenderResult, screen, waitFor } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { theme } from 'src/styles';
import { Provider } from 'react-redux';
import { makeStore, store } from 'src/modules/store/store';
import { ConnectedRouter } from 'connected-react-router';
import { history } from 'src/modules/navigation/store';
import SourceModal, { SourceModalData } from './SourceModal';
import userEvent from '@testing-library/user-event';
import { fetchStudies } from 'src/modules/studies/studies.slice';
import { databaseListSelector } from './sourceModal.slice';
import API from 'src/modules/api';

const study = {
  id: 'test',
  studyInfoResponse: {
    name: 'string',
    description: 'string',
    participationApprovalType: 'string',
    scope: 'string',
    stage: 'string',
    logoUrl: 'string',
    imageUrl: 'string',
    organization: 'string',
    period: 'string',
    duration: 'string',
  },
  irbInfoResponse: {
    decisionType: 'string',
    decidedAt: 'string',
    expiredAt: 'string',
  },
};

const mockStudies = () => {
  API.mock.provideEndpoints({
    getStudies() {
      return API.mock.response([{ ...study }]);
    },
    getStudy() {
      return API.mock.response({ ...study });
    },
  });
};

beforeAll(() => {
  Element.prototype.scrollTo = jest.fn();
});

describe('SourceModal', () => {
  it('should render', async () => {
    const store = makeStore();
    mockStudies();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await store.dispatch(fetchStudies({ force: true }));

    let result: RenderResult | undefined;
    const handleRequestClose = jest.fn();
    const handleSaved = jest.fn();

    const sourceModalData: SourceModalData = {
        source: {
          database: '',
          query: 'select * from table_0',
        },
      };

    await act(() => {
      result = render(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <SourceModal
                data={sourceModalData}
                onSaved={handleSaved}
                onRequestClose={handleRequestClose}
              />
            </ConnectedRouter>
          </Provider>
        </ThemeProvider>
      );
    });

    await waitFor(() => !!databaseListSelector(store.getState()).data);

    //Database dropdown
    const dbList = await databaseListSelector(store.getState()).data;
    const firstDatabaseValue = dbList ? dbList[0] : 'database';
    const databaseDropdown = await screen.findByTestId('database-dropdown');
    expect(databaseDropdown).toBeInTheDocument();
    await userEvent.click(databaseDropdown);
    const firstDatabaseItem = (await screen.findAllByText(firstDatabaseValue))[0];
    await userEvent.click(firstDatabaseItem);

    //table list
    const tableList = await screen.findByTestId('table-list');
    expect(tableList).toBeInTheDocument();

    //sql input
    const sqlInput = (await screen.findByTestId('query-input-field')) as HTMLTextAreaElement;
    expect(sqlInput).toBeInTheDocument();

    //run query button
    const runButton = await screen.findByTestId('run-query-button');
    expect(runButton).toBeInTheDocument();
    expect(runButton).not.toHaveAttribute('disabled');

    await act(() => userEvent.click(runButton));
    
    //query result table
    const queryResultTable = await screen.findByTestId('table');
    expect(queryResultTable).toBeInTheDocument();

    //save button
    const saveBtn = await screen.findByTestId('accept-button');
    expect(saveBtn).toBeInTheDocument();

    await act(() => userEvent.click(saveBtn));
    expect(handleRequestClose).toBeCalled();
  });

  it('[NEGATIVE] should disable Run query button', async () => {
    const store = makeStore();
    mockStudies();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await store.dispatch(fetchStudies({ force: true }));

    let result: RenderResult | undefined;
    const handleRequestClose = jest.fn();
    const handleSaved = jest.fn();

    const sourceModalData: SourceModalData = {
        source: {
          database: '',
          query: '',
        },
      };

    await act(() => {
      result = render(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <SourceModal
                data={sourceModalData}
                onSaved={handleSaved}
                onRequestClose={handleRequestClose}
              />
            </ConnectedRouter>
          </Provider>
        </ThemeProvider>
      );
    });

    await waitFor(() => !!databaseListSelector(store.getState()).data);

    const sqlInput = (await screen.findByTestId('query-input-field')) as HTMLTextAreaElement;
    expect(sqlInput).toBeInTheDocument();

    await userEvent.type(sqlInput, 'SELECT * FROM table')
    const runButton = await screen.findByTestId('run-query-button');
    expect(runButton).toHaveAttribute('disabled');

    await userEvent.click(screen.getByTestId('decline-button'));
  })

  it('[NEGATIVE] should render with broken props', () => {
    const result = render(
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          <ConnectedRouter history={history}>
            <SourceModal
              data={{}}
              onRequestClose={undefined as unknown as () => void}
              onSaved={undefined as unknown as () => void}
            />
          </ConnectedRouter>
        </Provider>
      </ThemeProvider>
    );

    expect(screen.getByText('Source')).toBeInTheDocument();
    expect(screen.getByText('Database')).toBeInTheDocument();
    expect(screen.getByText('SQL Query')).toBeInTheDocument();
    expect(screen.getByText('Run query')).toBeInTheDocument();
  });
});
