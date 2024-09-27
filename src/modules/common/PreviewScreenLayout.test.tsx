import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PreviewScreenLayout from './PreviewScreenLayout';
import { ThemeProvider } from 'styled-components/';
import theme from 'src/styles/theme';
describe('PreviewScreenLayout', () => {
  it('renders with title and children', () => {
    const title = 'Sample Title';
    const childContent = <div data-testid="child">Child Content</div>;
    
    render(
      <ThemeProvider theme={theme}>
        <PreviewScreenLayout title={title}>
          {childContent}
        </PreviewScreenLayout>
      </ThemeProvider>
    );

    expect(screen.getByText(title)).toBeInTheDocument();
    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByTestId('preview')).toBeInTheDocument();
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });
});