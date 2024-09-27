import { renderHook } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { matchPath } from 'react-router-dom';
import { act } from 'react-test-renderer';
import { history, Path } from 'src/modules/navigation/store';
import { store } from 'src/modules/store/store';
import { useChartEditor } from './chartEditor.slice';

const setUpHook = <T extends () => ReturnType<T>>(useHook: () => ReturnType<T>) =>
  renderHook(() => useHook(), {
    wrapper: ({ children }: React.PropsWithChildren) => (
      <Provider store={store}>{children}</Provider>
    ),
  });

const unSetHook = (hook: ReturnType<typeof setUpHook>) => {
  'reset' in hook.result.current && hook.result.current.reset();
  hook.unmount();
};

describe('useChartEditor', () => {
  let hook: ReturnType<typeof setUpHook>;
  afterEach(() => {
    act(() => unSetHook(hook));
  });

  it('should init state', () => {
    hook = setUpHook(() => useChartEditor());
    expect(hook.result.current.isLoading).toBe(false);
    expect(hook.result.current.isSaving).toBe(false);
    expect(hook.result.current.savedOn).toBe(undefined);
    expect(hook.result.current.lastTouchedOn).toBe(undefined);
    expect(hook.result.current.isFailedConnection).toBe(undefined);
    expect(hook.result.current.data).toEqual({ studyId: '', dashboardId: '' });
    expect(hook.result.current.errors).toBe(undefined);
  });
  it('should generate empty chart successfully', async () => {
    hook = setUpHook(() => useChartEditor());
    const generateChartArgs = { studyId: 'testId', dashboardId: '1' };
    await act(async () => {
      await hook.result.current.generateChart(generateChartArgs);
    });
    expect(hook.result.current.data).toMatchObject({
      studyId: 'testId',
      dashboardId: '1',
      configBasic: {},
      configSpecific: {},
    });
  });

  it('should load existed chart successfully', async () => {
    hook = setUpHook(() => useChartEditor());
    const loadChartArgs = { studyId: 'testId', dashboardId: '1', chartId: '3', onError: jest.fn() };
    await act(async () => {
      await hook.result.current.loadChart(loadChartArgs);
    });
    expect(hook.result.current.data.id).toBeDefined();

    expect(hook.result.current.data.source).toMatchObject({
      database: 'database_0',
      query: 'select * from table_0',
    });
  });

  it('[NEGATIVE] fail to get chart while loading chart', async () => {
    hook = setUpHook(() => useChartEditor());
    const loadChartArgs = {
      studyId: 'testId',
      dashboardId: 'invalid',
      chartId: '3',
      onError: jest.fn(),
    };
    await act(async () => {
      await hook.result.current.loadChart(loadChartArgs);
    });
    expect(hook.result.current.data.id).toBeUndefined();
  });

  it('should create chart', async () => {
    hook = setUpHook(() => useChartEditor());
    const chartData = {
      studyId: 'testId',
      dashboardId: '1',
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
    };
    await act(async () => {
      await hook.result.current.updateChart(chartData);
    });
    await act(async () => {
      await hook.result.current.saveChart();
    });
    expect(
      matchPath(history.location.pathname, {
        path: Path.Dashboard,
        exact: true,
      })
    ).not.toBeNull();
  });

  it('should update chart', async () => {
    hook = setUpHook(() => useChartEditor());
    const loadChartArgs = { studyId: 'testId', dashboardId: '1', chartId: '3', onError: jest.fn() };
    await act(async () => {
      await hook.result.current.loadChart(loadChartArgs);
    });
    const chartData = hook.result.current.data;
    await act(async () => {
      await hook.result.current.saveChart(chartData);
    });
    expect(
      matchPath(history.location.pathname, {
        path: Path.Dashboard,
        exact: true,
      })
    ).not.toBeNull();
  });
  it('should remove chart', async () => {
    hook = setUpHook(() => useChartEditor());
    const loadChartArgs = { studyId: 'testId', dashboardId: '1', chartId: '3', onError: jest.fn() };
    await act(async () => {
      await hook.result.current.loadChart(loadChartArgs);
    });
    await act(async () => {
      await hook.result.current.removeChart();
    });
    expect(
      matchPath(history.location.pathname, {
        path: Path.Dashboard,
        exact: true,
      })
    ).not.toBeNull();
  });
});
