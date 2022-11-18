import React from 'react';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import { render } from '@testing-library/react';
import { px } from 'src/styles';
import theme from 'src/styles/theme';
import { ThemeProvider } from 'styled-components/';

import Button from './Button';

describe('Button', () => {
  it('test solid button', () => {
    const { getByTestId, queryByTestId, baseElement, rerender } = render(
      <ThemeProvider theme={theme}>
        <Button fill="solid" data-testid="solid-button">
          BUTTON
        </Button>
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    const solidButton = getByTestId('solid-button');
    const content = queryByTestId('content');

    expect(solidButton).toHaveTextContent('BUTTON');

    expect(solidButton).toHaveStyle(`background-color: ${theme.colors.primary}`);
    expect(content).toHaveStyle(`color: ${theme.colors.surface}`);

    rerender(
      <ThemeProvider theme={theme}>
        <Button fill="solid" data-testid="solid-button" disabled>
          BUTTON
        </Button>
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    expect(solidButton).toHaveStyle(`background-color: ${theme.colors.primaryDisabled}`);
    expect(content).toHaveStyle(`color: ${theme.colors.surface}`);

    rerender(
      <ThemeProvider theme={theme}>
        <Button fill="solid" data-testid="solid-button" $loading>
          BUTTON
        </Button>
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    expect(solidButton).toBeDisabled();
    expect(solidButton).toHaveStyle(`background-color: ${theme.colors.primary}`);
    expect(queryByTestId('spinner')).toBeInTheDocument();
  });

  it('test text button', () => {
    const { getByTestId, queryByTestId, baseElement, rerender } = render(
      <ThemeProvider theme={theme}>
        <Button fill="text" data-testid="text-button">
          BUTTON
        </Button>
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    const textButton = getByTestId('text-button');
    const content = queryByTestId('content');

    expect(textButton).toHaveTextContent('BUTTON');

    expect(textButton).toHaveStyle('background-color: transparent');
    expect(content).toHaveStyle(`color: ${theme.colors.primary}`);

    rerender(
      <ThemeProvider theme={theme}>
        <Button fill="text" data-testid="text-button" disabled>
          BUTTON
        </Button>
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    expect(textButton).toHaveStyle('background-color: transparent');
    expect(content).toHaveStyle(`color: ${theme.colors.primaryDisabled}`);

    rerender(
      <ThemeProvider theme={theme}>
        <Button fill="text" data-testid="text-button" $loading>
          BUTTON
        </Button>
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    expect(textButton).toBeDisabled();
    expect(textButton).toHaveStyle('background-color: transparent');
    expect(queryByTestId('spinner')).toBeInTheDocument();
  });

  it('test bordered button', () => {
    const { getByTestId, queryByTestId, baseElement, rerender } = render(
      <ThemeProvider theme={theme}>
        <Button fill="bordered" data-testid="bordered-button">
          BUTTON
        </Button>
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    const borderedButton = getByTestId('bordered-button');
    const content = queryByTestId('content');

    expect(borderedButton).toHaveTextContent('BUTTON');

    expect(borderedButton).toHaveStyle('background-color: transparent');
    expect(borderedButton).toHaveStyle(`border: ${px(1)} solid ${theme.colors.primary}`);
    expect(content).toHaveStyle(`color: ${theme.colors.primary}`);

    rerender(
      <ThemeProvider theme={theme}>
        <Button fill="bordered" data-testid="bordered-button" disabled>
          BUTTON
        </Button>
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    expect(borderedButton).toHaveStyle('background-color: transparent');
    expect(borderedButton).toHaveStyle(`border: ${px(1)} solid ${theme.colors.primaryDisabled}`);
    expect(content).toHaveStyle(`color: ${theme.colors.primaryDisabled}`);

    rerender(
      <ThemeProvider theme={theme}>
        <Button fill="bordered" data-testid="bordered-button" $loading>
          BUTTON
        </Button>
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    expect(borderedButton).toBeDisabled();
    expect(borderedButton).toHaveStyle('background-color: transparent');
    expect(queryByTestId('spinner')).toBeInTheDocument();
  });
});
