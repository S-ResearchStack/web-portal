import React from 'react';
import 'src/__mocks__/setupWindowMatchMediaMock';
import 'src/__mocks__/setupResizeObserverMock';
import 'src/__mocks__/setupRangeMock';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import { act, renderHook, screen } from '@testing-library/react';
import { theme } from 'src/styles';
import { ThemeProvider } from 'styled-components/';
import { Provider } from 'react-redux';
import { createTestStore } from '../store/testing';
import useShowSnackbar from './useShowSnackbar';
import SnackbarContainer from './SnackbarContainer';

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

    act(() =>
      hook.result.current({
        text: 'Test snackbar 2',
      })
    );

    expect(await screen.findByText('Test snackbar 2')).toBeInTheDocument();
  });
});
