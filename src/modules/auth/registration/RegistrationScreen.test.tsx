import React from 'react';
import 'jest-styled-components';
import '@testing-library/jest-dom/extend-expect';
import { act, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ConnectedRouter, getLocation } from 'connected-react-router';
import { matchPath } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from 'styled-components';
import theme from 'src/styles/theme';
import { AppDispatch, store } from 'src/modules/store/store';
import { history, Path } from 'src/modules/navigation/store';
import RegistrationScreen from './RegistrationScreen';
import { registerUser } from '../auth.slice';

const dispatch: AppDispatch = store.dispatch;

describe('RegistrationScreen', () => {
  beforeEach(async () => {
    await act(() => {
      render(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <RegistrationScreen />
            </ConnectedRouter>
          </Provider>
        </ThemeProvider>
      );
    });
  });
  it('should render correctly', async () => {
    const detailTab = await screen.findByText('1. Details');
    const contactTab = await screen.findByText('2. Contacts');
    const attachmentTab = await screen.findByText('3. Attachments');

    expect(detailTab).toBeInTheDocument();
    expect(contactTab).toBeInTheDocument();
    expect(attachmentTab).toBeInTheDocument();
  });

  it('should fill information and submit successfully', async () => {
    //first page
    const prevButton = await screen.findByTestId('registration-prev-button');
    expect(prevButton).toHaveAttribute('disabled');

    //detail
    const firstName = await screen.findByTestId('auth-signup-first-name');
    const lastName = await screen.findByTestId('auth-signup-last-name');
    const company = await screen.findByTestId('auth-signup-company');
    const team = await screen.findByTestId('auth-signup-team');

    const firstNameValue = 'firstName';
    await userEvent.type(firstName, firstNameValue);
    expect(firstName).toHaveValue(firstNameValue);

    const lastNameValue = 'lastName';
    await userEvent.type(lastName, lastNameValue);
    expect(lastName).toHaveValue(lastNameValue);

    const companyValue = 'company';
    await userEvent.type(company, companyValue);
    expect(company).toHaveValue(companyValue);

    const teamValue = 'team';
    await userEvent.type(team, teamValue);
    expect(team).toHaveValue(teamValue);

    const nextButton = await screen.findByTestId('registration-next-button');
    await userEvent.click(nextButton);

    //back to 1st page and return
    const prevBtn = await screen.findByTestId('registration-prev-button');
    expect(prevBtn).not.toHaveAttribute('disabled');
    await userEvent.click(prevBtn);
    await userEvent.click(nextButton);

    //contacts
    const email = await screen.findByTestId('auth-signup-email');
    const officePhone = await screen.findByTestId('auth-signup-office-phone');
    const mobilePhone = await screen.findByTestId('auth-signup-mobile-phone');

    expect(email).toHaveAttribute('disabled');

    const officePhoneValue = '123';
    await userEvent.type(officePhone, officePhoneValue);
    expect(officePhone).toHaveValue(officePhoneValue);

    const mobilePhoneValue = '123';
    await userEvent.type(mobilePhone, mobilePhoneValue);
    expect(mobilePhone).toHaveValue(mobilePhoneValue);

    await userEvent.click(nextButton);

    //attachments
    const attachments = await screen.findByTestId('step-attachment');
    expect(attachments).toBeInTheDocument();

    //submit
    const submitButton = await screen.findByTestId('registration-done-button');
    userEvent.click(submitButton);

    await dispatch(
      registerUser({
        firstName: 'firstName',
        lastName: 'lastName',
        company: 'company',
        team: 'team',
        officePhoneNumber: '123',
        mobilePhoneNumber: '123',
      })
    );

    expect(
      matchPath(getLocation(store.getState()).pathname, {
        path: Path.Overview,
        exact: true,
      })
    ).not.toBeNull();
  });

  it('[NEGATIVE] should disable next button when missing information', async () => {
    //detail
    const firstName = await screen.findByTestId('auth-signup-first-name');
    const lastName = await screen.findByTestId('auth-signup-last-name');

    const firstNameValue = 'firstName';
    await userEvent.type(firstName, firstNameValue);
    expect(firstName).toHaveValue(firstNameValue);

    const lastNameValue = 'lastName';
    await userEvent.type(lastName, lastNameValue);
    expect(lastName).toHaveValue(lastNameValue);

    const nextButton = await screen.findByTestId('registration-next-button');
    expect(nextButton).toHaveAttribute('disabled');
  });
});
