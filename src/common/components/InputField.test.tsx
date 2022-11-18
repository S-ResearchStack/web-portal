import React from 'react';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import InputField from 'src/common/components/InputField';
import theme from 'src/styles/theme';
import { ThemeProvider } from 'styled-components/';

describe('InputField', () => {
  it('type and clear InputField test', async () => {
    const { baseElement } = render(
      <ThemeProvider theme={theme}>
        <InputField />
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    const input = screen.getByTestId('input');

    await userEvent.type(input, 'Samsung');
    expect(input).toHaveValue('Samsung');

    await userEvent.clear(input);
    expect(input).toHaveValue('');
  });

  it('test InputField error state', () => {
    const { baseElement } = render(
      <ThemeProvider theme={theme}>
        <InputField error />
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    const input = screen.getByTestId('input');

    expect(input).toHaveStyle(`color: ${theme.colors.statusErrorText}`);
    expect(input).toHaveStyle(`caret-color: ${theme.colors.statusErrorText}`);
  });

  it('test InputField disabled state', async () => {
    const { baseElement } = render(
      <ThemeProvider theme={theme}>
        <InputField disabled value="disabled" />
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    const input = screen.getByTestId('input');

    await userEvent.type(input, 'Samsung');
    expect(input).toHaveValue('disabled');
    expect(input).toHaveStyle(`color: ${theme.colors.disabled}`);
    expect(input).toHaveStyle(`background-color: ${theme.colors.disabled20}`);
  });
});
