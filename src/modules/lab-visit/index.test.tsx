import { render, screen } from '@testing-library/react';
import { ConnectedRouter } from 'connected-react-router';
import React from 'react';
import { Provider } from 'react-redux';
import { act } from 'react-test-renderer';
import { history } from 'src/modules/navigation/store';
import { ThemeProvider } from 'styled-components';
import { theme } from 'src/styles';
import LabVisitManagement from '.';
import { store } from '../store/store';

describe('LabVisitManagement', () => {
  it('should render correctly', async () => {
    const result = await act(() => {
      render(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <LabVisitManagement />
            </ConnectedRouter>
          </Provider>
        </ThemeProvider>
      );
    });
    
    expect(result).toMatchSnapshot();
  });
});
