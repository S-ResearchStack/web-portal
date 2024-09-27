import React from 'react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { render, screen} from '@testing-library/react';
import { createTestStore } from 'src/modules/store/testing';
import StudyDataFile from './StudyDataFile';
import { theme } from 'src/styles';
import { ThemeProvider } from 'styled-components';
import { StudyDataFileType } from '../studyData.enum';
import userEvent from '@testing-library/user-event';
const studyId = 'testId';

const fileList = [
  {
    "type": StudyDataFileType.RAW_DATA,
    "path": "test_path_1",
    "size": "1",
    "id": "test_id_1",
    "name": "test_file_1",
    "createdAt": "2020-01-01T00:00:00.000Z",
    "studyId": studyId,
    "parentId": "",
    "studyDataType": "FILE"
  },
  {
    "type": StudyDataFileType.RAW_DATA,
    "path": "test_path_2",
    "size": "2",
    "id": "test_id_2",
    "name": "test_file_2",
    "createdAt": "2020-01-01T00:00:00.000Z",
    "studyId": studyId,
    "parentId": "",
    "studyDataType": "FILE"
  }
]

const fileState = {
    "studyDataStage": {
    "current": {
      "filePage": 1, 
      "fileSize": 10, 
      "files": fileList, 
      "folderPage": 1, 
      "folderSize": 10, 
      "folders": [], 
      "path": [], 
      "pathLevel": 0, 
      "studyData": undefined, 
      "totalFiles": 0, 
      "totalFolders": 0
    }, 
    "history": [], 
    "historyIndex": -1
  },
}

const emptyFileState = {
    "studyDataStage": {
    "current": {
      "filePage": 0, 
      "fileSize": 0, 
      "files": [], 
      "folderPage": 1, 
      "folderSize": 10, 
      "folders": [], 
      "path": [], 
      "pathLevel": 0, 
      "studyData": undefined, 
      "totalFiles": 0, 
      "totalFolders": 0
    }, 
    "history": [], 
    "historyIndex": -1
  },
}
describe('Study Data File', () => {
  let store : ReturnType<typeof createTestStore>;
  it('[NEGATIVE] renders Study Data File component with no files', () => {
    store = createTestStore(emptyFileState);
    render(
    <ThemeProvider theme={theme}>
      <Provider store={store}>
        <StudyDataFile isLoadingParent={false} studyId={studyId}></StudyDataFile>
      </Provider>
    </ThemeProvider>
    )
    expect(screen.getByText("No Study Data File")).toBeInTheDocument();
  })
  it('renders Study Data File component with 2 files', () => {
    store = createTestStore(fileState);
    render(
    <ThemeProvider theme={theme}>
      <Provider store={store}>
        <StudyDataFile isLoadingParent={false} studyId={studyId}></StudyDataFile>
      </Provider>
    </ThemeProvider>
    )
    expect(screen.getAllByText(/test_file_/i)).toHaveLength(2);
  })
  it('should handle click file name', async () => {
    store = createTestStore(fileState);
    render(
    <ThemeProvider theme={theme}>
      <Provider store={store}>
        <StudyDataFile isLoadingParent={false} studyId={studyId}></StudyDataFile>
      </Provider>
    </ThemeProvider>
    )
    await userEvent.click(screen.getByText("test_file_1"));
    expect(screen.getByTestId("preview-dialog")).toBeInTheDocument()
  })
})
