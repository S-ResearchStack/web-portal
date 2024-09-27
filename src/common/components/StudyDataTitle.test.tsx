import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import { ThemeProvider } from 'styled-components';
import { theme } from 'src/styles';
import StudyDataTitle from './StudyDataTitle';

const mockProps = {
  title: 'test',
  fontSize: 10,
  fontColor: 'red',
};

describe('StudyDataTitle test', () => {
  it('should render correctly', () => {
    render(
      <ThemeProvider theme={theme}>
        <StudyDataTitle {...mockProps} />
      </ThemeProvider>
    );
    expect(screen.getByText('test')).toBeInTheDocument();
  });

  it('[NEGATIVE] should render without title', () => {
    render(
      <ThemeProvider theme={theme}>
        <StudyDataTitle {...mockProps} title={null as any}  />
      </ThemeProvider>
    );
    expect(screen.getByTestId('study-data-title')).toBeInTheDocument();
  });
});
