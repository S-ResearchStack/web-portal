import EmptyPreviewIcon from "@mui/icons-material/SpeakerNotesOff";
import {SizedBox} from "src/common/styles/layout";
import {Grid} from "@mui/material";
import {DataGrid} from "@mui/x-data-grid";
import React from "react";
import styled from "styled-components";
import {StudyDataFileType} from "src/modules/study-data/studyData.enum";
import {StudyDataText} from "src/modules/study-data/StudyData.style";
import {typography} from "src/styles";
import ReactJson from "react-json-view";

const EmptyPreviewContainer = styled.div`
  display: flex; 
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
`

const EmptyPreviewText = styled(StudyDataText)`
  ${typography.bodySmallRegular};
  color: darkgrey;
`

const CSVPreviewContainer = styled.div`
  width: 100%;
  height: 100%;
  overflow: clip;
`

const MetaInfoViewContainer = styled.div<{width?: string, height?: string}>`
  display: flex;
  flex-direction: column;
  padding-left: 16px;
  padding-right: 16px;
  width: ${p => p.width ?? "100%"};
  height: ${p => p.height ?? "100%"};
  overflow: hidden;
`

const JSONContainer = styled(ReactJson)`
  padding-left: 8px;
  padding-right: 8px;
  overflow-y: scroll;

  ::-webkit-scrollbar {
    height: 12px;
    width: 12px;
    background: #000;
  }

  ::-webkit-scrollbar-thumb {
    background: #393812;
    -webkit-border-radius: 1ex;
    -webkit-box-shadow: 0 1px 2px rgba(0, 0, 0, 0.75);
  }

  ::-webkit-scrollbar-corner {
    background: #000;
  }
`

interface EmptyViewProps {
  text?: string
}

const EmptyView = ({ text = "" }: EmptyViewProps) => {
  return (
    <EmptyPreviewContainer data-testid="emptyPreview">
      <EmptyPreviewIcon style={{ fill: "lightgrey", height: "40%", width: "40%"}} />
      <SizedBox height={16}/>
      <EmptyPreviewText data-testid="emptyPreviewText">{text}</EmptyPreviewText>
    </EmptyPreviewContainer>)
}

interface CSVPreviewProps {
  data: string
  width?: string
  height?: string
}

const CSVPreview = ({ data, width, height }: CSVPreviewProps) => {
  const columns = data.split('\n')[0].split(',').map(value => ({
    field: value,
    headerName: value,
    flex: 1
  }))

  const rows = data.split('\n').slice(1).map((line, index) => {
    return line.split(',').reduce((previousValue, currentValue, currentIndex, array) => {
      return {
        ...previousValue,
        [columns[currentIndex].field]: currentValue
      }
    }, {id: index})
  })

  return (
    <CSVPreviewContainer>
      <Grid width={width} height={height}>
        <DataGrid
          columns={columns}
          rows={rows}
          disableColumnSelector
          disableRowSelectionOnClick
          disableColumnFilter
          disableColumnMenu
          hideFooter
          columnHeaderHeight={60}
          rowHeight={50}
        />
      </Grid>
    </CSVPreviewContainer>
  )
}

interface MetaInfoViewProps {
  data: string
  width?: string
  height?: string
}

const MetaInfoView = ({ data, width, height }: MetaInfoViewProps) => {
  return <MetaInfoViewContainer width={width} height={height}>
    <JSONContainer
      src={JSON.parse(data)}
      quotesOnKeys={false}
      displayDataTypes={false}
      displayObjectSize={false}
    />
  </MetaInfoViewContainer>
}

interface PreviewerProps {
  type: StudyDataFileType
  name: string
  data?: string
  width?: string
  height?: string
}

const StudyDataFilePreviewer = ({ type, name, data, width, height }: PreviewerProps) => {
  if(!data || type === StudyDataFileType.UNSPECIFIED) {
    return <EmptyView text="This file is not supported for preview" />
  }

  switch (type) {
    case StudyDataFileType.RAW_DATA:
      return <CSVPreview data={data} width={width} height={height}/>
    case StudyDataFileType.META_INFO:
      return <MetaInfoView data={data} width={width} height={height}/>
    case StudyDataFileType.MESSAGE_LOG:
      return <CSVPreview data={data} width={width} height={height}/>
    default:
      return <EmptyView/>
  }
}

export default StudyDataFilePreviewer
