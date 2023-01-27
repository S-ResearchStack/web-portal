import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';

import createDataSlice, { DataSliceState } from 'src/modules/store/createDataSlice';
import { store } from 'src/modules/store/store';
import createReducers from 'src/modules/store/reducers';
import { currentSnackbarSelector } from 'src/modules/snackbar/snackbar.slice';
import {
  FAILED_CONNECTION_ERROR_TEXT,
  FailedConnectionError,
} from 'src/modules/api/executeRequest';

const data = { counter: 0 };
const args = { counter: 0 };

const FETCH_ARGS_FOR_ERROR: typeof args = { counter: -1 };
const FETCH_ARGS_FOR_CONNECTION_ERROR: typeof args = { counter: -2 };
const TEST_ERROR_MESSAGE = 'test-error';

const setUpSlice = () =>
  createDataSlice({
    name: 'test-slice',
    fetchData: async (a: typeof args): Promise<typeof data> => {
      switch (a) {
        case FETCH_ARGS_FOR_ERROR:
          throw new Error(TEST_ERROR_MESSAGE);

        case FETCH_ARGS_FOR_CONNECTION_ERROR:
          throw new FailedConnectionError();

        default:
          return a;
      }
    },
  });

const slice = setUpSlice();

const setUpStore = () =>
  store.replaceReducer(
    createReducers({
      [slice.name]: slice.reducer,
    })
  );

setUpStore();

const setUpHook = (fetchArgs: typeof data | false, initialData?: typeof data) =>
  renderHook(
    (a: typeof args | false) =>
      slice.hook(
        {
          initialData,
          fetchArgs: a || fetchArgs,
        },
        {
          text: TEST_ERROR_MESSAGE,
        }
      ),
    {
      wrapper: ({ children }: React.PropsWithChildren) => (
        <Provider store={store}>{children}</Provider>
      ),
    }
  );

const unSetHook = (hook: ReturnType<typeof setUpHook>) => {
  hook.result.current.reset();
  hook.unmount();
};

const createEmptyState = <D extends typeof data, A extends typeof data>(
  state?: Partial<DataSliceState<D, A>>
): DataSliceState<D, A> => ({
  fetchArgs: null,
  prevFetchArgs: null,
  ...state,
});

describe('store', () => {
  it('should have initial state', () => {
    expect(slice.reducer(undefined, { type: '' })).toEqual({
      fetchArgs: null,
      prevFetchArgs: null,
    });
  });

  it('should set data to store', () => {
    expect(slice.reducer(createEmptyState(), slice.actions.setData({ data }))).toMatchObject({
      data,
    });
  });

  it('[NEGATIVE] should set wrong data to store', () => {
    expect(
      slice.reducer(
        createEmptyState(),
        slice.actions.setData({ data: undefined as unknown as typeof data })
      )
    ).toMatchObject({
      data: undefined,
    });
  });

  it('should make loading', () => {
    expect(
      slice.reducer(
        createEmptyState({
          isLoading: false,
          error: TEST_ERROR_MESSAGE,
        }),
        slice.actions.loadingStarted({ fetchArgs: args })
      )
    ).toMatchObject({
      fetchArgs: args,
      prevFetchArgs: {},
      isLoading: true,
      error: undefined,
    });
  });

  it('[NEGATIVE] should make loading state with wrong fetch parameters', () => {
    expect(
      slice.reducer(
        createEmptyState({
          isLoading: false,
          error: TEST_ERROR_MESSAGE,
        }),
        slice.actions.loadingStarted({ fetchArgs: null as unknown as typeof data })
      )
    ).toMatchObject({
      fetchArgs: null,
      prevFetchArgs: {},
      isLoading: true,
      error: undefined,
    });
  });

  it('should make success', () => {
    expect(
      slice.reducer(
        createEmptyState({
          isLoading: true,
          error: TEST_ERROR_MESSAGE,
          data: undefined,
        }),
        slice.actions.loadingSuccess({ data })
      )
    ).toMatchObject({
      isLoading: false,
      error: undefined,
      data,
    });
  });

  it('[NEGATIVE] should make success state with wrong received data', () => {
    expect(
      slice.reducer(
        createEmptyState({
          isLoading: true,
          error: TEST_ERROR_MESSAGE,
          data: undefined,
        }),
        slice.actions.loadingSuccess({ data: null as unknown as typeof data })
      )
    ).toMatchObject({
      isLoading: false,
      error: undefined,
      data: null,
    });
  });

  it('should make failure', () => {
    expect(
      slice.reducer(
        createEmptyState({
          isLoading: true,
          data,
          error: undefined,
        }),
        slice.actions.loadingFailed(TEST_ERROR_MESSAGE)
      )
    ).toMatchObject({
      isLoading: false,
      data: undefined,
      error: TEST_ERROR_MESSAGE,
    });
  });

  it('[NEGATIVE] should make failure with wrong error type', () => {
    expect(
      slice.reducer(
        createEmptyState({
          isLoading: true,
          data,
          error: undefined,
        }),
        slice.actions.loadingFailed(new Error(TEST_ERROR_MESSAGE) as unknown as string)
      )
    ).toMatchObject({
      isLoading: false,
      data: undefined,
      error: `Error: ${TEST_ERROR_MESSAGE}`,
    });
  });

  it('should make reset', () => {
    expect(
      slice.reducer(
        createEmptyState({
          fetchArgs: args,
          prevFetchArgs: args,
          isLoading: true,
          data,
          error: TEST_ERROR_MESSAGE,
        }),
        slice.actions.reset()
      )
    ).toEqual({
      fetchArgs: null,
      prevFetchArgs: null,
      isLoading: undefined,
      data: undefined,
      error: undefined,
    });
  });

  it('[NEGATIVE] should make reset empty state', () => {
    expect(slice.reducer(undefined, slice.actions.reset())).toEqual({
      fetchArgs: null,
      prevFetchArgs: null,
      isLoading: undefined,
      data: undefined,
      error: undefined,
    });
  });

  it('should select state slice', () => {
    slice.actions.reset();

    expect(slice.stateSelector(store.getState())).toEqual({
      fetchArgs: null,
      prevFetchArgs: null,
    });
  });

  it('[NEGATIVE] should select state slice while store is empty', () => {
    slice.actions.reset();

    expect(slice.stateSelector({} as ReturnType<typeof store.getState>)).toEqual(undefined);
  });

  it('should support cache mechanism while success scenario', () => {
    const firstLoadingFetchArgs = { counter: 0 };
    const secondLoadingFetchArgs = { counter: 1 };

    const loadingState = slice.reducer(
      undefined,
      slice.actions.loadingStarted({ fetchArgs: firstLoadingFetchArgs })
    );

    expect(loadingState).toMatchObject({
      fetchArgs: firstLoadingFetchArgs,
      prevFetchArgs: {},
    });

    const successState = slice.reducer(loadingState, slice.actions.loadingSuccess({ data }));

    expect(successState).toMatchObject({
      fetchArgs: firstLoadingFetchArgs,
      prevFetchArgs: firstLoadingFetchArgs,
    });

    const reloadingState = slice.reducer(
      successState,
      slice.actions.loadingStarted({ fetchArgs: secondLoadingFetchArgs })
    );

    expect(reloadingState).toMatchObject({
      fetchArgs: secondLoadingFetchArgs,
      prevFetchArgs: firstLoadingFetchArgs,
    });
  });

  it('[NEGATIVE] should support cache mechanism while failure scenario', () => {
    const firstLoadingFetchArgs = { counter: 0 };

    const loadingState = slice.reducer(
      undefined,
      slice.actions.loadingStarted({ fetchArgs: firstLoadingFetchArgs })
    );

    expect(loadingState).toMatchObject({
      fetchArgs: firstLoadingFetchArgs,
      prevFetchArgs: {},
    });

    const failureState = slice.reducer(
      loadingState,
      slice.actions.loadingFailed(TEST_ERROR_MESSAGE)
    );

    expect(failureState).toMatchObject({
      fetchArgs: firstLoadingFetchArgs,
      prevFetchArgs: firstLoadingFetchArgs,
    });
  });
});

describe('hook', () => {
  let hook: ReturnType<typeof setUpHook>;

  afterEach(() => {
    act(() => unSetHook(hook));
  });

  it('should create with empty initial state', () => {
    hook = setUpHook(false);

    expect(hook.result.current).toMatchObject({
      fetchArgs: null,
      prevFetchArgs: null,
    });
  });

  it('should create with initial state', () => {
    hook = setUpHook(false, data);

    expect(hook.result.current).toMatchObject({
      fetchArgs: null,
      prevFetchArgs: null,
      data,
    });
  });

  it('[NEGATIVE] should create with broken initial state', () => {
    hook = setUpHook(false, null as unknown as typeof data);

    expect(hook.result.current).toMatchObject({
      fetchArgs: null,
      prevFetchArgs: null,
    });
  });

  it('should fetch data to state', async () => {
    hook = setUpHook(args);

    expect(hook.result.current).toMatchObject({
      isLoading: true,
      data: undefined,
    });

    await waitFor(() => hook.result.current.isLoading);

    expect(hook.result.current).toMatchObject({
      isLoading: false,
      data,
    });
  });

  it('should cache data when updating with unchanged parameters', async () => {
    const fetchArgs = args;

    hook = setUpHook(args);

    expect(hook.result.current).toMatchObject({
      isLoading: true,
      data: undefined,
    });

    await waitFor(() => hook.result.current.isLoading);

    expect(hook.result.current).toMatchObject({
      isLoading: false,
      data,
    });

    act(() => hook.rerender(fetchArgs));

    expect(hook.result.current).toMatchObject({
      isLoading: false,
      data,
    });
  });

  it('[NEGATIVE] should cache data when updating with broken update parameters', async () => {
    hook = setUpHook(args);

    expect(hook.result.current).toMatchObject({
      isLoading: true,
      data: undefined,
    });

    await waitFor(() => hook.result.current.isLoading);

    expect(hook.result.current).toMatchObject({
      isLoading: false,
      data,
    });

    act(() => hook.rerender(undefined));

    expect(hook.result.current).toMatchObject({
      isLoading: false,
      data,
    });
  });

  it('should ignore cache data when force updating with unchanged parameters', async () => {
    hook = setUpHook(args);

    expect(hook.result.current).toMatchObject({
      isLoading: true,
      data: undefined,
    });

    await waitFor(() => hook.result.current.isLoading);

    expect(hook.result.current).toMatchObject({
      isLoading: false,
      data,
    });

    await act(() => hook.result.current.refetch());

    expect(hook.result.current).toMatchObject({
      isLoading: false,
      data,
    });
  });

  it('[NEGATIVE] should prevent data cache when force updating with `positive` parameters', async () => {
    act(() => {
      hook = setUpHook(false);
    });

    await waitFor(() => !hook.result.current.isLoading);

    expect(hook.result.current.isLoading).toBeFalsy();
    expect(hook.result.current.data).toBeUndefined();

    await act(async () => {
      hook.rerender(args);
      await waitFor(() => expect(hook.result.current.isLoading).toBeFalsy());
    });

    expect(hook.result.current).toMatchObject({
      isLoading: false,
      data,
    });
  });

  it('should ignore cache data when updating with changed parameters', async () => {
    let fetchArgs = { ...args };
    let outputData = { ...data };

    hook = setUpHook(fetchArgs);

    expect(hook.result.current).toMatchObject({
      isLoading: true,
      data: undefined,
    });

    await waitFor(() => hook.result.current.isLoading);

    expect(hook.result.current).toMatchObject({
      isLoading: false,
      data: outputData,
    });

    act(() => {
      fetchArgs = { counter: fetchArgs.counter + 1 };
      outputData = { counter: outputData.counter + 1 };
      hook.rerender(fetchArgs);
    });

    expect(hook.result.current.isLoading).toBeTruthy();

    await waitFor(() => !hook.result.current.isLoading);

    expect(hook.result.current).toMatchObject({
      isLoading: false,
      data: outputData,
    });
  });

  it('[NEGATIVE] should ignore cache data when updating with changed parameters', async () => {
    hook = setUpHook(args);

    expect(hook.result.current).toMatchObject({
      isLoading: true,
      data: undefined,
    });

    await waitFor(() => hook.result.current.isLoading);

    expect(hook.result.current).toMatchObject({
      isLoading: false,
      data,
    });

    act(() => {
      hook.rerender(false);
    });

    await waitFor(() => expect(hook.result.current.isLoading).toBeFalsy());

    expect(hook.result.current).toMatchObject({
      isLoading: false,
      data,
    });
  });

  it('should reset state', async () => {
    hook = setUpHook(args, data);

    await waitFor(() => hook.result.current.isLoading);
    await waitFor(() => !hook.result.current.isLoading);

    expect(hook.result.current).toMatchObject({
      fetchArgs: args,
      prevFetchArgs: args,
      error: undefined,
      data,
    });

    act(() => hook.result.current.reset());

    expect(hook.result.current).toMatchObject({
      fetchArgs: null,
      prevFetchArgs: null,
      error: undefined,
      data,
    });
  });

  it('[NEGATIVE] should reset empty state', async () => {
    hook = setUpHook(false);

    expect(hook.result.current).toMatchObject({
      fetchArgs: null,
      prevFetchArgs: null,
      error: undefined,
      data: undefined,
    });

    act(() => hook.result.current.reset());

    expect(hook.result.current).toMatchObject({
      fetchArgs: null,
      prevFetchArgs: null,
      error: undefined,
      data: undefined,
    });
  });

  it('[NEGATIVE] should catch error when data loading', async () => {
    hook = setUpHook(FETCH_ARGS_FOR_ERROR);

    expect(hook.result.current).toMatchObject({
      isLoading: true,
      error: undefined,
    });

    await waitFor(() => !hook.result.current.isLoading);

    expect(currentSnackbarSelector(store.getState()).text).toMatch(TEST_ERROR_MESSAGE);

    expect(hook.result.current).toMatchObject({
      isLoading: false,
      error: TEST_ERROR_MESSAGE,
    });
  });

  it('[NEGATIVE] should catch connection error when data loading', async () => {
    hook = setUpHook(FETCH_ARGS_FOR_CONNECTION_ERROR);

    expect(hook.result.current).toMatchObject({
      isLoading: true,
      error: undefined,
    });

    await waitFor(() => !hook.result.current.isLoading);

    expect(currentSnackbarSelector(store.getState()).text).toMatch(FAILED_CONNECTION_ERROR_TEXT);

    expect(hook.result.current).toMatchObject({
      isLoading: false,
      error: FAILED_CONNECTION_ERROR_TEXT,
    });
  });
});
