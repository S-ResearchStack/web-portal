import React from 'react';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import { ThemeProvider } from 'styled-components/';
import userEvent from '@testing-library/user-event';
import { getByRole, render, screen, waitFor } from '@testing-library/react';

import theme from 'src/styles/theme';

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

  it('[NEGATIVE] test PasswordInputField error state', async () => {
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

  it('[NEGATIVE] test PasswordInputField disabled state', async () => {
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
    expect(passwordInput).toHaveStyle('color: rgba(0, 0, 0, 0.38)');
    expect(passwordInput).toHaveValue('');

    await userEvent.type(passwordInput, 'Samsung');

    expect(endExtra.getAttribute('color')).toBe('disabled');
    expect(passwordInput).toHaveStyle('color: rgba(0, 0, 0, 0.38)');
    expect(passwordInput).toHaveValue('');
  });

  it('[NEGATIVE] should render with wrong props', () => {
    const { baseElement, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <PasswordInputField
          readOnly={1 as unknown as boolean}
          value={[] as unknown as string}
          label={null as unknown as string}
          error={null as unknown as string}
        />
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    const input = screen.getByTestId('input');
    const label = queryByTestId('input-label');
    const error = queryByTestId('input-error');
    const description = screen.getByTestId('input-description');

    expect(input).toBeInTheDocument();

    expect(label).toBeNull();

    expect(description).toBeInTheDocument();
    expect(description).toHaveTextContent('');

    expect(error).toBeNil();
  });
});
