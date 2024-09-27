import '@testing-library/jest-dom';
import { act, render, RenderResult, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConnectedRouter, getLocation } from 'connected-react-router';
import React from 'react';
import { Provider } from 'react-redux';
import { makeHistory, Path } from 'src/modules/navigation/store';
import { createTestStore } from 'src/modules/store/testing';
import { StudiesState } from 'src/modules/studies/studies.slice';
import { theme } from 'src/styles';
import { ThemeProvider } from 'styled-components';
import ChartEditor from './ChartEditor';
import {
  ChartEditorData,
  chartEditorDataSelector,
  chartEditorIsLoadingSelector,
  setChartData,
  updateChart,
  useChartEditor,
} from './chartEditor.slice';
import { ChartSource, QueryResponse } from 'src/modules/api';
import { matchPath } from 'react-router-dom';

const studyId = 'test-study-id';
const dashboard = {
  title: 'title',
  id: '1',
};

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

const sourceMock: ChartSource = {
  database: 'database_0',
  query: 'select * from table_0',
};

const sourceResultMock: QueryResponse = {
  columns: [
    {
      name: 'name',
      type: 'string',
    },
    {
      name: 'status',
      type: 'string',
    },
    {
      name: 'date',
      type: 'datetime',
    },
    {
      name: 'time',
      type: 'datetime',
    },
    {
      name: 'count',
      type: 'number',
    },
    {
      name: 'index',
      type: 'number',
    },
    {
      name: 'checked',
      type: 'boolean',
    },
  ],
  data: [
    {
      name: 'Char 0',
      status: 'Varchar 0',
      date: 'Sep 16 2024 02:18 PM',
      time: 'Sep 22 2024 02:18 PM',
      count: 15,
      index: 44,
      checked: 'True',
    },
    {
      name: 'Char 1',
      status: 'Varchar 1',
      date: 'Sep 20 2024 02:18 PM',
      time: 'Sep 20 2024 02:18 PM',
      count: 63,
      index: 15,
      checked: 'True',
    },
    {
      name: 'Char 2',
      status: 'Varchar 2',
      date: 'Sep 19 2024 02:18 PM',
      time: 'Sep 16 2024 02:18 PM',
      count: 11,
      index: 13,
      checked: 'True',
    },
    {
      name: 'Char 3',
      status: 'Varchar 3',
      date: 'Sep 22 2024 02:18 PM',
      time: 'Sep 15 2024 02:18 PM',
      count: 87,
      index: 66,
      checked: 'False',
    },
  ],
};

jest.mock('src/modules/dashboard/components/ApacheEchart', () => {
  return jest.fn(({ chartRef, size, style }) => {
    <div ref={chartRef} style={{ ...size, ...style }} />;
  });
});

describe('ChartEditor', () => {
  let store: ReturnType<typeof createTestStore>;
  let history: ReturnType<typeof makeHistory>;

  describe('CreateChart', () => {
    it('should render loading', async () => {
      history = makeHistory();
      store = createTestStore(
        {
          studies: studiesState,
          'dashboard/ChartEditor': {
            isSaving: false,
            isLoading: true,
            data: {
              studyId: studyId,
              dashboardId: '1',
            },
          },
        },
        history
      );
      let result: RenderResult | undefined;

      await act(() => {
        result = render(
          <ThemeProvider theme={theme}>
            <Provider store={store}>
              <ConnectedRouter history={history}>
                <ChartEditor />
              </ConnectedRouter>
            </Provider>
          </ThemeProvider>
        );
      });

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
    });
    it('should render', async () => {
      history = makeHistory();
      store = createTestStore(
        {
          studies: studiesState,
          'dashboard/ChartEditor': {
            isSaving: false,
            isLoading: false,
            data: {
              studyId: studyId,
              dashboardId: '1',
            },
          },
        },
        history
      );
      let result: RenderResult | undefined;

      await act(() => {
        result = render(
          <ThemeProvider theme={theme}>
            <Provider store={store}>
              <ConnectedRouter history={history}>
                <ChartEditor />
              </ConnectedRouter>
            </Provider>
          </ThemeProvider>
        );
      });

      await waitFor(() => !chartEditorIsLoadingSelector(store.getState()));

      //chart title
      const titleInput = await screen.findByTestId('title-input');
      expect(titleInput).toBeInTheDocument();
      const titleValue = 'Chart Title';
      await userEvent.type(titleInput, titleValue);

      //Choose chart type
      //pie
      const pieChartItem = await screen.findByTestId('PIE-chart-item');
      expect(pieChartItem).toBeInTheDocument();
      await userEvent.click(pieChartItem);
      const chooseColorDropdown = await screen.findByTestId('choose-color-dropdown');
      expect(chooseColorDropdown).toBeInTheDocument();
      await userEvent.click(chooseColorDropdown);
      const colorOption = await screen.findByText('macarons');
      expect(colorOption).toBeInTheDocument();
      await userEvent.click(colorOption);

      //donut
      const donutChartItem = await screen.findByTestId('DONUT-chart-item');
      expect(donutChartItem).toBeInTheDocument();
      await userEvent.click(donutChartItem);

      //bar
      const barChartItem = await screen.findByTestId('BAR-chart-item');
      expect(barChartItem).toBeInTheDocument();
      await userEvent.click(barChartItem);
      const toggleHorizontal = await screen.findByTestId('toggle-horizontal');
      expect(toggleHorizontal).toBeInTheDocument();
      await userEvent.click(toggleHorizontal);

      //line
      const lineChartItem = await screen.findByTestId('LINE-chart-item');
      expect(lineChartItem).toBeInTheDocument();
      await userEvent.click(lineChartItem);
      const toggleSmooth = await screen.findByTestId('toggle-smooth');
      expect(toggleSmooth).toBeInTheDocument();
      await userEvent.click(toggleSmooth);

      //table
      const tableChartItem = await screen.findByTestId('TABLE-chart-item');
      expect(tableChartItem).toBeInTheDocument();
      await userEvent.click(tableChartItem);

      //sourceModal
      const editQueryButton = await screen.findByTestId('edit-query-button');
      expect(editQueryButton).toBeInTheDocument();
      await userEvent.click(editQueryButton);

      const declineBtn = await screen.findByTestId('decline-button');
      expect(declineBtn).toBeInTheDocument();
      await userEvent.click(declineBtn);

      //mock data
      store.dispatch(
        setChartData({
          studyId: studyId,
          dashboardId: dashboard.id,
          configBasic: {
            name: titleValue,
            type: 'PIE',
          },
          configSpecific: {
            value: 'count',
            category: 'name',
            color: 'macarons'
          },
          source: sourceMock,
          sourceResult: sourceResultMock,
        })
      );
      
      //save
      const saveBtn = await screen.findByTestId('editor-header-save');
      expect(saveBtn).toBeInTheDocument();
      await userEvent.click(saveBtn);

      await waitFor(() =>
        expect(
          matchPath(getLocation(store.getState()).pathname, {
            path: Path.Dashboard,
          })
        ).not.toBeNull()
      );
    });

    it('[NEGATIVE] enter chart title greater than limit', async () => {
      history = makeHistory();
      store = createTestStore(
        {
          studies: studiesState,
          'dashboard/ChartEditor': {
            isSaving: false,
            isLoading: true,
            data: {
              studyId: studyId,
              dashboardId: '1',
            },
          },
        },
        history
      );
      let result: RenderResult | undefined;

      await act(() => {
        result = render(
          <ThemeProvider theme={theme}>
            <Provider store={store}>
              <ConnectedRouter history={history}>
                <ChartEditor />
              </ConnectedRouter>
            </Provider>
          </ThemeProvider>
        );
      });

      //chart title
      const titleInput = (await screen.findByTestId('title-input')) as HTMLInputElement;
      expect(titleInput).toBeInTheDocument();
      const titleValue =
        'Lorem Ipsum Dolor Sit Amet Consectetur Adipiscing Elit Sed Do Eiusmod Tempor Incididunt Ut Labore Et Dolore Magna Aliqua Ut Enim Ad Minim Veniam Quis Nostrud Exercitation Ullamco Laboris Nisi';
      await userEvent.type(titleInput, titleValue);
      expect(titleInput.value).toHaveLength(50);
    });

    it('[NEGATIVE] save chart with missing field', async () => {
      history = makeHistory();
      store = createTestStore(
        {
          studies: studiesState,
          'dashboard/ChartEditor': {
            isSaving: false,
            isLoading: true,
            data: {
              studyId: studyId,
              dashboardId: '1',
            },
          },
        },
        history
      );
      let result: RenderResult | undefined;

      await act(() => {
        result = render(
          <ThemeProvider theme={theme}>
            <Provider store={store}>
              <ConnectedRouter history={history}>
                <ChartEditor />
              </ConnectedRouter>
            </Provider>
          </ThemeProvider>
        );
      });

      //chart title
      const titleInput = (await screen.findByTestId('title-input')) as HTMLInputElement;
      expect(titleInput).toBeInTheDocument();
      const titleValue = 'Chart Title';
      await userEvent.type(titleInput, titleValue);

      //save
      const saveBtn = await screen.findByTestId('editor-header-save');
      expect(saveBtn).toBeInTheDocument();
      await userEvent.click(saveBtn);
      expect(screen.getByText('Chart title')).toBeInTheDocument();
    });
  });
});
