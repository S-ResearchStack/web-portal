import React from 'react';
import 'src/__mocks__/setupUniqueIdMock';
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

    const checkbox = screen.getByTestId('checkbox');

    expect(baseElement).toMatchSnapshot();
    expect(checkbox).not.toBeChecked();

    await userEvent.click(checkbox);

    expect(checkbox).not.toBeChecked();
  });

  it('[NEGATIVE] should render with wrong props', async () => {
    const { baseElement } = render(
      <ThemeProvider theme={theme}>
        <Checkbox data-testid="checkbox" checked={null as unknown as boolean}>
          {true}
        </Checkbox>
      </ThemeProvider>
    );

    const checkbox = screen.getByTestId('checkbox');
    const label = screen.getByTestId('checkbox-label');

    expect(baseElement).toMatchSnapshot();
    expect(checkbox).not.toBeChecked();
    expect(label).toBeInTheDocument();
    expect(label).toHaveTextContent('');
  });

  it('[NEGATIVE] should render without props', async () => {
    const { baseElement } = render(
      <ThemeProvider theme={theme}>
        <Checkbox data-testid="checkbox" />
      </ThemeProvider>
    );

    const checkbox = screen.getByTestId('checkbox');

    expect(baseElement).toMatchSnapshot();
    expect(checkbox).not.toBeChecked();
  });
});
