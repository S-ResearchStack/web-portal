import React from 'react';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import userEvent from '@testing-library/user-event';
import { render } from '@testing-library/react';
import theme from 'src/styles/theme';
import { ThemeProvider } from 'styled-components/';
import Toggle from './Toggle';

describe('Toggle', () => {
  it('test toggle click', async () => {
    const { baseElement, getByTestId } = render(
      <ThemeProvider theme={theme}>
        <Toggle data-testid="toggle" label="toggle" />
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    const toggle = getByTestId('toggle');

    expect(toggle).not.toBeChecked();
    await userEvent.click(toggle);
    expect(toggle).toBeChecked();
  });

  it("test toggle's label click", async () => {
    const { baseElement, getByTestId, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <Toggle data-testid="toggle" label="toggle" />
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    const toggle = getByTestId('toggle');
    const label = queryByTestId('label') as Element;

    expect(toggle).not.toBeChecked();
    await userEvent.click(label);
    expect(toggle).toBeChecked();
  });

  it('test toggle disabled state', async () => {
    const { baseElement, getByTestId } = render(
      <ThemeProvider theme={theme}>
        <Toggle data-testid="toggle" label="toggle" disabled />
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    const toggle = getByTestId('toggle');

    expect(toggle).not.toBeChecked();
    await userEvent.click(toggle);
    expect(toggle).not.toBeChecked();
  });
});
