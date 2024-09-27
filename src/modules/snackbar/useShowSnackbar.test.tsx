import React from 'react';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import { act, renderHook, screen } from '@testing-library/react';
import { theme } from 'src/styles';
import { ThemeProvider } from 'styled-components/';
import { Provider } from 'react-redux';
import delay from 'src/common/utils/waitFor';
import { createTestStore } from '../store/testing';
import useShowSnackbar from './useShowSnackbar';
import SnackbarContainer, { TRANSITION_DURATION_MS } from './SnackbarContainer';

describe('useShowSnackbar', () => {
  it('show snackbar', async () => {
    const store = createTestStore({});

    const hook = renderHook(() => useShowSnackbar(), {
      wrapper: ({ children }) => (
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            {children}
            <SnackbarContainer useSimpleGrid />
          </Provider>
        </ThemeProvider>
      ),
    });

    act(() =>
      hook.result.current({
        text: 'Test snackbar 1',
      })
    );

    expect(await screen.findByText('Test snackbar 1')).toBeInTheDocument();

    await delay(TRANSITION_DURATION_MS);

    act(() =>
      hook.result.current({
        text: 'Test snackbar 2',
      })
    );

    expect(await screen.findByText('Test snackbar 2')).toBeInTheDocument();
  });

  it('[NEGATIVE] show snackbar with undefined text', async () => {
    const store = createTestStore({});

    const hook = renderHook(() => useShowSnackbar(), {
      wrapper: ({ children }) => (
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            {children}
            <SnackbarContainer useSimpleGrid />
          </Provider>
        </ThemeProvider>
      ),
    });

    act(() =>
      hook.result.current({
        text: undefined as any,
      })
    );

    expect(await screen.findByTestId('snackbar-text')).toBeInTheDocument();
    expect(await screen.findByTestId('snackbar-text')).toHaveTextContent('');
  });
});
