import { render, screen } from '@testing-library/react';
import { theme } from 'src/styles';
import { ThemeProvider } from 'styled-components';
import ChartCardWithSkeleton from './ChartCardWithSkeleton';
import React from 'react';
import '@testing-library/jest-dom';
import 'jest-styled-components';

describe('ChartCardWithSkeleton test', () => {
  it('should render correctly', () => {
    render(
      <ThemeProvider theme={theme}>
        <ChartCardWithSkeleton cardNumber={10} />
      </ThemeProvider>
    );
    const skeletons = screen.getAllByRole('skeleton');
    expect(skeletons.length).toBe(10);
    skeletons.forEach(skeleton => expect(skeleton).toBeInTheDocument())
  });

  it('[NEGATIVE] should render empty', () => {
    render(
      <ThemeProvider theme={theme}>
        <ChartCardWithSkeleton cardNumber={0} />
      </ThemeProvider>
    );
    const skeletons = screen.queryAllByRole('skeleton');
    expect(skeletons.length).toBe(0);
    expect(screen.queryByRole('skeleton')).not.toBeInTheDocument();
  });

  it('[NEGATIVE] should render with negative cardNumber', () => {
    render(
      <ThemeProvider theme={theme}>
        <ChartCardWithSkeleton cardNumber={-4} />
      </ThemeProvider>
    );
    const skeletons = screen.queryAllByRole('skeleton');
    expect(skeletons.length).toBe(4);
    skeletons.forEach(skeleton => expect(skeleton).toBeInTheDocument())
  })
});
