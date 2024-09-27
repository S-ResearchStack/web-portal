import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'styled-components';
import { theme } from 'src/styles';
import { createTestStore } from 'src/modules/store/testing';
import { mockData } from '../studyManagement.slice';
import SubjectManagement from './SubjectManagement';

describe('SubjectManagement test', () => {
  afterEach(() => {
    cleanup();
  });

  it('should render correctly', () => {
    const store = createTestStore({
      auth: {
        authToken: 'test token',
      },
      subjectInfoList: {
        studyId: '1',
        subjectInfoList: mockData,
        totalSubjectInfoList: mockData.length,
        page: 0,
        size: 0,
      },
    });
    render(
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          <SubjectManagement />
        </Provider>
      </ThemeProvider>
    );
    expect(screen.getByText('Subject Status')).toBeInTheDocument();
    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Task Progress (done / total)')).toBeInTheDocument();
  });

  it('[NEGATIVE] should renders with empty store', () => {
    const store = createTestStore({});
    render(
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          <SubjectManagement />
        </Provider>
      </ThemeProvider>
    );
    expect(screen.getByText('Subject Status')).toBeInTheDocument();
    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Task Progress (done / total)')).toBeInTheDocument();
  });
});
