import { screen, render } from '@testing-library/react';
import _range from 'lodash/range';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import React from 'react';
import { ConnectedRouter } from 'connected-react-router';
import { history } from 'src/modules/navigation/store';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'styled-components';
import userEvent from '@testing-library/user-event';
import { theme } from 'src/styles';
import { createTestStore } from 'src/modules/store/testing';
import SwitchStudy from './SwitchStudy';

describe('SwitchStudy', () => {
  it('should render', async () => {
    const store = createTestStore({
      studies: {
        studies: _range(0, 20).map((idx) => ({
          id: `study-${idx}`,
          name: `Study ${idx}`,
          color: 'secondarySkyBlue',
          createdAt: 1652648400000,
        })),
        selectedStudyId: 'test',
        isLoading: false,
      },
    });

    const { baseElement } = render(
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          <ConnectedRouter history={history}>
            <SwitchStudy />
          </ConnectedRouter>
        </Provider>
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    await userEvent.click(screen.getByLabelText('Next Study'));
    await userEvent.click(screen.getByLabelText('Previous Study'));
    await userEvent.click(screen.getByText('Create Study'));

    await userEvent.hover(screen.getAllByTestId('avatar-icon')[0]);
    await userEvent.unhover(screen.getAllByTestId('avatar-icon')[0]);

    await userEvent.click(screen.getAllByTestId('avatar-icon')[0]);
  });

  it('[NEGATIVE] should render with empty store', async () => {
    const store = createTestStore({});

    const { baseElement } = render(
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          <ConnectedRouter history={history}>
            <SwitchStudy />
          </ConnectedRouter>
        </Provider>
      </ThemeProvider>
    );

    expect(baseElement).toBeInTheDocument();
  });
});
