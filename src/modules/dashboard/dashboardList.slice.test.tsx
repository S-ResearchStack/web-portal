import React from 'react';
import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from 'src/modules/store/store';
import { act } from 'react-test-renderer';
import API from 'src/modules/api';
import { useDashboardList } from './dashboardList.slice';


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

const getDashboardListError = () => {
    API.mock.provideEndpoints({
        getDashboardList() {
            return API.mock.failedResponse({status: 400});
        }
    })
}

describe('useDashboardList', () => {
  let hook: ReturnType<typeof setUpHook>;
  afterEach(() => {
    act(() => unSetHook(hook));
  });
  it('should fetch dashboard list', async () => {
    hook = setUpHook(() => useDashboardList());
    await act(async () => {
      await hook.result.current.fetch({ studyId: 'testId' });
    });
    expect(hook.result.current.data).not.toBeEmpty();
  });

  it('[NEGATIVE] get list dashboard fail', async () => {
    getDashboardListError();
    hook = setUpHook(() => useDashboardList());
    await act(async () => {
      await hook.result.current.fetch({ studyId: 'testId' });
    });
    expect(hook.result.current.data).toBeUndefined();
  });
});
