import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import { ThemeProvider } from 'styled-components';
import { theme } from 'src/styles';
import OverviewCardWrapperWithSkeleton from './OverviewCardWrapperWithSkeleton';

const mockProps = {
  children: <div data-testid="test"></div>,
  skeletons: [<div role="skeleton" key={'1'}></div>, <div role="skeleton"  key={'2'}></div>],
};

describe('OverviewCardWrapperWithSkeleton', () => {
  it('should render correctly when loading', () => {
    render(
      <ThemeProvider theme={theme}>
        <OverviewCardWrapperWithSkeleton {...mockProps} isLoading />
      </ThemeProvider>
    );
    const skeletons = screen.getAllByRole('skeleton');
    expect(skeletons.length).toBe(mockProps.skeletons.length);
    skeletons.forEach((item) => expect(item).toBeInTheDocument());
    expect(screen.queryByTestId('test')).not.toBeInTheDocument();
  });

  it('should render correctly when loaded', () => {
    render(
      <ThemeProvider theme={theme}>
        <OverviewCardWrapperWithSkeleton {...mockProps} isLoading={false} />
      </ThemeProvider>
    );
    const skeletons = screen.queryAllByRole('skeleton');
    expect(skeletons.length).toBe(0);
    expect(screen.getByTestId('test')).toBeInTheDocument();
  });
});
