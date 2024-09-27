import _uniqueId from 'lodash/uniqueId';
import API, { DashboardListResponse, ChartListResponse } from 'src/modules/api';

const dashboard = { id: `${_uniqueId()}`, title: 'Dashboard 1' };
const dashboard2 = { id: `${_uniqueId()}`, title: 'Dashboard 2' };
const charts = [
  {
    id: `${_uniqueId()}`,
    source: {
      database: 'database_0',
      query: 'select * from table_0',
    },
    configBasic: {
      name: 'Chart Pie',
      type: 'PIE',
    },
    configSpecific: {
      category: 'name',
      value: 'index',
    },
  },
  {
    id: `${_uniqueId()}`,
    source: {
      database: 'database_0',
      query: 'select * from table_0',
    },
    configBasic: {
      name: 'Chart Donut',
      type: 'DONUT',
    },
    configSpecific: {
      category: 'status',
      value: 'count',
      color: 'wonderland',
    },
  },
  {
    id: `${_uniqueId()}`,
    source: {
      database: 'database_0',
      query: 'select * from table_0',
    },
    configBasic: {
      name: 'Chart Bar',
      type: 'BAR',
    },
    configSpecific: {
      category: 'name',
      value: 'count',
      isHorizontal: false,
    },
  },
  {
    id: `${_uniqueId()}`,
    source: {
      database: 'database_0',
      query: 'select * from table_0',
    },
    configBasic: {
      name: 'Chart Line',
      type: 'LINE',
    },
    configSpecific: {
      category: 'status',
      value: 'index',
      isSmooth: true,
    },
  },
  {
    id: `${_uniqueId()}`,
    source: {
      database: 'database_0',
      query: 'select * from table_0',
    },
    configBasic: {
      name: 'Chart Table',
      type: 'TABLE',
    },
    configSpecific: {
      columns: [
        {
          name: 'name',
        },
        {
          name: 'status',
        },
        {
          name: 'count',
        },
        {
          name: 'index'
        }
      ],
    },
  },
  {
    id: `${_uniqueId()}`,
    source: {
      database: 'database_0',
      query: 'error',
    },
    configBasic: {
      name: 'Chart Error sql',
      type: 'PIE',
    },
    configSpecific: {
      category: 'status',
      value: 'count',
    },
  },
  {
    id: `${_uniqueId()}`,
    source: {
      database: 'database_0',
      query: 'select * from table_0',
    },
    configBasic: {
      name: 'Chart Error config',
      type: 'PIE',
    },
    configSpecific: {
      category: 'status',
      value: '',
    },
  }
] as ChartListResponse;
const charts2 = [
  {
    id: `${_uniqueId()}`,
    source: {
      database: 'database_0',
      query: 'select * from table_0',
    },
    configBasic: {
      name: 'Chart Pie 2',
      type: 'PIE',
    },
    configSpecific: {
      category: 'status',
      value: 'count',
    },
  },
  {
    id: `${_uniqueId()}`,
    source: {
      database: 'database_0',
      query: 'select * from table_0',
    },
    configBasic: {
      name: 'Chart Donut 2',
      type: 'DONUT',
    },
    configSpecific: {
      category: 'status',
      value: 'count',
      color: 'wonderland',
    },
  },
] as ChartListResponse;

const mockDashboardList: DashboardListResponse = [dashboard, dashboard2];
const mockDashboardChartList: Record<string, ChartListResponse> = { [dashboard.id]: charts, [dashboard2.id]: charts2 };

API.mock.provideEndpoints({
  getDashboardList() {
    return API.mock.response(mockDashboardList);
  },
  createDashboard({ studyId }, body) {
    const id = `${_uniqueId()}`;
    mockDashboardList.push({
      id,
      ...body
    });
    mockDashboardChartList[id] = [];
    return API.mock.response({ id });
  },
  getDashboard({ id }) {
    const item = mockDashboardList.find((e) => e.id === id);
    return !item
      ? API.mock.failedResponse({ status: 404, message: 'Not found' })
      : API.mock.response(item);
  },
  updateDashboard({ id }, body) {
    const idx = mockDashboardList.findIndex((e) => e.id === id);
    if (idx < 0)
      return API.mock.failedResponse({ status: 404 });

    mockDashboardList[idx] = {
      ...mockDashboardList[idx],
      ...body,
    };
    return API.mock.response(undefined);

  },
  deleteDashboard({ id }) {
    const i = mockDashboardList.findIndex((c) => c.id === id);
    if (i < 0)
      return API.mock.failedResponse({ status: 404 });

    mockDashboardList.splice(i, 1);
    delete mockDashboardChartList[id];
    return API.mock.response(undefined);
  },
  getChartList({ dashboardId }) {
    const i = mockDashboardList.findIndex((c) => c.id === dashboardId);
    if (i < 0)
      return API.mock.failedResponse({ status: 404 });

    const mockChartList = mockDashboardChartList[dashboardId];
    return API.mock.response(mockChartList);
  },
  createChart({ dashboardId }, body) {
    const i = mockDashboardList.findIndex((c) => c.id === dashboardId);
    if (i < 0)
      return API.mock.failedResponse({ status: 404 });

    const id = `${_uniqueId()}`;
    const mockChartList = mockDashboardChartList[dashboardId];
    mockDashboardChartList[dashboardId] = [...mockChartList, { id, ...body }];

    return API.mock.response({ id });
  },
  getChart({ dashboardId, id }) {
    const i = mockDashboardList.findIndex((c) => c.id === dashboardId);
    if (i < 0)
      return API.mock.failedResponse({ status: 404 });

    const mockChartList = mockDashboardChartList[dashboardId];
    const item = mockChartList.find((e) => e.id === id);

    return !item
      ? API.mock.failedResponse({ status: 404, message: 'Not found' })
      : API.mock.response(item);
  },
  updateChart({ dashboardId, id }, body) {
    const i = mockDashboardList.findIndex((c) => c.id === dashboardId);
    if (i < 0)
      return API.mock.failedResponse({ status: 404 });

    const mockChartList = mockDashboardChartList[dashboardId];
    const idx = mockChartList.findIndex((e) => e.id === id);
    if (idx < 0)
      return API.mock.failedResponse({ status: 404 });

    const newMockChartList = [...mockChartList]
    newMockChartList[idx] = { ...mockChartList[idx], ...body };

    mockDashboardChartList[dashboardId] = [...newMockChartList];
    return API.mock.response(undefined);
  },
  deleteChart({ dashboardId, id }) {
    const i = mockDashboardList.findIndex((c) => c.id === dashboardId);
    if (i < 0)
      return API.mock.failedResponse({ status: 404 });

    const mockChartList = mockDashboardChartList[dashboardId];

    mockDashboardChartList[dashboardId] = [...mockChartList.filter(c => c.id !== id)];
    return API.mock.response(undefined);
  },
});
