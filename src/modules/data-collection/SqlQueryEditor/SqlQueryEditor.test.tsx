import React from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from 'styled-components/';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import '@testing-library/jest-dom/extend-expect';

import 'src/__mocks__/setupWindowMatchMediaMock';
import 'src/__mocks__/setupResizeObserverMock';
import 'src/__mocks__/setupRangeMock';

import theme from 'src/styles/theme';
import { store } from 'src/modules/store/store';
import { history } from 'src/modules/navigation/store';
import SqlQueryEditor from 'src/modules/data-collection/SqlQueryEditor/SqlQueryEditor';

describe('SqlQueryEditor', () => {
  it('should render', async () => {
    const onChange = jest.fn();
    const onSearch = jest.fn();
    const columns = new Map<string, string[]>([['table', ['column1', 'column2']]]);
    const query = 'select * from table';

    await act(() => {
      render(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <SqlQueryEditor
                value={query}
                tablesColumnsMap={columns}
                onChange={onChange}
                onSearch={onSearch}
              />
            </ConnectedRouter>
          </Provider>
        </ThemeProvider>
      );
    });

    const qe = await screen.findByTestId('sql-query-editor');
    const textArea = qe.querySelector('.CodeMirror textarea');

    expect(textArea).not.toBeNull();

    const queryParts = ['select * from tab', 'le where column1 = 10 and column2 = 20'];

    for await (const p of queryParts) {
      await userEvent.type(textArea as Element, p);
    }

    expect(textArea).toHaveValue(queryParts.join(''));
  });
});
