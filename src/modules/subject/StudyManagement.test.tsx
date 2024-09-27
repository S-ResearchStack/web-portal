import React, { ReactNode } from 'react';
import { act, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import StudyManagement from './StudyManagement';
import { ThemeProvider } from 'styled-components';
import { theme } from 'src/styles';
import { Provider } from 'react-redux';
import { createTestStore } from '../store/testing';

jest.mock('src/common/components/Card', () => ({ children }: { children: ReactNode }) => (
  <div data-testid="card">{children}</div>
));
jest.mock('src/common/styles/layout', () => ({
  RowContainer: ({ children }: { children: ReactNode }) => (
    <div data-testid="row-container">{children}</div>
  ),
}));
jest.mock(
  'src/modules/subject/SubjectManagement/SubjectManagement',
  () =>
    ({ children }: { children: ReactNode }) => (
      <div data-testid="subject-management">{children}</div>
    )
);

describe('StudyManagement test', () => {
  it('should renders correctly', async () => {
    const store = createTestStore({
      auth: {
        authToken: 'test token',
      },
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <ThemeProvider theme={theme}>
            <StudyManagement />
          </ThemeProvider>
        </Provider>
      );
    });

    expect(screen.getByText('Study Management')).toBeInTheDocument();
    expect(screen.getByTestId('card')).toBeInTheDocument();
    expect(screen.getByTestId('row-container')).toBeInTheDocument();
    expect(screen.getByTestId('subject-management')).toBeInTheDocument();
  });

  it('[NEGATIVE] should renders with empty store', async () => {
    const store = createTestStore({});

    await act(async () => {
      render(
        <Provider store={store}>
          <ThemeProvider theme={theme}>
            <StudyManagement />
          </ThemeProvider>
        </Provider>
      );
    });

    expect(screen.getByText('Study Management')).toBeInTheDocument();
    expect(screen.getByTestId('card')).toBeInTheDocument();
    expect(screen.getByTestId('row-container')).toBeInTheDocument();
    expect(screen.getByTestId('subject-management')).toBeInTheDocument();
  });
});
