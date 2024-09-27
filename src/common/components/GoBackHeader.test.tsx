import React from 'react';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import { render, screen } from '@testing-library/react';
import { useHistory } from 'react-router-dom';
import GoBackHeader from './GoBackHeader';
import { theme } from 'src/styles';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from 'styled-components';

jest.mock('react-router-dom', () => ({
  useHistory: jest.fn(),
}));

const mockProps = {
  title: 'test title',
};

describe('GoBackHeader test', () => {
  const mockHistory = {
    length: 2,
    goBack: jest.fn(),
    replace: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useHistory as jest.Mock).mockReturnValue(mockHistory);
  });

  it('should render correctly', () => {
    render(
      <ThemeProvider theme={theme}>
        <GoBackHeader {...mockProps} />
      </ThemeProvider>
    );

    expect(screen.getByText(mockProps.title)).toBeInTheDocument();
  });

  it('should call history.goBack when clicked', async () => {
    render(
      <ThemeProvider theme={theme}>
        <GoBackHeader {...mockProps} />
      </ThemeProvider>
    );
    await userEvent.click(screen.getByText(mockProps.title));
    expect(mockHistory.goBack).toHaveBeenCalled();
  });

  it('should call history replace fallbackUrl', async () => {
    const fallbackUrl = '/fallback-url';
    mockHistory.length = 1;
    render(
      <ThemeProvider theme={theme}>
        <GoBackHeader {...mockProps} fallbackUrl={fallbackUrl} />
      </ThemeProvider>
    );
    await userEvent.click(screen.getByText(mockProps.title));
    expect(mockHistory.replace).toHaveBeenCalledWith(fallbackUrl);
  });

  it('[NEGATIVE] should render with broken props', () => {
    render(
      <ThemeProvider theme={theme}>
        <GoBackHeader title={undefined as any} />
      </ThemeProvider>
    );

    expect(screen.getByRole('title')).toBeInTheDocument();
  });

  it('[NEGATIVE] should call go back with broken fallbackUrl', async () => {
    mockHistory.length = 1;
    render(
      <ThemeProvider theme={theme}>
        <GoBackHeader {...mockProps} fallbackUrl={undefined as any} />
      </ThemeProvider>
    );
    await userEvent.click(screen.getByText(mockProps.title));
    expect(mockHistory.goBack).toHaveBeenCalled();
  });
});
