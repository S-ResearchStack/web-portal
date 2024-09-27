import '@testing-library/jest-dom';
import 'jest-styled-components';
import React from 'react';
import { render, screen } from '@testing-library/react';

import theme from 'src/styles/theme';
import { ThemeProvider } from 'styled-components/';
import LabelForm from './LabelForm';

const label = 'Label';

describe('LabelForm', () => {
  it('should render the label correctly', () => {
    render(
      <ThemeProvider theme={theme}>
        <LabelForm label={label} />
      </ThemeProvider>
    );

    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it('should display an asterisk when required prop is true', () => {
    render(
      <ThemeProvider theme={theme}>
        <LabelForm label={label} required={true} />
      </ThemeProvider>
    );

    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it('[NEGATIVE] should change the color of the label to error color when error prop is true', () => {
    render(
      <ThemeProvider theme={theme}>
        <LabelForm label={label} error={true} />
      </ThemeProvider>
    );

    expect(screen.getByText(label)).toBeInTheDocument();
  });
});
