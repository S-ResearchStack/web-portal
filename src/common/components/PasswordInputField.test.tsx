import React from 'react';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import userEvent from '@testing-library/user-event';
import { getByRole, render, waitFor } from '@testing-library/react';
import theme from 'src/styles/theme';
import { ThemeProvider } from 'styled-components/';
import PasswordInputField from './PasswordInputField';

describe('PasswordInputField', () => {
  it('test PasswordInputField render', async () => {
    const { baseElement, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <PasswordInputField />
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    const passwordInput = queryByTestId('input') as Element;
    const endExtra = getByRole(baseElement, 'button') as Element;

    expect(passwordInput).toBeInTheDocument();
    expect(endExtra).toBeInTheDocument();

    expect(endExtra.getAttribute('color')).toBe('primary');

    expect(passwordInput.getAttribute('type')).toBe('password');

    await userEvent.click(endExtra);

    await waitFor(() => {
      expect(passwordInput.getAttribute('type')).toBe('text');
      expect(endExtra.getAttribute('color')).toBe('textSecondaryGray');
    });
  });

  it('test PasswordInputField error state', async () => {
    const { baseElement, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <PasswordInputField error />
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    const passwordInput = queryByTestId('input') as Element;
    const endExtra = getByRole(baseElement, 'button') as Element;

    expect(passwordInput).toBeInTheDocument();
    expect(endExtra).toBeInTheDocument();

    expect(endExtra.getAttribute('color')).toBe('statusErrorText');
    expect(passwordInput).toHaveStyle(`color: ${theme.colors.statusErrorText}`);
    expect(passwordInput).toHaveStyle(`background-color: ${theme.colors.statusError10}`);
  });

  it('test PasswordInputField disabled state', async () => {
    const { baseElement, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <PasswordInputField disabled />
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    const passwordInput = queryByTestId('input') as Element;
    const endExtra = getByRole(baseElement, 'button') as Element;

    expect(passwordInput).toBeInTheDocument();
    expect(endExtra).toBeInTheDocument();

    expect(endExtra.getAttribute('color')).toBe('disabled');
    expect(passwordInput).toHaveStyle(`color: ${theme.colors.disabled}`);
    expect(passwordInput).toHaveValue('');

    await userEvent.type(passwordInput, 'Samsung');

    expect(endExtra.getAttribute('color')).toBe('disabled');
    expect(passwordInput).toHaveStyle(`color: ${theme.colors.disabled}`);
    expect(passwordInput).toHaveValue('');
  });
});
