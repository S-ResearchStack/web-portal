import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import Fade from './Fade';
import React from 'react';
import { ThemeProvider } from 'styled-components';
import { theme } from 'src/styles';
import Slide, { SlideDirection } from './Slide';

describe('Fade animation test', () => {
  it('should render UNMOUNT state correctly', async () => {
    render(
      <ThemeProvider theme={theme}>
        <Slide in={false}>
          <div>test</div>
        </Slide>
      </ThemeProvider>
    );
    expect(screen.getByText('test')).toBeInTheDocument();
    expect(screen.getByTestId('slide')).toBeInTheDocument();
    expect(screen.getByTestId('slide')).toHaveStyle('transform: translateX(100%)');
  });

  it('should render ENTERING and ENTERED state correctly', async () => {
    const directions: SlideDirection[] = ['left', 'right'];
    const { container } = render(
      <ThemeProvider theme={theme}>
        <Slide in={false}>
          <div>test</div>
        </Slide>
      </ThemeProvider>
    );
    expect(screen.getByText('test')).toBeInTheDocument();
    const slideContainer = screen.getByTestId('slide');
    expect(slideContainer).toBeInTheDocument();

    directions.forEach((direction) => {
      render(
        <ThemeProvider theme={theme}>
          <Slide in={true} direction={direction}>
            <div>test</div>
          </Slide>
        </ThemeProvider>,
        { container }
      );
      if (direction === 'left') expect(slideContainer).toHaveStyle(`left: 0`);
      else expect(slideContainer).toHaveStyle(`right: 0`);
      expect(slideContainer).toHaveStyle(`transform: translateX(0%)`);
    });
  });

  it('[NEGATIVE] should render with broken props', async () => {
    render(
      <ThemeProvider theme={theme}>
        <Slide in={false}>
          <div>test</div>
        </Slide>
      </ThemeProvider>
    );
    expect(screen.getByText('test')).toBeInTheDocument();
    expect(screen.getByTestId('slide')).toBeInTheDocument();
    expect(screen.getByTestId('slide')).toHaveStyle('transform: translateX(100%)');
  });
});
