import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import Link from './Link';
import { ThemeProvider } from 'styled-components';
import { theme } from 'src/styles';
import { Router, useHistory } from 'react-router-dom';
import { history } from 'src/modules/navigation/store';

jest.mock('react-router-dom', () => {
  const origin = jest.requireActual('react-router-dom');
  return {
    ...origin,
    useHistory: jest.fn(),
  };
});
const pushFn = jest.fn();

const mockProps = {
  to: '/some-path',
  children: 'Some Text',
};

describe('Link test', () => {
  const mockHistory = {
    push: pushFn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useHistory as jest.Mock).mockReturnValue(mockHistory);
  });

  it('should render correctly', () => {
    render(
      <ThemeProvider theme={theme}>
        <Router history={history}>
          <Link {...mockProps} />
        </Router>
      </ThemeProvider>
    );
    expect(screen.getByText(mockProps.children)).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', mockProps.to);
  });

  it('[NEGATIVE] should render with broken props', () => {
    render(
      <ThemeProvider theme={theme}>
        <Router history={history}>
          <Link to={undefined as any} children={undefined as any} />
        </Router>
      </ThemeProvider>
    );
    expect(screen.getByRole('link')).toBeInTheDocument();
  });
});
