import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import { ThemeProvider } from 'styled-components';
import {  theme } from 'src/styles';
import Chips from './RoundChips';

describe('RoundChip test', () => {
  it('should render default type correctly', () => {
    render(
      <ThemeProvider theme={theme}>
        <Chips type="default" data-testid="chip">
          test
        </Chips>
      </ThemeProvider>
    );

    expect(screen.getByTestId('chip')).toHaveStyleRule('background-color', '#F6F8FE');
    expect(screen.getByTestId('chip')).toHaveStyleRule('color', '#4475E3');
  });

  it('[NEGATIVE] should render disabled type correctly', () => {
    render(
      <ThemeProvider theme={theme}>
        <Chips type="disabled" data-testid="chip">
          test
        </Chips>
      </ThemeProvider>
    );

    expect(screen.getByTestId('chip')).toHaveStyleRule(
      'background-color',
      'rgba(219,219,219,0.2)'
    );
    expect(screen.getByTestId('chip')).toHaveStyleRule('color', '#B3C6F1');
  });

  it('[NEGATIVE] should render without type', () => {
    render(
      <ThemeProvider theme={theme}>
        <Chips type={null as any} data-testid="chip">
          test
        </Chips>
      </ThemeProvider>
    );
    expect(screen.getByTestId('chip')).not.toHaveStyleRule('background-color', '#F6F8FE');
    expect(screen.getByTestId('chip')).not.toHaveStyleRule('color', '#4475E3');
    expect(screen.getByTestId('chip')).not.toHaveStyleRule(
      'background-color',
      'rgba(219,219,219,0.2)'
    );
    expect(screen.getByTestId('chip')).not.toHaveStyleRule('color', '#B3C6F1');
  });
});
