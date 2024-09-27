import '@testing-library/jest-dom';
import { act, render, RenderResult, screen } from '@testing-library/react';
import { ConnectedRouter, getLocation } from 'connected-react-router';
import 'jest-styled-components';
import React from 'react';
import { Provider } from 'react-redux';
import API from 'src/modules/api';
import { history, Path } from 'src/modules/navigation/store';
import { StudiesState } from 'src/modules/studies/studies.slice';
import { theme } from 'src/styles';
import { ThemeProvider } from 'styled-components';
import ChartList from './ChartList';
import userEvent from '@testing-library/user-event';
import { matchPath } from 'react-router-dom';
import { createTestStore } from 'src/modules/store/testing';

const studyId = 'testId';
const dashboard = {
  title: 'title',
  id: '1',
};

jest.mock('src/modules/dashboard/components/ApacheEchart', () => {
  return jest.fn(({ chartRef, size, style }) => {
    <div ref={chartRef} style={{ ...size, ...style }} />;
  });
});

const studiesState: StudiesState = {
  isLoading: false,
  studies: [
    {
      id: studyId,
      name: 'test',
      color: 'primary',
      createdAt: 1652648400000,
    },
  ],
  selectedStudyId: studyId,
};


describe('ChartList', () => {
  let store: ReturnType<typeof createTestStore>;
  store = createTestStore({studies: studiesState});
  it('should render correctly', async () => {
    let result: RenderResult | undefined;
    await act(() => {
      result = render(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <ChartList studyId={studyId} dashboard={dashboard} />
            </ConnectedRouter>
          </Provider>
        </ThemeProvider>
      );
    });
    expect(screen.getByTestId('chart-list-container')).toBeInTheDocument();
  });

  it('should refresh chart', async () => {
    let result: RenderResult | undefined;
    await act(() => {
      result = render(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <ChartList studyId={studyId} dashboard={dashboard} />
            </ConnectedRouter>
          </Provider>
        </ThemeProvider>
      );
    });

    //action
    const actionBtn = (await screen.findAllByTestId('action-button'))[1];
    expect(actionBtn).toBeInTheDocument();
    await userEvent.click(actionBtn);

    const refreshChartAction = await screen.findByText('Refresh');
    expect(refreshChartAction).toBeInTheDocument();
    await userEvent.click(refreshChartAction);
  });

  it('should delete chart', async () => {
    let result: RenderResult | undefined;
    await act(() => {
      result = render(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <ChartList studyId={studyId} dashboard={dashboard} />
            </ConnectedRouter>
          </Provider>
        </ThemeProvider>
      );
    });

    //action
    const actionBtn = (await screen.findAllByTestId('action-button'))[1];
    expect(actionBtn).toBeInTheDocument();
    await userEvent.click(actionBtn);

    const deleteChartAction = await screen.findByText('Delete chart');
    expect(deleteChartAction).toBeInTheDocument();
    await userEvent.click(deleteChartAction);

    const confirmDelete = await screen.findByText(
      'This chart will be delete permanently from Dashboard. Do you want to delete this chart?'
    );
    expect(confirmDelete).toBeInTheDocument();

    const deleteBtn = await screen.findByTestId('accept-button');
    expect(deleteBtn).toBeInTheDocument();
    await userEvent.click(deleteBtn);
  });

  it('should redirect to chartEditor', async () => {
    let result: RenderResult | undefined;
    await act(() => {
      result = render(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <ChartList studyId={studyId} dashboard={dashboard} />
            </ConnectedRouter>
          </Provider>
        </ThemeProvider>
      );
    });

    //action
    const actionBtn = (await screen.findAllByTestId('action-button'))[1];
    expect(actionBtn).toBeInTheDocument();
    await userEvent.click(actionBtn);

    const editChartAction = await screen.findByText('Edit chart');
    expect(editChartAction).toBeInTheDocument();
    await userEvent.click(editChartAction);

    expect(
      matchPath(getLocation(store.getState()).pathname, {
        path: Path.EditChart,
        exact: true,
      })
    );
  });

  it('[NEGATIVE] fail to delete chart', async () => {
    API.mock.provideEndpoints({
      deleteChart() {
        return API.mock.failedResponse({ status: 500 });
      },
    });
    let result: RenderResult | undefined;
    await act(() => {
      result = render(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <ChartList studyId={studyId} dashboard={dashboard} />
            </ConnectedRouter>
          </Provider>
        </ThemeProvider>
      );
    });

    //action
    const actionBtn = (await screen.findAllByTestId('action-button'))[1];
    expect(actionBtn).toBeInTheDocument();
    await userEvent.click(actionBtn);

    const deleteChartAction = await screen.findByText('Delete chart');
    expect(deleteChartAction).toBeInTheDocument();
    await userEvent.click(deleteChartAction);

    const deleteBtn = await screen.findByTestId('accept-button');
    expect(deleteBtn).toBeInTheDocument();
    await userEvent.click(deleteBtn);
  });

  it('[NEGATIVE] should render empty list', async () => {
    API.mock.provideEndpoints({
      getChartList() {
        return API.mock.response([]);
      },
    });
    let result: RenderResult | undefined;
    await act(() => {
      result = render(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <ChartList studyId={studyId} dashboard={dashboard} />
            </ConnectedRouter>
          </Provider>
        </ThemeProvider>
      );
    });

    const emptyIcon = await screen.findByTestId('empty-icon'); // Empty Icon
    expect(emptyIcon).toBeInTheDocument();
    const emptyText = await screen.findByText(
      'Your charts will appear here after you create them.'
    );
    expect(emptyText).toBeInTheDocument();
  });

  it('[NEGATIVE] should render error text', async () => {
    API.mock.provideEndpoints({
      getChartList() {
        return API.mock.failedResponse({ status: 500 });
      },
    });
    let result: RenderResult | undefined;
    await act(() => {
      result = render(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <ChartList studyId={studyId} dashboard={dashboard} />
            </ConnectedRouter>
          </Provider>
        </ThemeProvider>
      );
    });

    const reloadBtn = await screen.findByTestId('reload-button');
    expect(reloadBtn).toBeInTheDocument();
    const errorText = await screen.findByText('Something went wrong. Please try again later.');
    expect(errorText).toBeInTheDocument();
  });

});