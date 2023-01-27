import React from 'react';
import 'jest-styled-components';
import { act, render, screen } from '@testing-library/react';
import theme from 'src/styles/theme';
import { store } from 'src/modules/store/store';
import { history } from 'src/modules/navigation/store';
import { ThemeProvider } from 'styled-components/';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';

import 'src/__mocks__/setupWindowMatchMediaMock';
import 'src/__mocks__/setupResizeObserverMock';
import 'src/__mocks__/setupRangeMock';

import Studies from 'src/modules/studies/Studies';

describe('Studies', () => {
  it('should render', async () => {
    await act(() => {
      render(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <Studies onStudySelectionFinished={jest.fn} />
            </ConnectedRouter>
          </Provider>
        </ThemeProvider>
      );
    });

    expect(document.documentElement).toMatchSnapshot();

    const signOutBtn = await screen.findByTestId('user-profile-signout-action');
    await userEvent.click(signOutBtn);
    expect(signOutBtn).toBeInTheDocument();
  });
});
