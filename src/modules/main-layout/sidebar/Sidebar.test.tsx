import React from 'react';
import 'jest-styled-components';
import { render } from '@testing-library/react';
import theme from 'src/styles/theme';
import { store } from 'src/modules/store/store';
import { history } from 'src/modules/navigation/store';
import { ThemeProvider } from 'styled-components/';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';

import 'src/__mocks__/setupWindowMatchMediaMock';
import 'src/__mocks__/setupResizeObserverMock';
import 'src/__mocks__/setupRangeMock';

import Sidebar from 'src/modules/main-layout/sidebar/Sidebar';

describe('Sidebar', () => {
  it('should render', () => {
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
