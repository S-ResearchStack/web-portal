import React from 'react';
import { act, render, screen, waitFor, fireEvent } from '@testing-library/react';
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
import { authSlice } from '../auth/auth.slice';

const authToken = 'token';
const file = new File(['test'], 'test.png', { type: 'image/png' });

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
    dispatch(authSlice.actions.authSuccess({ jwtType: '', authToken, refreshToken: authToken }));

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

    const name = await screen.findByTestId('create-study-name');
    const id = await screen.findByTestId('create-study-id');
    const description = await screen.findByTestId('create-study-description');
    const organization = await screen.findByTestId('create-study-organization');
    const requirements = await screen.findByTestId('create-study-requirements');
    const avatars = await screen.findAllByTestId('create-study-avatar');
    const firstAvatar = avatars[1];
    const next = await screen.findByTestId('create-study-next');

    expect(next).toBeDisabled();
    expect(avatars).toHaveLength(avatarColors.length);

    const nameValue = 'name';
    await userEvent.type(name, nameValue);
    expect(name).toHaveValue(nameValue);

    const idValue = 'id';
    await userEvent.type(id, idValue);
    expect(id).toHaveValue(idValue);

    const descriptionValue = 'description';
    await userEvent.type(description, descriptionValue);
    expect(description).toHaveValue(descriptionValue);

    const organizationValue = 'organization';
    await userEvent.type(organization, organizationValue);
    expect(organization).toHaveValue(organizationValue);

    const requirementsValue = 'requirements';
    await userEvent.type(requirements, requirementsValue);
    expect(requirements).toHaveValue(requirementsValue);

    await userEvent.hover(firstAvatar);
    await userEvent.click(firstAvatar);
    await userEvent.unhover(firstAvatar);

    await waitFor(() => expect(next).not.toHaveAttribute('disabled'));
    await userEvent.click(next);

    const back = await screen.findByTestId('create-study-back');
    await userEvent.click(back);

    const scopCheckbox = await screen.findByTestId('PRIVATE-checkbox');
    const nextButton = await screen.findByTestId('create-study-next');
    await userEvent.click(scopCheckbox);

    expect(nextButton).toBeDisabled();

    const code = await screen.findByTestId('create-study-code');
    await userEvent.type(code, idValue);

    await waitFor(() => expect(nextButton).not.toHaveAttribute('disabled'));
    await userEvent.click(nextButton);

    const inputImage = screen.getByTestId('create-study-consent-image');
    const selectAllTypeButton = await screen.findByTestId('select-all-type');
    const send = await screen.findByTestId('create-study-send');

    fireEvent.change(inputImage, { target: { files: [file] } });

    await userEvent.click(selectAllTypeButton);
    await userEvent.click(selectAllTypeButton);
    await userEvent.click(selectAllTypeButton);

    await waitFor(() => expect(send).not.toHaveAttribute('disabled'));

    await userEvent.click(send);

    await waitFor(() =>
      expect(
        matchPath(getLocation(store.getState()).pathname, {
          path: Path.Overview,
          exact: true,
        })
      ).not.toBeNull()
    );
  });

  it('[NEGATIVE] should cancel create study', async () => {
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
    expect(await screen.findByTestId('create-study')).toBeInTheDocument();

    const id = await screen.findByTestId('create-study-id');
    const duration = await screen.findByTestId('create-study-duration');

    await userEvent.type(id, 'id@');
    expect(screen.getByText('Study ID accepts letters, numbers and starts with letter(s).')).toBeInTheDocument();

    await userEvent.type(id, '1id');
    expect(screen.getByText('Study ID accepts letters, numbers and starts with letter(s).')).toBeInTheDocument();

    await userEvent.type(duration, 'a');
    expect(screen.getByText('Include non-negative numbers only')).toBeInTheDocument();

    const cancel = await screen.findByTestId('create-study-cancel');
    await userEvent.click(cancel);

    await waitFor(() =>
      expect(
        matchPath(getLocation(store.getState()).pathname, {
          path: Path.Overview,
          exact: true,
        })
      ).not.toBeNull()
    );
  });
});
