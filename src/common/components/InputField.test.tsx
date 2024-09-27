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

  it('[NEGATIVE] test InputField error state', () => {
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

  it('[NEGATIVE] test InputField disabled state', async () => {
    const { baseElement } = render(
      <ThemeProvider theme={theme}>
        <InputField disabled value="disabled" />
      </ThemeProvider>
    );

    const input = screen.getByTestId('input');

    expect(baseElement).toMatchSnapshot();
    expect(input).toHaveValue('disabled');
    expect(input).toHaveStyle('color: rgba(0, 0, 0, 0.38)');
    expect(input).toHaveStyle('background-color: #f8f8f8');
  });

  it('[NEGATIVE] should prevent user input while field is disabled', async () => {
    const { baseElement } = render(
      <ThemeProvider theme={theme}>
        <InputField disabled value="disabled" />
      </ThemeProvider>
    );

    const input = screen.getByTestId('input');

    await userEvent.type(input, 'Samsung');

    expect(baseElement).toMatchSnapshot();
    expect(input).not.toHaveValue('Samsung');
    expect(input).toHaveValue('disabled');
  });

  it('[NEGATIVE] should render with wrong props', async () => {
    const { baseElement, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <InputField
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
    const error = await queryByTestId('input-error');
    const description = screen.getByTestId('input-description');

    expect(input).toBeInTheDocument();
    expect(label).toBeNull();
    expect(description).toBeInTheDocument();
    expect(description).toHaveTextContent('');
    expect(error).toBeNil();
  });

  it('[NEGATIVE] should render without props', () => {
    const { baseElement } = render(
      <ThemeProvider theme={theme}>
        <InputField />
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();
    expect(screen.getByTestId('input')).toBeInTheDocument();
  });
});
