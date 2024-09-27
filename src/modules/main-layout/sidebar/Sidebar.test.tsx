import 'jest-styled-components';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConnectedRouter } from 'connected-react-router';
import React from 'react';
import { Provider } from 'react-redux';
import Sidebar from 'src/modules/main-layout/sidebar/Sidebar';
import { history } from 'src/modules/navigation/store';
import { store } from 'src/modules/store/store';
import theme from 'src/styles/theme';
import { ThemeProvider } from 'styled-components/';

describe('Sidebar', () => {
  it('should render', async () => {
    const { baseElement } = render(
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          <ConnectedRouter history={history}>
            <Sidebar onStudyClick={jest.fn} />
          </ConnectedRouter>
        </Provider>
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();
  });

  it('should render with desktop type', async () => {
    jest.spyOn(window.screen, "width", "get").mockReturnValue(1440);
    const { baseElement } = render(
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          <ConnectedRouter history={history}>
            <Sidebar onStudyClick={jest.fn} />
          </ConnectedRouter>
        </Provider>
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();
    const resizeBtn = await screen.findByTestId('resize-button');
    await userEvent.click(resizeBtn);
  });
  it('should render with laptop type', async () => {
    window.innerWidth = 1000;
    const { baseElement } = render(
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          <ConnectedRouter history={history}>
            <Sidebar onStudyClick={jest.fn} />
          </ConnectedRouter>
        </Provider>
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();
  });

  it('[NEGATIVE] should render with invalid screen width', async () => {
    window.innerWidth = -999;
    const { baseElement } = render(
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          <ConnectedRouter history={history}>
            <Sidebar onStudyClick={jest.fn} />
          </ConnectedRouter>
        </Provider>
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();
  });
});
