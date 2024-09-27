import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StudyDataFileType } from 'src/modules/study-data/studyData.enum';
import StudyDataFilePreviewer from './StudyDataFilePreviewer';
import React from 'react';
import { theme } from 'src/styles';
import { ThemeProvider } from 'styled-components';

describe('StudyDataFilePreviewer', () => {
  test('[NEGATIVE] renders empty view when no data or unspecified type', () => {
    render(
      <ThemeProvider theme={theme}>
        <StudyDataFilePreviewer type={StudyDataFileType.UNSPECIFIED} name="file" />
      </ThemeProvider>
    );
    expect(screen.getByText('This file is not supported for preview')).toBeInTheDocument();
  });

  test('renders CSV preview for RAW_DATA type', () => {
    const csvData = 'header1,header2\nvalue1,value2';
    render(
      <ThemeProvider theme={theme}>
        <StudyDataFilePreviewer type={StudyDataFileType.RAW_DATA} name="file" data={csvData} />;
      </ThemeProvider>)
    expect(screen.getByText('header1')).toBeInTheDocument();
    expect(screen.getByText('value1')).toBeInTheDocument();
  });

  test('renders JSON preview for META_INFO type', () => {
    const jsonData = JSON.stringify({ key: 'value' });
    render(
      <ThemeProvider theme={theme}>
        <StudyDataFilePreviewer type={StudyDataFileType.META_INFO} name="file" data={jsonData} />;
      </ThemeProvider>)
    expect(screen.getByText('key')).toBeInTheDocument();
    expect(screen.getByText('"value"')).toBeInTheDocument();
  });

  test('renders CSV preview for MESSAGE_LOG type', () => {
    const csvData = 'log1,log2\nmessage1,message2';
    render(
      <ThemeProvider theme={theme}>
        <StudyDataFilePreviewer type={StudyDataFileType.MESSAGE_LOG} name="file" data={csvData} />;
      </ ThemeProvider>)
    expect(screen.getByText('log1')).toBeInTheDocument();
    expect(screen.getByText('message1')).toBeInTheDocument();
  });

  test('[NEGATIVE] renders empty view for other types', () => {
    const data = 'data-test';
    render(
      <ThemeProvider theme={theme}>
        <StudyDataFilePreviewer type={StudyDataFileType.ATTACHMENT} name="file" data={data}/>
      </ThemeProvider>
    );
    expect(screen.getByTestId("emptyPreview")).toBeInTheDocument();
    expect(screen.getByTestId("emptyPreviewText").textContent).toBeFalsy(); 
    // render nothing in preview text area
  })
});
