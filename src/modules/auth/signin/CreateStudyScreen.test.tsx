import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from 'styled-components';
import { Provider } from 'react-redux';
import { ConnectedRouter, getLocation } from 'connected-react-router';
import { matchPath } from 'react-router-dom';

import 'jest-styled-components';
import 'src/__mocks__/setupWindowMatchMediaMock';
import 'src/__mocks__/setupResizeObserverMock';

import theme from 'src/styles/theme';
import { makeStore } from 'src/modules/store/store';
import { makeHistory, Path } from 'src/modules/navigation/store';
import CreateStudyScreen, { avatarColors } from 'src/modules/studies/CreateStudyScreen';

describe('CreateStudyScreen', () => {
  let store: ReturnType<typeof makeStore>;
  let history: ReturnType<typeof makeHistory>;

  beforeEach(() => {
    history = makeHistory();
    store = makeStore(history);
  });

  it('should create study', async () => {
    await act(() => {
      render(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <CreateStudyScreen />
            </ConnectedRouter>
          </Provider>
        </ThemeProvider>
      );
    });

    expect(await screen.findByTestId('create-study')).toMatchSnapshot();

    const name = await screen.findByTestId('create-study-name');
    const avatars = await screen.findAllByTestId('create-study-avatar');
    const firstAvatar = avatars[0];
    const send = await screen.findByTestId('create-study-send');

    expect(avatars).toHaveLength(avatarColors.length);

    const nameValue = 'title';
    await userEvent.type(name, nameValue);
    expect(name).toHaveValue(nameValue);

    await userEvent.hover(firstAvatar);
    await userEvent.click(firstAvatar);
    await userEvent.unhover(firstAvatar);

    await waitFor(() => expect(send).not.toHaveAttribute('disabled'));

    await userEvent.click(send);

    await waitFor(() =>
      expect(
        matchPath(getLocation(store.getState()).pathname, {
          path: Path.StudySettings,
          exact: true,
        })
      ).not.toBeNull()
    );
  });

  it('[NEGATIVE] should create study with partial data', async () => {
    await act(() => {
      render(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <CreateStudyScreen />
            </ConnectedRouter>
          </Provider>
        </ThemeProvider>
      );
    });

    expect(await screen.findByTestId('create-study')).toMatchSnapshot();

    const name = await screen.findByTestId('create-study-name');
    const avatars = await screen.findAllByTestId('create-study-avatar');
    const send = await screen.findByTestId('create-study-send');

    expect(avatars).toHaveLength(avatarColors.length);

    const nameValue = 'title';
    await userEvent.type(name, nameValue);
    expect(name).toHaveValue(nameValue);

    expect(send).toHaveAttribute('disabled');

    await userEvent.click(send);

    await waitFor(() =>
      expect(
        matchPath(getLocation(store.getState()).pathname, {
          path: Path.StudySettings,
          exact: true,
        })
      ).toBeNull()
    );
  });
});
