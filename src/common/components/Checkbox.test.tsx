import React from 'react';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import theme from 'src/styles/theme';
import { ThemeProvider } from 'styled-components/';
import Checkbox from './CheckBox';

describe('Checkbox', () => {
  it('test radio click', async () => {
    const { baseElement } = render(
      <ThemeProvider theme={theme}>
        <Checkbox data-testid="checkbox" />
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    const checkbox = screen.getByTestId('checkbox');

    expect(checkbox).not.toBeChecked();
    await userEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  it('test checkbox disabled state', async () => {
    const { baseElement } = render(
      <ThemeProvider theme={theme}>
        <Checkbox data-testid="checkbox" disabled />
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    const checkbox = screen.getByTestId('checkbox');

    expect(checkbox).not.toBeChecked();

    await userEvent.click(checkbox);

    expect(checkbox).not.toBeChecked();
  });
});
