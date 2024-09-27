import {useAppDispatch} from "src/modules/store";
import React, {useEffect, useState} from "react";
import {DataGrid, GridColDef, GridPaginationModel, GridRenderCellParams, GridRowSelectionModel} from "@mui/x-data-grid";
import styled from "styled-components";
import {colors, typography} from "src/styles";
import {
  loadStage,
  loadFolderPage,
  useStageState, initStage
} from "src/modules/study-data/studyData.slice";
import Button from "@mui/material/Button";
import {executeDownload, getFileDownloadUrls} from "src/modules/file-download/fileDownload";
import {StudyDataText} from "src/modules/study-data/StudyData.style";
import {ROOT_FOLDER_ID} from "src/modules/api";

const FolderNameCellContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`

const FolderNameContainer = styled.div`
  margin: 0;
  min-width: 0;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  text-transform: none;
  color: ${colors.primary};
  :hover {
    cursor: pointer;
    text-decoration: underline;
  }
`

const FolderBottomContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: end;
  flex-shrink: 0;
  margin-top: 16px;
  height: 48px;
  min-height: 48px;
  max-height: 48px;
`

const DownloadButtonContainer = styled(Button)`
  ${typography.bodyXSmallRegular}
  max-height: 32px;
  background: transparent;
  border: none;
  padding: 0 0 0 0;
  margin: 0 0 0 0;
`

const DownloadButtonText = styled(StudyDataText)`
  ${typography.bodySmallRegular};
  align-self: start;
  text-align: start;
`

type Stage = 'undefined' | 'study' | 'subject'

export interface FolderRow {
  id: number
  fid: string
  name: string
}

export const RenderFolderName = (
  studyId: string | undefined,
  props: GridRenderCellParams<FolderRow>,
  onSelected?: (id: string, name: string) => void
) => {
  const { value, row } = props

  const handleClickName = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation()
    onSelected?.(row.fid, row.name)
  }
  return <FolderNameCellContainer>
    <FolderNameContainer onClick={handleClickName}>{value}</FolderNameContainer>
  </FolderNameCellContainer>
}

interface DownloadButtonProps {
  studyId: string
  stage: Stage
  selectedNames: string[]
  disabled?: boolean
}

const DownloadButton = ({ studyId, stage, selectedNames, disabled }: DownloadButtonProps) => {
  const dispatch = useAppDispatch()

  const handleDownload = async () => {
    const urls = await dispatch(getFileDownloadUrls(studyId, selectedNames))
    urls.filter((url): url is string => !!url).forEach((url) => {
      executeDownload(url)
    })
  }
  return <DownloadButtonContainer
    disabled={disabled}
    onClick={handleDownload}
    variant="contained"
    disableElevation
  >
    <DownloadButtonText>Download</DownloadButtonText>
  </DownloadButtonContainer>
}

interface StudyDataFolderProps {
  isLoadingParent: boolean
  studyId?: string
}

const StudyDataFolder = ({isLoadingParent, studyId}: StudyDataFolderProps) => {
  const dispatch = useAppDispatch()

  const [isInitialized, setIsInitialized] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 0 })
  const [rows, setRows] = useState<FolderRow[]>([])
  const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>([])
  const [checkedList, setCheckedList] = useState<Set<string>>(new Set<string>())
  const [stage, setStage] = useState<Stage>('undefined')

  const stageState = useStageState()
  const initStates = () => {
    setCheckedList(new Set<string>())
    setRowSelectionModel([])
  }

  const handleSelectFolder = async (id: string, name: string) => {
    if(studyId && !isLoadingParent && !isLoading && id && paginationModel) {
      setPaginationModel({page: 0, pageSize: paginationModel.pageSize})
      setIsLoading(true)
      await dispatch(loadStage({
        studyId,
        parentId: id,
        parentName: name,
        size: paginationModel.pageSize
      }))
      setIsLoading(false)
    }
  }

  const handlePaginationModelChange = async (model: GridPaginationModel) => {
    if(model.page !== paginationModel.page || model.pageSize !== paginationModel.pageSize) {
      setPaginationModel(model)
      if(!isLoadingParent && !isLoading) {
        setIsLoading(true)
        await dispatch(loadFolderPage({ page: model.page, size: model.pageSize }))
        setIsLoading(false)
      }
    }
  }

  const handleRowSelectionModelChange = (newRowSelectionModel: GridRowSelectionModel) => {
    const included = newRowSelectionModel.map(m => rows[parseInt(m.toString(), 10)].name)
    const excluded = rows.filter(r => !included.includes(r.name)).map(r => r.name)

    const list = [...checkedList.values()]
    const filtered = list.filter(e => !excluded.includes(e))

    const newList = new Set(filtered)
    included.forEach(e => newList.add(e))

    setCheckedList(newList)
    setRowSelectionModel(newRowSelectionModel)
  }

  useEffect(() => {
    const folderRows: FolderRow[] = [
      stageState.folders.map((folder, index) => ({
        id: index,
        fid: folder.id,
        name: folder.name
      }))
    ].flat()

    setRows(folderRows)
    setRowSelectionModel(folderRows.filter(r => checkedList.has(r.name)).map(r => r.id))

    if(stageState.folders.length > 0) {
      if(stageState.folders[0].parentId === ROOT_FOLDER_ID) {
        setStage('study')
      } else if(stageState.folders[0].parentId === studyId) {
        setStage('subject')
      } else {
        setStage('undefined')
      }
    } else {
      setStage('undefined')
    }

  }, [stageState.folders])

  useEffect(() => {
    initStates()
  }, [stageState.studyData])

  useEffect(() => {
    if(!isInitialized && studyId && paginationModel.pageSize > 0) {
      setIsInitialized(true)
      dispatch(initStage(studyId, paginationModel.pageSize))
    }
  }, [dispatch, studyId, paginationModel])

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Folder Name',
      flex: 1,
      renderCell: (props) => RenderFolderName(studyId, props, handleSelectFolder)
    },
  ]

  return <>
    <DataGrid
      data-testid="study-data-folder-grid"
      disableRowSelectionOnClick
      checkboxSelection
      isRowSelectable={() => stage != 'undefined'} // temporarily unavailable
      loading={isLoadingParent || isLoading}
      columns={columns}
      rows={rows}
      rowCount={stageState.totalFolders}
      localeText={{
        noRowsLabel: "No Study Data Folder",
        footerRowSelected: () => `${checkedList.size} selected folder${checkedList.size > 1 ? 's' : ''}`
      }}
      columnHeaderHeight={48}
      rowHeight={40}
      rowSelectionModel={rowSelectionModel}
      onRowSelectionModelChange={handleRowSelectionModelChange}
      autoPageSize
      pagination
      paginationMode="server"
      paginationModel={paginationModel}
      onPaginationModelChange={handlePaginationModelChange}
      sx={{ borderColor: 'rgba(0, 0, 0, .08)' }}
    />
    <FolderBottomContainer>
      {studyId && <DownloadButton
        studyId={studyId}
        stage={stage}
        selectedNames={Array.from(checkedList.values())}
        disabled={!checkedList || checkedList.size <= 0}
      />}
    </FolderBottomContainer>
  </>
}

export default StudyDataFolder
