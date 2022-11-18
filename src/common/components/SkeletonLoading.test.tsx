import React from 'react';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import { render } from '@testing-library/react';
import theme from 'src/styles/theme';
import { ThemeProvider } from 'styled-components/';
import SkeletonLoading, { SkeletonRect } from './SkeletonLoading';

describe('SkeletonLoading', () => {
  it('test skeleton loading render', () => {
    const { baseElement, getByTestId } = render(
      <ThemeProvider theme={theme}>
        <SkeletonLoading data-testid="skeleton-loading">
          <SkeletonRect x="0" y="0" rx="4" width={180} height={24} data-testid="skeleton-rect" />
        </SkeletonLoading>
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    const loading = getByTestId('skeleton-loading');
    const rect = getByTestId('skeleton-rect');

    expect(loading).toBeInTheDocument();
    expect(rect).toBeInTheDocument();
  });
});
