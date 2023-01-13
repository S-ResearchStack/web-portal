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

import DataCollection from 'src/modules/data-collection/DataCollection';

describe('DataCollection', () => {
  it('should render', () => {
    const { baseElement } = render(
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          <ConnectedRouter history={history}>
            <DataCollection />
          </ConnectedRouter>
        </Provider>
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();
  });
});
