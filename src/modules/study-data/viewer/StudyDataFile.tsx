import React, {useEffect, useRef, useState} from "react";
import {
  DataGrid,
  GridColDef,
  GridColumnHeaderParams,
  GridPaginationModel,
  GridRenderCellParams,
  GridRowSelectionModel,
} from "@mui/x-data-grid";
import {
  loadFilePage, StudyDataInfo,
  useStageState
} from "src/modules/study-data/studyData.slice";
import {
  FileCheckStatus,
  FileUploadStatus,
  StudyDataFileType
} from "src/modules/study-data/studyData.enum";
import styled from "styled-components";
import {colors, typography} from "src/styles";
import DownloadIcon from "src/assets/icons/download.svg"
import Button from "@mui/material/Button";
import {DownloadIconButton, StudyDataText} from "src/modules/study-data/StudyData.style";
import {
  executeDownload,
  executeDownloadFiles,
  getFileDownloadUrl,
  getFileDownloadUrls,
  getZippedFileDownloadUrls
} from "src/modules/file-download/fileDownload";
import {useAppDispatch} from "src/modules/store";
import {Dialog} from "@mui/material";
import Dropzone, {DropzoneRef} from "react-dropzone";
import {Clear as ErrorIcon, InsertDriveFile, RemoveCircle} from '@mui/icons-material'
import StudyDataFileUploadProgressBar from "src/modules/study-data/file-upload/StudyDataFileUploadProgressBar";
import StudyDataFilePreviewer from "src/modules/study-data/viewer/StudyDataFilePreviewer";
import CheckMarkIcon from "src/assets/icons/checkmark.svg"
import {SpecColorType} from "src/styles/theme";
import {
  checkStudyDataFileUploadable,
  prepareUploadFiles,
  uploadStudyDataFile,
  useStudyDataFileIsDuplicated,
  useStudyDataFileIsUploadable,
  useStudyDataFileIsUploading,
  useStudyDataFileUploadProgress,
} from "src/modules/study-data/file-upload/studyDataFileUpload.slice";
import Spinner from "src/common/components/Spinner";
import { useTranslation } from 'src/modules/localization/useTranslation';

const FileNameHeaderContainer = styled.div`
  display: flex;
  flex-direction: row;
`

const FileNameHeader = styled.div`
  min-width: 0;
  text-transform: none;
`

const FileNameContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
`

const FileName = styled.div`
  margin: 0;
  min-width: 0;
  text-transform: none;
  color: ${colors.primary};
  :hover {
    cursor: pointer;
    text-decoration: underline;
  }
`

const FileBottomContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: end;
  flex-shrink: 0;
  margin-top: 16px;
  height: 48px;
  min-height: 48px;
  max-height: 48px;
`

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 256px;
`

const DownloadButtonContainer = styled(Button)`
  ${typography.bodyXSmallRegular}
  max-height: 32px;
  width: 120px;
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

const DownloadIconButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: end;
  width: 100%;
`

const UploadButtonContainer = styled(Button)`
  ${typography.bodyXSmallRegular}
  max-height: 32px;
  width: 120px;
  background: transparent;
  border: none;
  padding: 0 0 0 0;
  margin: 0 0 0 0;
`

const UploadButtonText = styled(StudyDataText)`
  ${typography.bodySmallRegular};
  align-self: start;
  text-align: start;
`

const UploadSelectorContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 12px;
  width: 30vw;
  height: 35vh;
`

const DropzoneInnerContainer = styled.div<{ isDragActive: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  background: ${p => p.isDragActive ? colors.primary20 : "transparent"};
  border: 2px dashed ${colors.disabled};
  border-radius: 12px;
`

const DropzoneDummy = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`

const SpinnerContainer = styled.div`
  position: absolute;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: calc(100% - 24px);
  height: calc(100% - 100px);
  background: ${colors.black15};
  border-radius: 12px;
`

const FileSpinner = styled(Spinner)`
  z-index: 2;
`

const DropzoneTextContainer = styled.div`
  display: flex;
  flex-direction: row;
  border-radius: 4px;
  width: 100%;
  height: 100%;
`

const DropzoneText = styled(StudyDataText)`
  ${typography.headingXMediumRegular};
  color: ${colors.textDisabled};
  opacity: .4;
`

const AttachedBoxContainer = styled.div`
  display: flex;
  flex-direction: column;
  position: absolute;
  row-gap: 24px;
  padding: 24px;
  top: 12px;
  left: 12px;
  right: 12px;
  bottom: 88px;
  border-radius: 4px;
  overflow: scroll;
`

const UploadSelectorButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  margin-top: 8px;
  gap: 4px;
`

const UploadSelectorUploadButtonContainer = styled.div`
  flex: 2;
`

const UploadSelectorUploadButton = styled(Button)`
  padding: 0;
  margin: 0;
  height: 68px;
  width: 100%;
`

const UploadSelectorSelectFilesButton = styled(Button)`
  padding: 0;
  margin: 0;
  height: 32px;
  width: 100%;
`

const UploadSelectorButtonText = styled.div`
  ${typography.bodySmallRegular};
  align-self: center;
  text-transform: none;
`

const VerticalButtonsContainers = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  flex: 3;
  width: 100%;
  gap: 4px;
`

const UploadSelectorCloseButton = styled(Button)`
  padding: 0;
  margin: 0;
  height: 32px;
  background: transparent;
  border: none;
`

const CompleteIcon = styled(CheckMarkIcon)`
  width: 44px;
  height: 44px;
`

const AttachedFileContainer = styled.div`
  position: relative;
  justify-content: center;
  align-items: center;
`

const AttachedFileIcon = styled(InsertDriveFile)``

const FileSubIconContainer = styled.div`
  position: absolute;
  top: -4px;
  left: -4px;
  z-index: 2;
`

const RemoveFileIcon = styled(RemoveCircle)`
  &:hover {
    cursor: pointer;
    fill: ${colors.statusErrorText};
  }
`

const AttachedFileLabel = styled.div`
  ${typography.labelSemibold}
  position: absolute;
  bottom: -8px;
  z-index: 1;
`


const DuplicateSelectorContainer = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 4px;
  height: 100%;
`

const DuplicateSelectorTextContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
`

const DuplicateSelectorText = styled.div`
  ${typography.bodyXSmallSemibold};
  color: ${colors.secondaryRed};
`

const DuplicateSelectorButtonContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: row;
  column-gap: 4px;
  height: 32px;
`

const DuplicateSelectorButton = styled(Button)`
  padding: 0;
  margin: 0;
  height: 32px;
  width: 100%;
`

const DuplicateSelectorButtonText = styled.div`
  ${typography.bodySmallRegular};
  align-self: center;
  text-transform: none;
`


export interface FileRow {
  id: number
  type: StudyDataFileType
  name: string
  path: string
  size: string
  preview?: string
  createdAt: string
}

const typeMap = new Map([
  [StudyDataFileType.UNSPECIFIED, 'Unspecified'],
  [StudyDataFileType.RAW_DATA, 'Raw Data'],
  [StudyDataFileType.META_INFO, 'Meta Information'],
  [StudyDataFileType.MESSAGE_LOG, 'Message Log'],
  [StudyDataFileType.ATTACHMENT, 'Attachment']
])

const RenderFileNameHeader = (props: GridColumnHeaderParams) => {
  const { colDef } = props
  return <FileNameHeaderContainer>
    <FileNameHeader>{colDef.headerName}</FileNameHeader>
  </FileNameHeaderContainer>
}

const RenderFileName = (
  props: GridRenderCellParams<FileRow>,
  onSelected?: (file: FileRow) => void
) => {

  const { value } = props

  const handleClickName = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation()
    onSelected?.(value)
  }
  return <FileNameContainer>
    <FileName onClick={handleClickName}>{value}</FileName>
  </FileNameContainer>
}

const RenderType = (
  props: GridRenderCellParams<FileRow>,
) => {
  const {value} = props
  return <>{typeMap.get(value)}</>
}

const RenderDownload = (
  studyId: string | undefined,
  props: GridRenderCellParams<FileRow>
) => {
  const dispatch = useAppDispatch()

  const { row } = props

  const handleDownload = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()

    if(!studyId) return
    const url = await dispatch(getFileDownloadUrl(studyId, row.name))
    if(url) {
      executeDownloadFiles(url, row.name)
    }
  }

  return <DownloadIconButtonContainer>
    <DownloadIconButton onClick={handleDownload}>
      <DownloadIcon/>
    </DownloadIconButton>
  </DownloadIconButtonContainer>
}

interface DownloadButtonProps {
  studyId: string
  filePaths: string[]
  disabled?: boolean
}

const DownloadButton = ({ studyId, filePaths, disabled }: DownloadButtonProps) =>  {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  const handleDownload = async () => {
    const urls = await dispatch(getZippedFileDownloadUrls(studyId, filePaths))
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
    <DownloadButtonText>
      {t("STUDY_DATA_DOWNLOAD_BUTTON")}
    </DownloadButtonText>
  </DownloadButtonContainer>
}

interface UploadButtonProps {
  disabled?: boolean
  onClickUpload: () => void
}

const UploadButton = ({ disabled, onClickUpload }: UploadButtonProps) => {
  const { t } = useTranslation()
  return <UploadButtonContainer
    disabled={disabled}
    onClick={onClickUpload}
    variant="contained"
    disableElevation
  >
    <UploadButtonText>
      {t("STUDY_DATA_UPLOAD_BUTTON")}
    </UploadButtonText>
  </UploadButtonContainer>
}

const statusIconMap = new Map([
  [FileUploadStatus.FINISHED, <CompleteIcon key={FileUploadStatus.FINISHED}/>],
  [FileUploadStatus.FAILED, <ErrorIcon key={FileUploadStatus.FAILED} color="error" fontSize="large"/>]
])

const baseColorMap = new Map<FileUploadStatus, SpecColorType>([
  [FileUploadStatus.UNSPECIFIED, "disabled"],
  [FileUploadStatus.READY, "disabled"],
  [FileUploadStatus.UPLOADING, "disabled"],
  [FileUploadStatus.FINISHED, "disabled"],
  [FileUploadStatus.FAILED, "statusError"]
])

const statusColorMap = new Map<FileUploadStatus, SpecColorType>([
  [FileUploadStatus.UNSPECIFIED, "primary"],
  [FileUploadStatus.READY, "primary"],
  [FileUploadStatus.UPLOADING, "primary"],
  [FileUploadStatus.FINISHED, "primary"],
  [FileUploadStatus.FAILED, "statusError"]
])


interface UploadableFileProps {
  studyData: StudyDataInfo
  file: File
  onRemove?: (file: File) => void
}

const UploadableFile = ({ studyData, file, onRemove }: UploadableFileProps) => {
  const { t } = useTranslation()
  const progress = useStudyDataFileUploadProgress({ ...studyData, file })

  const { uploadStatus, checkStatus, loaded, total } = progress
  const statusIcon = uploadStatus && statusIconMap.get(uploadStatus)
  const baseColor = (uploadStatus && baseColorMap.get(uploadStatus)) ?? "disabled"
  const statusColor = (uploadStatus && statusColorMap.get(uploadStatus)) ?? "primary"

  const handleRemove = () => {
    onRemove?.(file)
  }

  return <StudyDataFileUploadProgressBar
    image={
      <AttachedFileContainer>
        <AttachedFileIcon
          color="disabled"
          onClick={() => {}}
          sx={{ fontSize: "48px"}}
        />
        {checkStatus === FileCheckStatus.DUPLICATED &&
          <AttachedFileLabel>
            {t("STUDY_DATA_UPLOAD_DUPLICATED_FILE")}
          </AttachedFileLabel>
        }
        <FileSubIconContainer>
          { ( uploadStatus === FileUploadStatus.READY ||
              uploadStatus === FileUploadStatus.FAILED ) &&
            <RemoveFileIcon onClick={handleRemove}/>
          }
          {(uploadStatus === FileUploadStatus.UPLOADING) &&
            <Spinner size="xs"/>
          }
        </FileSubIconContainer>
      </AttachedFileContainer>
    }
    statusIcon={statusIcon}
    name={file.name}
    loaded={(!loaded || uploadStatus === FileUploadStatus.FAILED) ? 0 : loaded}
    total={total ?? file.size}
    baseColor={baseColor}
    progressColor={statusColor}
  />
}


interface AttachedBoxProps {
  studyData: StudyDataInfo
  attachedFiles: File[]
  onRemove?: (file: File) => void
}

const AttachedBox = ({ studyData, attachedFiles, onRemove }: AttachedBoxProps) =>
  <AttachedBoxContainer>
    {attachedFiles.map(file => <UploadableFile
      key={file.name}
      studyData={studyData}
      file={file}
      onRemove={onRemove}/>)
    }
  </AttachedBoxContainer>

interface  DuplicateSelectorProps {
  onSelected?: (overwrite: boolean) => void
}

const DuplicateSelector = ({ onSelected }: DuplicateSelectorProps) => {
  const { t } = useTranslation();

  return <DuplicateSelectorContainer>
    <DuplicateSelectorTextContainer>
      <DuplicateSelectorText>
        {t("STUDY_DATA_UPLOAD_SELECT_OVERWRITE")}
      </DuplicateSelectorText>
    </DuplicateSelectorTextContainer>
    <DuplicateSelectorButtonContainer>
      <DuplicateSelectorButton
        variant="outlined"
        color="info"
        disableElevation
        onClick={() => onSelected?.(false)}
      >
        <DuplicateSelectorButtonText>
          {t("STUDY_DATA_UPLOAD_DUPLICATED_SKIP_BUTTON")}
        </DuplicateSelectorButtonText>
      </DuplicateSelectorButton>
      <DuplicateSelectorButton
        variant="outlined"
        color="error"
        disableElevation
        onClick={() => onSelected?.(true)}
      >
        <DuplicateSelectorButtonText>
          {t("STUDY_DATA_UPLOAD_DUPLICATED_OVERWRITE_BUTTON")}
        </DuplicateSelectorButtonText>
      </DuplicateSelectorButton>
    </DuplicateSelectorButtonContainer>
  </DuplicateSelectorContainer>
}

interface UploadFileSelectorProps {
  studyData: StudyDataInfo
  onClose?: () => void
}

const UploadFileSelector = ({ studyData, onClose }: UploadFileSelectorProps) => {
  const { t } = useTranslation()

  const dispatch = useAppDispatch()
  const dropzoneRef = useRef<DropzoneRef | null>()

  const [isLoading, setIsLoading] = useState(false)
  const [attachedFiles, setAttachedFiles] = useState<File[]>([])
  const [isSelectMode, setIsSelectMode] = useState(false)

  const isDuplicated = useStudyDataFileIsDuplicated()
  const isUploadable = useStudyDataFileIsUploadable()
  const isUploading = useStudyDataFileIsUploading()

  const handleDrop = async (additionalFiles: File[]) => {
    setIsLoading(true)

    const checkers: Promise<void>[] = []
    additionalFiles.forEach(file => {
      checkers.push(dispatch(checkStudyDataFileUploadable({...studyData, file})))
    })
    await Promise.all(checkers)

    setIsLoading(false)

    const merged = new Map([...attachedFiles, ...additionalFiles].map((v)=>([v.name, v]))).values()
    setAttachedFiles([...merged])
  }

  const upload = async (overwrite: boolean) => {
    attachedFiles.forEach(file => {
      dispatch(uploadStudyDataFile({...studyData, file, overwrite}))
    })
  }

  const handleUpload = async () => {
    if(isDuplicated) {
      setIsSelectMode(true)
    } else {
      upload(false)
    }
  }

  const handleDuplicate = (overwrite: boolean) => {
    setIsSelectMode(false)
    upload(overwrite)
  }

  const handleRemove = async (file: File) => {
    setAttachedFiles(prevList => {
      const removeIndex = prevList.indexOf(file)
      return [...prevList.slice(0, removeIndex), ...prevList.slice(removeIndex + 1)]
    })
  }

  useEffect(() => () => { dispatch(prepareUploadFiles()) }, [])

  const isSelectFilesDisabled = isLoading || isUploading

  return <UploadSelectorContainer>
    <Dropzone ref={instance => {dropzoneRef.current = instance}} onDrop={handleDrop} noKeyboard autoFocus>
        {({getRootProps, isDragActive}) => (
          <DropzoneInnerContainer isDragActive={isDragActive}>
            <div {...getRootProps()}>
              <DropzoneDummy/>
              <AttachedBox
                studyData={studyData}
                attachedFiles={attachedFiles}
                onRemove={handleRemove}
              />
                 <DropzoneTextContainer>
                  <DropzoneText>
                    {t("STUDY_DATA_UPLOAD_DROPZONE")}
                  </DropzoneText>
                </DropzoneTextContainer>

            </div>

          </DropzoneInnerContainer>
        )}
      </Dropzone>
    {isLoading && <SpinnerContainer><FileSpinner size="m"/></SpinnerContainer>}
    <UploadSelectorButtonContainer>
      <UploadSelectorUploadButtonContainer>
        {isSelectMode
          ? <DuplicateSelector onSelected={handleDuplicate}/>
          : <UploadSelectorUploadButton
          disabled={isLoading || attachedFiles.length <= 0 || !isUploadable}
          onClick={handleUpload}
          variant="contained"
          disableElevation
        >
            {isUploading
              ? <Spinner size="xs"/>
              : <UploadSelectorButtonText>
                {t("STUDY_DATA_UPLOAD_BUTTON")}
              </UploadSelectorButtonText>
            }
        </UploadSelectorUploadButton>
        }
      </UploadSelectorUploadButtonContainer>
      <VerticalButtonsContainers>
          <Dropzone noDrag noDragEventsBubbling>
            {({ getRootProps, getInputProps }) => (
              <div {...getRootProps()}>
                {!isSelectFilesDisabled && <input {...getInputProps()}/>}
                <UploadSelectorSelectFilesButton
                  disabled={isSelectFilesDisabled || isSelectMode}
                  variant="contained"
                  disableElevation
                  fullWidth
                >
                  <UploadSelectorButtonText>
                    {t("STUDY_DATA_UPLOAD_SELECT_FILES_BUTTON")}
                  </UploadSelectorButtonText>
                </UploadSelectorSelectFilesButton>
              </div>
            )}
          </Dropzone>
        <UploadSelectorCloseButton
          disabled={isSelectFilesDisabled || isSelectMode}
          variant="outlined"
          disableElevation
          onClick={onClose}
        >
          <UploadSelectorButtonText>
            {t("STUDY_DATA_CLOSE_BUTTON")}
          </UploadSelectorButtonText>
        </UploadSelectorCloseButton>
      </VerticalButtonsContainers>
    </UploadSelectorButtonContainer>
  </UploadSelectorContainer>
}

interface StudyDataFileProps {
  isLoadingParent: boolean
  studyId?: string
}

const StudyDataFile = ({isLoadingParent, studyId}: StudyDataFileProps) => {
  const dispatch = useAppDispatch()

  const [isLoading, setIsLoading] = useState(false)
  const [paginationModel, setPaginationModel] = useState({page: 0, pageSize: 0})
  const [rows, setRows] = useState<FileRow[]>([])
  const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>([])
  const [checkedList, setCheckedList] = useState<Set<string>>(new Set<string>())
  const [uploadSelection, setUploadSelection] = useState(false)
  const [selectedFileToPreview, setSelectedFileToPreview] = useState<FileRow | undefined>(undefined)

  const stageState = useStageState()
  // const studyData = useStudyData()

  const handleSelectCell = (file: FileRow) => {
    setSelectedFileToPreview(file)
  }

  const handlePaginationModelChange = async (model: GridPaginationModel) => {
    if((model.page !== paginationModel.page || model.pageSize !== paginationModel.pageSize) &&
      !isLoadingParent && !isLoading) {
      setIsLoading(true)
      await dispatch(loadFilePage({ page: model.page, size: model.pageSize }))
      setIsLoading(false)
      setPaginationModel(model)
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

  const handleRefresh = async () => {
    setUploadSelection(false)
    if(!isLoadingParent && !isLoading) {
      setIsLoading(true)
      await dispatch(loadFilePage({ page: paginationModel.page, size: paginationModel.pageSize }))
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const fileRows: FileRow[] =
      stageState.files.map((info, index) => ({
        ...info,
        id: index,
        size: info.size
      }))
    setRows(fileRows)
    setSelectedFileToPreview(undefined)
  }, [stageState.studyData, stageState.files])

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'File Name',
      flex: 4,
      renderHeader: (props) => RenderFileNameHeader(props),
      renderCell: (props) => RenderFileName(props, handleSelectCell)
    },
    { field: 'type', headerName: 'Type', flex: 1,
      renderCell: (props) => RenderType(props)
    },
    { field: 'size', headerName: 'Size', flex: 1 },
    { field: 'createdAt', headerName: 'Created', flex: 1.5 },
    {
      field: 'download',
      headerName: '',
      flex: .5,
      renderCell: (props) => RenderDownload(studyId, props)
    }
  ]

  const dialogProps = {
    slotProps: { backdrop: { sx: { backgroundColor: 'rgba(0, 0, 0, .2)' } }},
    PaperProps: { style: {  backgroundColor: 'rgba(255, 255, 255, .9)' }}
  }

  return <>
    <DataGrid
      data-testid="study-data-file-grid"
      disableRowSelectionOnClick
      disableColumnSelector
      checkboxSelection
      // isRowSelectable={() => false} // will be supported
      loading={isLoading}
      columns={columns}
      rows={rows}
      rowCount={stageState.totalFiles}
      localeText={{
        noRowsLabel: "No Study Data File",
        footerRowSelected: () => `${checkedList.size} selected file${checkedList.size > 1 && "s"}`
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
    <FileBottomContainer>
      <ButtonContainer>
        <UploadButton
          disabled={ stageState.studyData === undefined }
          onClickUpload={() => setUploadSelection(true)}
        />
        {studyId && <DownloadButton
          studyId={studyId}
          disabled={!checkedList || checkedList.size <= 0}
          filePaths={
            Array.from(checkedList.values())
              .map(name => rows.find(r => r.name === name)?.path)
              .filter((e): e is string => e !== undefined)
          }
        />}
      </ButtonContainer>
    </FileBottomContainer>
    <Dialog
      open={uploadSelection}
      maxWidth={false}
      {...dialogProps}
    >
      {studyId && uploadSelection && stageState.studyData && <UploadFileSelector
        studyData={{...stageState.studyData}}
        onClose={handleRefresh}
      />}
    </Dialog>
    <Dialog
      data-testid="preview-dialog"
      open={!!selectedFileToPreview}
      onClose={() => setSelectedFileToPreview(undefined)}
      maxWidth={false}
      slotProps={{ backdrop: { sx: { backgroundColor: 'rgba(0, 0, 0, .2)' } }}}
      PaperProps={{ style: {  backgroundColor: 'rgba(255, 255, 255, .9)' }}}
    >
      {selectedFileToPreview &&
        <StudyDataFilePreviewer
          type={selectedFileToPreview.type}
          name={selectedFileToPreview.name}
          data={selectedFileToPreview.preview}
          width="50vw"
          height="70vh"
        />
      }
    </Dialog>
  </>
}

export default StudyDataFile
