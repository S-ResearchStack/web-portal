import React from 'react';
import 'jest-styled-components';
import { render } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';

import theme from 'src/styles/theme';
import AccountActivationScreen from 'src/modules/auth/signin/AccountActivationScreen';
import { store } from 'src/modules/store/store';
import { history } from 'src/modules/navigation/store';

describe('AccountActivationScreen', () => {
  it('should render', () => {
    const { baseElement } = render(
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          <ConnectedRouter history={history}>
            <AccountActivationScreen />
          </ConnectedRouter>
        </Provider>
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();
  });
});
