import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import Fade from './Fade';
import React from 'react';
import { ThemeProvider } from 'styled-components';
import { theme } from 'src/styles';

describe('Fade animation test', () => {
  it('should render UNMOUNT state correctly', async () => {
    render(
      <ThemeProvider theme={theme}>
        <Fade in={false}>
          <div>test</div>
        </Fade>
      </ThemeProvider>
    );
    expect(screen.getByText('test')).not.toBeVisible();
  });

  it('should render ENTERING and ENTERED state correctly', async () => {
    render(
      <ThemeProvider theme={theme}>
        <Fade in={true}>
          <div>test</div>
        </Fade>
      </ThemeProvider>
    );
    expect(screen.getByText('test')).toBeVisible();
  });

  it('[NEGATIVE] should render with broken props', () => {
    render(
      <ThemeProvider theme={theme}>
        <Fade in={undefined}>
          <div>test</div>
        </Fade>
      </ThemeProvider>
    );
    expect(screen.getByText('test')).not.toBeVisible();
  })
});
