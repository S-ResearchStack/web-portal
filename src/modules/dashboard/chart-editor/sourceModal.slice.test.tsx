import React from 'react';
import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from 'src/modules/store/store';
import { act } from 'react-test-renderer';
import { useDatabaseList, useSourceModal, useTableList } from './sourceModal.slice';
import API from 'src/modules/api';
import { SourceModalData } from './SourceModal';

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

const tableListRequestArgs = {
  studyId: 'testId',
  database: 'database',
};

const getListDBError = () => {
  API.mock.provideEndpoints({
    getListDatabase() {
      return API.mock.failedResponse({ status: 400 });
    },
  });
};

const getListTableError = () => {
  API.mock.provideEndpoints({
    getListTable() {
      return API.mock.failedResponse({ status: 400 });
    },
  });
};

describe('SourceModalSlice', () => {
  let hook: ReturnType<typeof setUpHook>;
  afterEach(() => {
    act(() => unSetHook(hook));
  });
  describe('useDatabaseList', () => {
    it('should get list database successfully', async () => {
      hook = setUpHook(() => useDatabaseList());
      await act(async () => {
        await hook.result.current.fetch({ studyId: 'testId' });
      });
      expect(hook.result.current.data).not.toBeEmpty();
    });

    it('[NEGATIVE] Fail to get list database', async () => {
      getListDBError();
      hook = setUpHook(() => useDatabaseList());
      await act(async () => {
        await hook.result.current.fetch({ studyId: 'testId' });
      });
      expect(hook.result.current.data).toBeUndefined();
    });
  });

  describe('useTableList', () => {
    it('should get list table successfully', async () => {
      hook = setUpHook(() => useTableList());
      await act(async () => {
        await hook.result.current.fetch(tableListRequestArgs);
      });
      expect(hook.result.current.data).not.toBeEmpty();
    });

    it('[NEGATIVE] Fail to get list table', async () => {
      getListTableError();
      hook = setUpHook(() => useTableList());
      await act(async () => {
        await hook.result.current.fetch(tableListRequestArgs);
      });
      expect(hook.result.current.data).toBeUndefined();
    });
  });

  describe('useSourceModal', () => {
    it('should execute query successfully', async () => {
      const sourceModalData = {
        source: {
          database: 'database',
          query: 'select * from table',
        },
      } as SourceModalData;
      hook = setUpHook(() => useSourceModal(sourceModalData));
      await act(async () => {
        await hook.result.current.executeQuery({ studyId: 'testId' });
      });
      expect(hook.result.current.cachedData.result).toBeDefined();
    });

    it('[NEGATIVE] Fail to execute query', async () => {
        const sourceModalData = {
          source: {
            database: 'database',
            query: 'error',
          },
        } as SourceModalData;
        hook = setUpHook(() => useSourceModal(sourceModalData));
        await act(async () => {
          await hook.result.current.executeQuery({ studyId: 'testId' });
        });
        expect(hook.result.current.cachedData.errors).toMatchObject({message: 'An error occurred while executing the query.'});
      });
  });
});
