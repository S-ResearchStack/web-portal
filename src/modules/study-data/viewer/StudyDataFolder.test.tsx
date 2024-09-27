import React from 'react';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import { Provider } from 'react-redux';
import { render, screen, waitFor } from '@testing-library/react';
import { createTestStore } from 'src/modules/store/testing';
import StudyDataFolder, { RenderFolderName } from './StudyDataFolder';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from 'styled-components';
import { theme } from 'src/styles';
import { useAppDispatch } from 'src/modules/store';

const studyId = 'testId';
const mockFolders = [
  {
    id: 'test_folder_1_id',
    studyId: 'test_study_id',
    parentId: '',
    name: 'test_folder_1',
    studyDataType: 'folder',
  },
  {
    id: 'test_folder_2_id',
    studyId: 'test_study_id',
    parentId: '',
    name: 'test_folder_2',
    studyDataType: 'folder',
  },
];
const folderState = {
  studyDataStage: {
    current: {
      filePage: 0,
      fileSize: 0,
      files: [],
      folderPage: 1,
      folderSize: 10,
      folders: [...mockFolders],
      path: [],
      pathLevel: 0,
      studyData: undefined,
      totalFiles: 0,
      totalFolders: 2,
    },
    history: [],
    historyIndex: -1,
  },
};

const emptyFolderState = {
  studyDataStage: {
    current: {
      filePage: 0,
      fileSize: 0,
      files: [],
      folderPage: 1,
      folderSize: 10,
      folders: [],
      path: [],
      pathLevel: 0,
      studyData: undefined,
      totalFiles: 0,
      totalFolders: 0,
    },
    history: [],
    historyIndex: -1,
  },
};

describe('StudyDataFolder', () => {
  it('should render correctly with 2 folders in list ', () => {
    const store = createTestStore(folderState);
    render(
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          <StudyDataFolder isLoadingParent={true} studyId={studyId}></StudyDataFolder>
        </Provider>
      </ThemeProvider>
    );
    expect(screen.getAllByText(/test_folder_/i)).toHaveLength(2);
  });

  it('[NEGATIVE] renders correctly when there is 0 folders', () => {
    const store = createTestStore(emptyFolderState);
    render(
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          <StudyDataFolder isLoadingParent={false} studyId={studyId}></StudyDataFolder>
        </Provider>
      </ThemeProvider>
    );
    expect(screen.getByText('No Study Data Folder')).toBeInTheDocument();
  });

  it('should handle select folder in folder list', async () => {
    const store = createTestStore(folderState);
    const dispatchFn = jest.fn();
    jest.mock('src/modules/store', () => {
      return {
        ...jest.requireActual('src/modules/store'),
        useAppDispatch: () => dispatchFn
      }
    })
    render(
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          <StudyDataFolder isLoadingParent={false} studyId={studyId}></StudyDataFolder>
        </Provider>
      </ThemeProvider>
    );
    const folderItem_1 = screen.getByText('test_folder_1');
    await userEvent.click(folderItem_1);
  });

  it('should display correctly RenderFolderName', () => {
    const store = createTestStore(folderState);

    render(
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          {RenderFolderName('1', {
            value: 'folder name',
            row: { fid: 'row id', name: 'row name' },
          } as any)}
        </Provider>
      </ThemeProvider>
    );

    expect(screen.getByText('folder name')).toBeInTheDocument();
  });

  it('[NEGATIVE] should display RenderFolderName with broken props', () => {
    const store = createTestStore(folderState);

    render(
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          {RenderFolderName(undefined, { value: 'folder name', row: undefined } as any)}
        </Provider>
      </ThemeProvider>
    );

    expect(screen.getByText('folder name')).toBeInTheDocument();
  });

  it('should handle click event in RenderFolderName ', async () => {
    const store = createTestStore(folderState);

    const onSelectFn = jest.fn();
    render(
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          {RenderFolderName(
            '1',
            { value: 'folder name', row: { fid: 'row fid', name: 'row name' } } as any,
            onSelectFn
          )}
        </Provider>
      </ThemeProvider>
    );

    await userEvent.click(screen.getByText('folder name'));
    expect(onSelectFn).toBeCalledWith('row fid', 'row name');
  });
});
