import React from 'react';
import { render, screen } from '@testing-library/react';
import StudyDataViewer from './StudyDataViewer';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { createTestStore } from 'src/modules/store/testing';
import { ThemeProvider } from 'styled-components';
import { theme } from 'src/styles';
import { studyDataStateMock } from '../studyDataState.mock';
import userEvent from '@testing-library/user-event';

const studyDataViewerState = studyDataStateMock;

describe('StudyDataViewer', () => {
  let store: ReturnType<typeof createTestStore>;
  const testStudyId = "test_study_id"
  it('[NEGATIVE] should render with empty state', () => {
    store = createTestStore({})
    render(
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          <StudyDataViewer studyId={testStudyId}/>
        </Provider>
      </ThemeProvider>
    );
    expect(screen.getByTestId('ArrowBackIcon')).toBeInTheDocument();
    expect(screen.getByTestId('ArrowForwardIcon')).toBeInTheDocument();
  });
  it('should handle next and previus actions with state', async () => {
    store = createTestStore(studyDataViewerState)
    store.dispatch = (jest.fn() as any);
    render(
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          <StudyDataViewer studyId={testStudyId}/>
        </Provider>
      </ThemeProvider>
    );
    const backButton = screen.getByTestId("back-button")
    const forwardButton = screen.getByTestId("forward-button")
    expect(backButton).toBeInTheDocument()
    await userEvent.click(backButton)
    expect(store.dispatch).toHaveBeenCalled()
    await userEvent.click(forwardButton)
    expect(store.dispatch).toHaveBeenCalledTimes(2)
  });
});