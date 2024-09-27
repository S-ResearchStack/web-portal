import React from 'react';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'styled-components';
import { theme } from 'src/styles';
import userEvent from '@testing-library/user-event';
import SubjectStatusSelector from './SubjectStatusSelector';
import { createTestStore } from 'src/modules/store/testing';
import { SubjectStatus } from 'src/modules/study-data/studyData.enum';
import { SubjectInfo } from '../studyManagement.slice';

jest.mock('src/common/components/Modal', () => {
  return ({ onAccept, onDecline }: { onAccept: () => Promise<void>; onDecline: () => void }) => {
    return (
      <div>
        <button onClick={onAccept}>Okay</button>
        <button onClick={onDecline}>Cancel</button>
      </div>
    );
  };
});

describe('SubjectStatusSelector test', () => {
  const mockSubjectInfo: SubjectInfo = {
    studyId: 'AFHTEST',
    subjectNumber: '15',
    status: SubjectStatus.PARTICIPATING,
  };

  beforeEach(async () => {
    await act(() => {
      render(
        <ThemeProvider theme={theme}>
          <Provider store={createTestStore({})}>
            <SubjectStatusSelector subjectInfo={mockSubjectInfo} />
          </Provider>
        </ThemeProvider>
      );
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('should render correctly', async () => {
    expect(screen.getByText(/PARTICIPATING/i)).toBeInTheDocument();
    expect(screen.getByText(/WITHDRAW/i)).toBeInTheDocument();
    expect(screen.getByText(/DROP/i)).toBeInTheDocument();
    expect(screen.getByText(/COMPLETED/i)).toBeInTheDocument();
    expect(screen.getByText(/PARTICIPATING/i)).toHaveStyle('color: #ffffff');
  });

  it('should change the status when clicked', async () => {
    const completedStatusButton = screen.getByText(/COMPLETED/i);
    expect(completedStatusButton).not.toHaveStyle('color: #ffffff');
    await act(() => {
      userEvent.click(completedStatusButton);
      userEvent.click(screen.getByRole('button', { name: /okay/i }));
    });
    await waitFor(() => {
      expect(completedStatusButton).toHaveStyle('color: #ffffff');
    });
  });

  it('[NEGATIVE] should not change the status when clicked', async () => {
    const completedStatusButton = screen.getByText(/COMPLETED/i);
    expect(completedStatusButton).not.toHaveStyle('color: #ffffff');
    await act(() => {
      userEvent.click(completedStatusButton);
      userEvent.click(screen.getByRole('button', { name: /cancel/i }));
    });
    await waitFor(() => {
      expect(completedStatusButton).not.toHaveStyle('color: #ffffff');
      expect(screen.getByText(/PARTICIPATING/i)).toHaveStyle('color: #ffffff');
    });
  });
});
