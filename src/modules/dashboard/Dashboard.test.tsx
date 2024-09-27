import React from 'react';
import { Provider } from 'react-redux';
import '@testing-library/jest-dom';
import { act, render, renderHook, RenderResult, screen, waitFor } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { theme } from 'src/styles';
import { ConnectedRouter } from 'connected-react-router';
import { history, makeHistory } from 'src/modules/navigation/store';
import { createTestStore } from 'src/modules/store/testing';
import userEvent from '@testing-library/user-event';
import { fetchStudies, StudiesState } from 'src/modules/studies/studies.slice';
import { makeStore, store } from 'src/modules/store/store';
import Dashboard from './Dashboard';
import API from 'src/modules/api';

const studyId = 'testId';

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

const getDashboardError = () => {
    API.mock.provideEndpoints({
        getDashboardList() {
            return API.mock.failedResponse({status: 400});
        }
    })
}

jest.mock('src/modules/dashboard/components/ApacheEchart', () => {
  return jest.fn(({ chartRef, size, style }) => {
    <div ref={chartRef} style={{ ...size, ...style }} />;
  });
});

describe('Dashboard', () => {
  it('should render', async () => {
    let store: ReturnType<typeof createTestStore>;
    let result: RenderResult | undefined;
    store = createTestStore({
      studies: studiesState,
    });
    await act(() => {
      result = render(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <Dashboard />
            </ConnectedRouter>
          </Provider>
        </ThemeProvider>
      );
    });
    
    const dashboard = await screen.findByTestId('dashboard');
    expect(dashboard).toBeInTheDocument();

    //btn add chart
    const addChartBtn = await screen.findByTestId('add-chart-button');
    expect(addChartBtn).toBeInTheDocument();

    //btn setting
    const settingBtn = await screen.findByTestId('setting-button');
    expect(settingBtn).toBeInTheDocument();
    await(userEvent.click(settingBtn))
    const settingModal = await screen.findByTestId('setting-modal');
    expect(settingModal).toBeInTheDocument();
    const toggleBtn = await screen.findByTestId('toggle-button');
    expect(toggleBtn).toBeInTheDocument();
    await(userEvent.click(toggleBtn));

    //timer dropdown
    const timerDropdown = await screen.findByTestId('timer-dropdown');
    expect(timerDropdown).toBeInTheDocument();
    await userEvent.click(timerDropdown);

    const timeValue = (await screen.findAllByText('30s'))[0];
    expect(timeValue).toBeInTheDocument();
    await userEvent.click(timeValue);  //select 30s

    const chartCheckbox = await screen.findAllByTestId('checkbox-select-chart');
    expect(chartCheckbox[1]).not.toHaveAttribute('disabled');

    //select chart to refresh
    await userEvent.click(chartCheckbox[1]);
    await userEvent.click(chartCheckbox[2]);

    //save button
    const saveBtn = await screen.findByTestId('accept-button');
    expect(saveBtn).toBeInTheDocument();
    await userEvent.click(saveBtn);
  });

  it('[NEGATIVE] should render error screen', async () => {
    let store: ReturnType<typeof createTestStore>;
    let result: RenderResult | undefined;
    getDashboardError();
    store = createTestStore({
      studies: studiesState,
    });
    await act(() => {
      result = render(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <Dashboard />
            </ConnectedRouter>
          </Provider>
        </ThemeProvider>
      );
    });
    
    const dashboard = await screen.findByTestId('dashboard');
    expect(dashboard).toBeInTheDocument();

    const errorText = await screen.findByText('Something went wrong. Please try again later.');
    expect(errorText).toBeInTheDocument();
  })
});
