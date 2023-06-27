/* eslint-disable import/first */
import React from 'react';
import 'jest-styled-components';
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as typeof global.TextDecoder;

import { ThemeProvider } from 'styled-components/';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { store } from 'src/modules/store/store';
import { theme } from 'src/styles';
import { act, render, screen } from '@testing-library/react';
import { history } from 'src/modules/navigation/store';
import MainLayout from 'src/modules/main-layout/MainLayout';

describe('MainLayout', () => {
  it('should render', async () => {
    await act(() => {
      render(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <MainLayout />
            </ConnectedRouter>
          </Provider>
        </ThemeProvider>
      );
    });

    expect(await screen.findByTestId('main-layout')).toMatchSnapshot();
  });
});
