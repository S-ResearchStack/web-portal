import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import StudyDataFileUploadProgressBar from './StudyDataFileUploadProgressBar';
import theme from 'src/styles/theme';
import { ThemeProvider } from 'styled-components';

describe('StudyDataFileUploadProgressBar', () => {
  it('renders the component with normal props', () => {
    const testStatusIcon = <div data-testid="testStatusIcon">Test Status Icon</div>
    render(
    <ThemeProvider theme={theme}>
      <StudyDataFileUploadProgressBar 
        name="Test File"
        loaded={1024}
        total={2048}
        baseColor="primary"
        progressColor="black"
        marginBottom={10}
        statusIcon={testStatusIcon}
      />
    </ThemeProvider>
    );

    expect(screen.getByText('Test File')).toBeInTheDocument();
    expect(screen.getByText('1.00 / 2.00 KB')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('%')).toBeInTheDocument();
    expect(screen.getByTestId('testStatusIcon')).toBeInTheDocument();

  });

  it('renders the component with completed progress', () => {
    const testLoadingCompleteImg = <div data-testid="testLoadingCompleteImg">Test loading complete</div>
    render(
    <ThemeProvider theme={theme}>
      <StudyDataFileUploadProgressBar 
        name="Completed File"
        loaded={2048}
        total={2048}
        baseColor="primary"
        progressColor="black"
        marginBottom={20}
        image={testLoadingCompleteImg}
      />
    </ThemeProvider>);

    expect(screen.getByText('Completed File')).toBeInTheDocument();
    expect(screen.getByText('2.00 / 2.00 KB')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('%')).toBeInTheDocument();
    expect(screen.getByTestId('testLoadingCompleteImg')).toBeInTheDocument();
  });

  it('[NEGATIVE] renders the component with no image and status icon', () => {
    render(
    <ThemeProvider theme={theme}>
      <StudyDataFileUploadProgressBar 
        name="No Image File"
        loaded={512}
        total={1024}
        baseColor="primaryWhite"
        progressColor="primary"
        marginBottom={15}
      />
    </ThemeProvider>);

    expect(screen.getByText('No Image File')).toBeInTheDocument();
    expect(screen.getByText('0.50 / 1.00 KB')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('%')).toBeInTheDocument();
    expect(screen.queryByAltText('image')).not.toBeInTheDocument();
    expect(screen.queryByAltText('status-icon')).not.toBeInTheDocument();
  });
  it('[NEGATIVE] renders the component with 0 total size of file', () => {
    render(
    <ThemeProvider theme={theme}>
      <StudyDataFileUploadProgressBar 
        name="No Image File"
        loaded={0}
        total={0}
        baseColor="primaryWhite"
        progressColor="primary"
        marginBottom={15}
      />
    </ThemeProvider>);
    expect(screen.getByText('No Image File')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('%')).toBeInTheDocument();
    expect(screen.getByText('0.00 / 0.00 B')).toBeInTheDocument();
  });
});
