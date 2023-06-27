import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';
import { avatarColors } from 'src/modules/studies/CreateStudyCard';
import { ThemeProvider } from 'styled-components';
import { Provider } from 'react-redux';
import { ConnectedRouter, getLocation } from 'connected-react-router';
import { matchPath } from 'react-router-dom';
import 'jest-styled-components';

import theme from 'src/styles/theme';
import { makeStore, AppDispatch } from 'src/modules/store/store';
import { makeHistory, Path } from 'src/modules/navigation/store';
import CreateStudyScreen from 'src/modules/studies/CreateStudyScreen';
import { authSlice } from '../auth.slice';

const authToken =
  'e30=.eyJlbWFpbCI6InVzZXJuYW1lQHNhbXN1bmcuY29tIiwicm9sZXMiOlsidGVhbS1hZG1pbiJdLCJzdWIiOiIxMjMifQ==';

describe('CreateStudyScreen', () => {
  let store: ReturnType<typeof makeStore>;
  let history: ReturnType<typeof makeHistory>;
  let dispatch: AppDispatch;

  beforeEach(() => {
    history = makeHistory();
    store = makeStore(history);
    dispatch = store.dispatch;
  });

  afterAll(() => {
    dispatch(authSlice.actions.clearAuth());
  });

  it('should create study', async () => {
    dispatch(
      authSlice.actions.authSuccess({ authToken, refreshToken: authToken, userName: 'User Name' })
    );

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
    const switchToRoleScreen = await screen.findByTestId('switch-select-role');

    expect(avatars).toHaveLength(avatarColors.length);

    const nameValue = 'title';
    await userEvent.type(name, nameValue);
    expect(name).toHaveValue(nameValue);

    await userEvent.hover(firstAvatar);
    await userEvent.click(firstAvatar);
    await userEvent.unhover(firstAvatar);

    await waitFor(() => expect(switchToRoleScreen).not.toHaveAttribute('disabled'));

    await userEvent.click(switchToRoleScreen);

    const roles = ['principal-investigator', 'research-assistant', 'data-scientist'];
    const ownerRole = await screen.findByTestId(`checkbox-${roles[0]}`);
    const researcherRole = await screen.findByTestId(`checkbox-${roles[1]}`);
    const scientistRole = await screen.findByTestId(`checkbox-${roles[2]}`);
    const send = await screen.findByTestId('create-study-send');

    expect(ownerRole).not.toBeChecked();
    expect(researcherRole).not.toBeChecked();
    expect(scientistRole).not.toBeChecked();

    await userEvent.click(ownerRole);
    await userEvent.click(researcherRole);
    await userEvent.click(scientistRole);

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
    const send = await screen.findByTestId('switch-select-role');

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
