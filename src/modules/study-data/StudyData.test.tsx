import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import { Provider } from 'react-redux';
import StudyData from './StudyData';
import { createTestStore } from 'src/modules/store/testing';
import { StudiesState } from 'src/modules/studies/studies.slice';

jest.mock('src/modules/study-data/viewer/StudyDataViewer', () => (props: any) => (
  <div data-testid="studyDataViewer">
    <span role="studyId">{props.studyId}</span>
  </div>
));

jest.mock('src/common/components/Card', () => ({ children }: { children: React.ReactNode }) => (
  <div>{children}</div>
));

const emptyState: StudiesState = {
  isLoading: false,
  studies: [],
  selectedStudyId: '',
};

const studiesState: StudiesState = {
  isLoading: false,
  studies: [
    {
      id: 'test-study-1',
      name: 'Test Study 1',
      color: 'black',
      createdAt: 12345678,
    },
  ],
  selectedStudyId: 'test-study-1',
};

describe('StudyData Component test', () => {
  let store: ReturnType<typeof createTestStore>;
  it('should render correctly with state', async () => {
    store = createTestStore({
      studies: studiesState,
    });
    render(
      <Provider store={store}>
        <StudyData />
      </Provider>
    );
    expect(screen.getByText(/study data/i)).toBeInTheDocument();
    expect(screen.getByTestId('studyDataViewer')).toBeInTheDocument();
    expect(screen.getByRole('studyId')).toBeInTheDocument();
    expect(screen.getByRole('studyId')).toHaveTextContent(studiesState.selectedStudyId as string);
  });

  it('[NEGATIVE] should render with empty store', async () => {
    store = createTestStore({ studies: emptyState });
    render(
      <Provider store={store}>
        <StudyData />
      </Provider>
    );
    expect(screen.getByText(/study data/i)).toBeInTheDocument();
    expect(screen.getByTestId('studyDataViewer')).toBeInTheDocument();
    expect(screen.getByRole('studyId')).toBeInTheDocument();
    expect(screen.getByRole('studyId')).toHaveTextContent('');
  });
});
