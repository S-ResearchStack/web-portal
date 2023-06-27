import { enableFetchMocks } from 'jest-fetch-mock';
import { act, renderHook, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import React from 'react';
import { makeHistory } from 'src/modules/navigation/store';
import { makeStore } from 'src/modules/store/store';
import { maskEndpointAsFailure } from 'src/modules/api/mock';

import {
  resetPasswordSlice,
  resetPasswordInitialState,
  ResetPasswordState,
  useResetPassword,
} from 'src/modules/auth/forgot-password/resetPassword.slice';

let history: ReturnType<typeof makeHistory>;
let store: ReturnType<typeof makeStore>;

const resetToken =
  'e30=.eyJlbWFpbCI6InVzZXJuYW1lQHNhbXN1bmcuY29tIiwicm9sZXMiOlsidGVhbS1hZG1pbiJdfQ==';
const password = 'password';

beforeAll(() => {
  enableFetchMocks();
});

beforeEach(() => {
  history = makeHistory();
  store = makeStore(history);
});

describe('store', () => {
  it('should create initial state', () => {
    expect(resetPasswordSlice.reducer(undefined, { type: '' })).toEqual(resetPasswordInitialState);
  });

  it('[NEGATIVE] broken initial state', () => {
    const brokenInitialState = { unexpected: 'unexpected' } as unknown as ResetPasswordState;
    expect(resetPasswordSlice.reducer(brokenInitialState, { type: '' })).toEqual(
      brokenInitialState
    );
  });
});

describe('useResetPassword', () => {
  const setUpHook = () =>
    renderHook(() => useResetPassword(), {
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

  it('should send reset password request', async () => {
    hook = setUpHook();

    expect(hook.result.current.isLoading).toBeFalsy();
    expect(hook.result.current.error).toBeUndefined();

    act(() => {
      hook.result.current.resetPassword({
        email: 'example@samsung.com',
        password,
        resetToken,
      });
    });

    expect(hook.result.current).toMatchObject({
      isLoading: true,
    });

    await waitFor(() => expect(hook.result.current.isLoading).toBeFalsy());
    await waitFor(() => expect(hook.result.current.error).toBeFalsy());

    expect(hook.result.current.error).toBeUndefined();
  });

  it('[NEGATIVE] should send reset password request with an error', async () => {
    hook = setUpHook();

    expect(hook.result.current.isLoading).toBeFalsy();
    expect(hook.result.current.error).toBeUndefined();

    await act(async () => {
      await maskEndpointAsFailure('resetPassword', async () => {
        hook.result.current.resetPassword({
          email: 'example@samsung.com',
          password,
          resetToken,
        });
      });
    });

    expect(hook.result.current.isLoading).toBeFalsy();
    expect(hook.result.current.error).not.toBeUndefined();
  });

  it('[NEGATIVE] should not send reset password request if some of data is empty', async () => {
    hook = setUpHook();

    expect(hook.result.current.isLoading).toBeFalsy();
    expect(hook.result.current.error).toBeUndefined();

    act(() => {
      hook.result.current.resetPassword({
        email: 'example@samsung.com',
        password,
        resetToken: '',
      });
    });

    expect(hook.result.current).toMatchObject({});

    expect(hook.result.current.isLoading).toBeFalsy();
    expect(hook.result.current.error).toBeUndefined();
  });
});
