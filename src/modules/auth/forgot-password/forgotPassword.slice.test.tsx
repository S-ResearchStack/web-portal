import { enableFetchMocks } from 'jest-fetch-mock';
import { act, renderHook, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import React from 'react';

import { makeHistory } from 'src/modules/navigation/store';
import { makeStore } from 'src/modules/store/store';
import { maskEndpointAsFailure } from 'src/modules/api/mock';

import {
  passwordRecoveryInitialState,
  passwordRecoverySlice,
  PasswordRecoveryState,
  usePasswordRecovery,
} from 'src/modules/auth/forgot-password/forgotPassword.slice';

let history: ReturnType<typeof makeHistory>;
let store: ReturnType<typeof makeStore>;

beforeAll(() => {
  enableFetchMocks();
});

beforeEach(() => {
  history = makeHistory();
  store = makeStore(history);
});

describe('store', () => {
  it('should create initial state', () => {
    expect(passwordRecoverySlice.reducer(undefined, { type: '' })).toEqual(
      passwordRecoveryInitialState
    );
  });

  it('[NEGATIVE] broken initial state', () => {
    const brokenInitialState = { unexpected: 'unexpected' } as unknown as PasswordRecoveryState;
    expect(passwordRecoverySlice.reducer(brokenInitialState, { type: '' })).toEqual(
      brokenInitialState
    );
  });

  it('should clear error', () => {
    const error = { message: 'message' };
    const stateWithError = passwordRecoverySlice.reducer({ error }, { type: '' });

    expect(stateWithError).toEqual({ error });

    expect(
      passwordRecoverySlice.reducer(
        stateWithError,
        passwordRecoverySlice.actions.clearRecoveryPasswordError()
      )
    ).toEqual({
      error: undefined,
    });
  });
});

describe('useResetPassword', () => {
  const setUpHook = () =>
    renderHook(() => usePasswordRecovery(), {
      wrapper: ({ children }: React.PropsWithChildren<unknown>) => (
        <Provider store={store}>{children}</Provider>
      ),
    });

  const unSetHook = (hook: ReturnType<typeof setUpHook>) => {
    hook.unmount();
  };

  let hook: ReturnType<typeof setUpHook>;

  beforeEach(() => {
    localStorage.setItem('API_URL', 'https://samsung.com/');
  });

  afterEach(() => {
    act(() => unSetHook(hook));
  });

  it('should send password recovery request', async () => {
    hook = setUpHook();

    expect(hook.result.current.isLoading).toBeFalsy();
    expect(hook.result.current.error).toBeUndefined();

    act(() => {
      hook.result.current.sendPasswordRecoveryRequest({
        email: 'example@samsung.com',
      });
    });

    expect(hook.result.current).toMatchObject({
      isLoading: true,
    });

    await waitFor(() => expect(hook.result.current.isLoading).toBeFalsy());
    await waitFor(() => expect(hook.result.current.error).toBeUndefined());

    expect(hook.result.current.error).toBeUndefined();
  });

  it('[NEGATIVE] should return 404 error', async () => {
    hook = setUpHook();

    expect(hook.result.current.isLoading).toBeFalsy();
    expect(hook.result.current.error).toBeUndefined();

    act(() => {
      hook.result.current.sendPasswordRecoveryRequest({
        email: 'invalid@samsung.com',
      });
    });

    expect(hook.result.current).toMatchObject({
      isLoading: true,
    });

    await waitFor(() => expect(hook.result.current.isLoading).toBeFalsy());
    await waitFor(() => expect(hook.result.current.error?.isNotFound).toBeTrue());

    expect(hook.result.current.error?.isNotFound).toBeTrue();
  });

  it('[NEGATIVE] should send password recovery request with an error', async () => {
    hook = setUpHook();

    expect(hook.result.current.isLoading).toBeFalsy();
    expect(hook.result.current.error).toBeUndefined();

    await act(async () => {
      await maskEndpointAsFailure('forgotPassword', async () => {
        await hook.result.current.sendPasswordRecoveryRequest({
          email: 'example@samsung.com',
        });
      });
    });

    expect(hook.result.current.isLoading).toBeFalsy();
    expect(hook.result.current.error).not.toBeUndefined();
  });

  it('[NEGATIVE] should not send password recovery request if email is not provided', async () => {
    hook = setUpHook();

    expect(hook.result.current.isLoading).toBeFalsy();
    expect(hook.result.current.error).toBeUndefined();

    act(() => {
      hook.result.current.sendPasswordRecoveryRequest({
        email: '',
      });
    });

    expect(hook.result.current).toMatchObject({});

    expect(hook.result.current.isLoading).toBeFalsy();
    expect(hook.result.current.error).toBeUndefined();
  });

  it('should clear error', async () => {
    hook = setUpHook();

    expect(hook.result.current.isLoading).toBeFalsy();
    expect(hook.result.current.error).toBeUndefined();

    await act(async () => {
      await maskEndpointAsFailure('forgotPassword', async () => {
        await hook.result.current.sendPasswordRecoveryRequest({
          email: 'example@samsung.com',
        });
      });
    });

    expect(hook.result.current.isLoading).toBeFalsy();
    expect(hook.result.current.error).not.toBeUndefined();

    act(() => {
      hook.result.current.clearError();
    });

    expect(hook.result.current.error).toBeUndefined();
  });
});
