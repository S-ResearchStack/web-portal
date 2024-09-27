/* eslint-disable import/first */
import '@testing-library/jest-dom';
import 'jest-styled-components';
import React from 'react';
import { TextDecoder, TextEncoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as typeof global.TextDecoder;

import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConnectedRouter } from 'connected-react-router';
import { Provider } from 'react-redux';
import MainLayout from 'src/modules/main-layout/MainLayout';
import { history } from 'src/modules/navigation/store';
import { theme } from 'src/styles';
import { ThemeProvider } from 'styled-components/';
import { createTestStore } from '../store/testing';
const createStore = () =>
  createTestStore({
    studies: {
      studies: [
        {
          id: 'test',
          name: 'test',
          color: 'black',
          createdAt: 0,
        },
      ],
      isLoading: false,
      selectedStudyId: 'test',
    },
  });

jest.mock('src/modules/dashboard/components/ApacheEchart', () => {
  return jest.fn(({ chartRef, size, style }) => {
    <div ref={chartRef} style={{ ...size, ...style }} />;
  });
});

describe('MainLayout', () => {
  it('should render', async () => {
    const store = createStore();
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

    const studyAvatar = (await screen.getAllByTestId('avatar-icon'))[0];
    await userEvent.click(studyAvatar);

    expect(screen.getByTestId('overview')).toBeInTheDocument();
    await userEvent.click(screen.getAllByTestId('avatar-icon')[1]);
  });
});
