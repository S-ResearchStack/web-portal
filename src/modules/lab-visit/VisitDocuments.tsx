import React, { cloneElement, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import styled, { css, useTheme } from 'styled-components';
import { v4 as uuid } from 'uuid';
import _uniqueId from 'lodash/uniqueId';
import { DndProvider, DropTargetMonitor, useDrop } from 'react-dnd';
import { HTML5Backend, NativeTypes } from 'react-dnd-html5-backend';
import useAsyncFn from 'react-use/lib/useAsyncFn';

import { animation, colors, px, typography } from 'src/styles';
import { InputFieldShell } from 'src/common/components/InputField';
import { humanFileSize } from 'src/common/utils/file';
import UploadIcon from 'src/assets/icons/upload.svg';
import FileImage from 'src/assets/illustrations/copy-state.svg';
import RemoveIcon from 'src/assets/icons/trash_can.svg';
import UploadSuccessIcon from 'src/assets/icons/upload_success.svg';
import PlusIcon from 'src/assets/icons/plus.svg';
import DropAreaBg from 'src/assets/service/drop_area.svg?url';
import ErrorIcon from 'src/assets/icons/error.svg';
import { withCustomScrollBar } from 'src/common/components/CustomScrollbar';
import Spinner from 'src/common/components/Spinner';
import { useShowSnackbar } from 'src/modules/snackbar';
import {
  ObjectInfo,
  uploadObject,
} from 'src/modules/object-storage/utils';
import { useSelectedStudyId } from 'src/modules/studies/studies.slice';
import { useUploadObject } from 'src/modules/object-storage/objectStorage.slice';

import { MAX_ALL_DOCUMENTS_COUNT, MAX_ALL_DOCUMENTS_SIZE, MAX_DOCUMENT_SIZE } from './labVisit.slice';
import RemoveDocumentModal from './RemoveDocumentModal';
import {
  acceptMimeTypes,
  calcFilesSize,
  checkFileExistOrThrowError,
  cleanFileList,
  getFilenameInfo,
  useFirstMount,
  useScrollToBottomWhenArrayLengthChange,
} from './utils';

const VisitDocumentsContainer = styled.div`
  grid-area: documents;
`;

const DropAreaCaption = styled.div<{ error?: boolean }>`
  text-align: right;
  color: ${(p) => (p.error ? colors.statusErrorText : 'inherit')};
`;

const DropAreaContainer = styled.div<{ cursorPointer?: boolean; active: boolean }>`
  display: flex;
  box-sizing: border-box;
  border: ${px(1)} solid ${colors.primary10};
  border-radius: ${px(4)};
  height: ${px(254)};
  transition: background-color 300ms ${animation.defaultTiming};
  cursor: ${(p) => (p.cursorPointer ? 'pointer' : 'auto')};
  position: relative;
  ${(p) =>
    p.active &&
    css`
      border: none;
      padding: ${px(1)};
      background-color: ${colors.primary05};
      &:before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 1;
        border-radius: ${px(4)};
        background-image: url(${DropAreaBg});
        pointer-events: none;
      }
    `}
`;

const TransparentFileInput = styled.input`
  display: none;
`;

const DropAreaEmptyContainer = styled.div<{ gap?: number }>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  width: 100%;
  height: 100%;
  gap: ${(p) => (p.gap ? px(p.gap) : 0)};
`;

const DropAreaEmptyMessage = styled.div`
  ${typography.bodyXSmallRegular};
  color: ${colors.textSecondaryGray};
`;

const FileListContainer = withCustomScrollBar(styled.div<{ overflowHidden?: boolean }>`
  display: grid;
  grid-template-columns: repeat(5, ${px(72)});
  row-gap: ${px(8)};
  column-gap: ${px(24)};
  width: 100%;
  height: 100%;
  overflow: ${(p) => (p.overflowHidden ? 'hidden' : 'auto')};
  padding: ${px(16)};
`)``;

const FileItemContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${px(8)};
  position: relative;
  z-index: 0;
`;

const FileItemPreviewOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  opacity: 0;
  border-radius: ${px(4)};
  border: ${px(1)} solid ${colors.primary};
  overflow: hidden;
  &:before {
    content: '';
    display: block;
    width: 100%;
    height: 100%;
    background-color: ${colors.primary10};
    opacity: 0.8;
  }
`;

const buttonResetCss = css`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  background: transparent;
  border: none;
  cursor: pointer;
  &:focus {
    outline: 0;
  }
`;

const FileItemAction = styled.button`
  ${buttonResetCss};
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  opacity: 0;
  border-radius: ${px(4)};
`;

const RemoveIconStyled = styled(RemoveIcon)`
  margin-top: ${px(15)};
  fill: ${colors.primary};
`;

const FileItemPreviewBase = styled.div`
  width: ${px(72)};
  height: ${px(72)};
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ErrorIconStyled = styled(ErrorIcon)<{ marginTop?: number }>`
  fill: ${colors.statusError};
  margin-top: ${(p) => px(p.marginTop ?? 16)};
`;

const FileItemRetry = styled.div`
  ${buttonResetCss};
  ${typography.labelSemibold};
  color: ${colors.statusErrorText};
  letter-spacing: 0.03em;
  text-transform: uppercase;
  margin-top: ${px(2)};
`;

const FileItemPreview = styled(FileItemPreviewBase)<{ show?: boolean; danger?: boolean }>`
  background-color: ${colors.background};
  border-radius: ${px(4)};
  &:hover {
    ${FileItemPreviewOverlay} {
      opacity: 1;
    }
    ${FileItemAction} {
      opacity: 1;
    }
  }
  ${(p) =>
    p.show &&
    css`
      ${FileItemPreviewOverlay} {
        opacity: 1;
      }
      ${FileItemAction} {
        opacity: 1;
      }
    `}
  ${(p) =>
    p.danger &&
    css`
      ${FileItemPreviewOverlay} {
        border-color: ${colors.statusError10};
        &:before {
          background-color: ${colors.statusError10};
          opacity: 1;
        }
      }
      ${FileItemRetry} {
        opacity: 0;
      }
      &:hover {
        ${FileItemPreviewOverlay} {
          border-color: ${colors.statusErrorText};
        }
        ${FileItemRetry} {
          opacity: 1;
        }
      }
    `}
`;

const FileImageStyled = styled(FileImage)`
  width: ${px(56)};
  height: ${px(56)};
`;

const FileItemName = styled.div`
  ${typography.bodyXSmallRegular};
  color: ${colors.textPrimary};
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  text-align: center;
`;

export const UPLOAD_SUCCESS_DELAY = 2 * 1000;

type FileItemToRemove = {
  item: DocumentEntry;
};

type FileItemProps = {
  item: DocumentEntry;
  onFileUploaded?: (item: DocumentEntry) => void;
  onRequestRemove: (params: FileItemToRemove) => void;
};

const FileItem = React.memo(({ item, onFileUploaded, onRequestRemove }: FileItemProps) => {
  const uploader = useUploadObject();

  const [isLoading, setLoading] = useState(uploader.isSending);
  const [isLoaded, setLoaded] = useState(false);

  const upload = useCallback(() => {
    if (!item.file) {
      return;
    }

    uploader.upload({ path: item.name, file: item.file });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.file]);

  useEffect(() => {
    if (isLoaded && !uploader.error) {
      onFileUploaded?.(item);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, uploader.error]);

  useEffect(() => {
    let timer: number;
    if (isLoading && !uploader.isSending && !uploader.error) {
      setLoaded(true);
      timer = window.setTimeout(() => {
        setLoading(false);
        setLoaded(false);
      }, UPLOAD_SUCCESS_DELAY);
    } else {
      setLoading(uploader.isSending);
    }
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, uploader.isSending]);

  const handleRemove = useCallback(() => {
    onRequestRemove({ item });
  }, [onRequestRemove, item]);

  const fileName = useMemo(() => getFilenameInfo(item.name).fullName, [item.name]);

  return (
    <FileItemContainer data-testid="visit-documents-item">
      <FileItemPreview
        show={uploader.isSending || isLoaded || !!uploader.error}
        danger={!uploader.isSending && !!uploader.error}
      >
        <FileImageStyled />
        <FileItemPreviewOverlay />
        {(() => {
          if (uploader.isSending || isLoaded) {
            return (
              <FileItemAction>{isLoaded ? <UploadSuccessIcon /> : <Spinner />}</FileItemAction>
            );
          }

          if (!uploader.isSending && uploader.error) {
            return (
              <FileItemAction onClick={upload}>
                <ErrorIconStyled />
                <FileItemRetry>Retry</FileItemRetry>
              </FileItemAction>
            );
          }

          return (
            <FileItemAction onClick={handleRemove}>
              <RemoveIconStyled />
            </FileItemAction>
          );
        })()}
      </FileItemPreview>
      <FileItemName>{fileName}</FileItemName>
    </FileItemContainer>
  );
});

const AddFileItemPreview = styled(FileItemPreviewBase)`
  ${FileItemAction} {
    opacity: 1;
    &:hover {
      background-color: ${colors.primary10};
    }
  }
`;

const PlusIconStyled = styled(PlusIcon)`
  fill: ${colors.primary};
`;

const AddFileItem = React.memo(
  ({ onAdd }: { onAdd: React.DOMAttributes<HTMLElement>['onClick'] }) => (
    <FileItemContainer>
      <AddFileItemPreview>
        <FileItemAction onClick={onAdd}>
          <PlusIconStyled />
        </FileItemAction>
      </AddFileItemPreview>
    </FileItemContainer>
  )
);

const DropAreaEmpty = () => (
  <DropAreaEmptyContainer>
    <UploadIcon />
    <DropAreaEmptyMessage>Drag & Drop up to 10 files here</DropAreaEmptyMessage>
  </DropAreaEmptyContainer>
);

const DropAreaLoading = () => (
  <DropAreaEmptyContainer gap={4}>
    <Spinner />
    <DropAreaEmptyMessage>Loading content...</DropAreaEmptyMessage>
  </DropAreaEmptyContainer>
);

const DropAreaError = ({ onReload }: { onReload: () => void }) => (
  <DropAreaEmptyContainer gap={4}>
    <ErrorIconStyled marginTop={0} />
    <FileItemRetry as="button" onClick={onReload}>
      Retry
    </FileItemRetry>
  </DropAreaEmptyContainer>
);

type DropAreaProps<T> = {
  data: T[];
  renderItem: (item: T) => React.ReactElement;
  renderEmpty: () => React.ReactElement;
  renderAdd: ({ add }: { add: () => void }) => React.ReactElement;
  keyExtractor: (item: T) => React.Key;
  onFiles: (files: File[]) => void;
  loading: boolean;
  renderLoading: () => React.ReactElement;
  error?: boolean;
  renderError: () => React.ReactElement;
};

const DropArea = <T extends Record<string, unknown>>({
  onFiles,
  data,
  renderItem,
  renderEmpty,
  renderAdd,
  keyExtractor,
  loading,
  renderLoading,
  error,
  renderError,
}: DropAreaProps<T>) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileInputKey, setFileInputKey] = useState<React.Key>(_uniqueId);
  const fileListRef = useScrollToBottomWhenArrayLengthChange<HTMLDivElement>();
  const theme = useTheme();
  const openFilesDialog = useCallback(() => fileInputRef.current?.showPicker(), []);

  const [{ canDrop, isOver }, drop] = useDrop(
    () => ({
      accept: [NativeTypes.FILE],
      drop(item: { files: File[] }) {
        onFiles(cleanFileList(item.files));
      },
      collect: (monitor: DropTargetMonitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }),
    [onFiles]
  );

  const isActive = canDrop && isOver;
  const inputAcceptTypes = useMemo(() => acceptMimeTypes.join(','), []);

  const content = () => {
    if (loading) {
      return renderLoading();
    }

    if (error) {
      return renderError();
    }

    if (!data.length) {
      return renderEmpty();
    }

    return (
      <FileListContainer
        ref={fileListRef}
        overflowHidden={isActive}
        scrollbarTrackColor={theme.colors.backgroundSurface}
      >
        {data.map((i) => cloneElement(renderItem(i), { key: keyExtractor(i) }))}
        {data.length < MAX_ALL_DOCUMENTS_COUNT ? renderAdd({ add: openFilesDialog }) : ""}
      </FileListContainer>
    );
  };

  const isEnabledCursorPointer = !data.length && !loading && !error;

  return (
    <>
      <DropAreaContainer
        data-testid="visit-documents-drop-area"
        ref={drop}
        active={isActive}
        cursorPointer={isEnabledCursorPointer}
        onClick={isEnabledCursorPointer ? openFilesDialog : undefined}
      >
        {content()}
      </DropAreaContainer>
      <TransparentFileInput
        data-testid="visit-documents-files-input"
        key={fileInputKey} // reset value
        ref={fileInputRef}
        type="file"
        multiple
        accept={inputAcceptTypes}
        onChange={(evt) => {
          if (evt.target.files?.length) {
            onFiles(cleanFileList(Array.from(evt.target.files)));
            setFileInputKey(_uniqueId());
          }
        }}
      />
    </>
  );
};

type VisitDocumentsProps = {
  filePaths?: string[];
  onChange: (filePaths: string[]) => void;
  onValidateChange: (status: boolean) => void;
  onUploadingStatusChange: (status: boolean) => void;
  setAfterSent: (params: { cb: ((filePaths: string[]) => Promise<void>) | undefined }) => void;
};

type DocumentEntry = ObjectInfo & {
  id: string;
  file?: File;
  isNew?: boolean;
  isUploading?: boolean;
  isDeleting?: boolean;
  hasError?: boolean;
};

type DocumentsList = DocumentEntry[];

export const VisitDocuments = ({
  filePaths,
  onChange,
  onValidateChange,
  onUploadingStatusChange,
  setAfterSent,
}: VisitDocumentsProps) => {
  const studyId = useSelectedStudyId();

  const [documents, setDocuments] = useState<DocumentsList>([]);

  useEffect(() => {
    const updateAfterSentCb = () => {
      if (!documents.length || !studyId) {
        setAfterSent({ cb: undefined });
        return;
      }

      const documentsToRemove = documents.filter((d) => d.isDeleting);
      const documentsToUpload = documents.filter((d) => d.isNew);

      if (!documentsToRemove.length && !documentsToUpload.length) {
        setAfterSent({ cb: undefined });
        return;
      }

      const cb = async (filePaths: string[]) => {
        let docs = [...documents];

        const documentsOperationsQueue: Array<() => Promise<boolean>> = [
          ...documentsToUpload.map((d) => async () => {
            try {
              checkFileExistOrThrowError(d.file);

              await uploadObject({
                studyId,
                name: d.name,
                blob: d.file,
              });

              docs = docs.map((f) =>
                f.id === d.id
                  ? {
                      ...f,
                      isNew: undefined,
                      isUploading: undefined,
                      hasError: undefined,
                    }
                  : f
              );
              return true;
            } catch {
              docs = docs.map((f) =>
                f.id === d.id
                  ? {
                      ...f,
                      hasError: true,
                    }
                  : f
              );
              return false;
            }
          }),
        ];

        const res = await Promise.all(documentsOperationsQueue.map((o) => o()));

        setDocuments(docs);

        if (!res.every((d) => d)) {
          throw new Error('Some file operations failed');
        }
      };

      setAfterSent({ cb });
    };

    updateAfterSentCb();
  }, [setAfterSent, documents, studyId]);

  const [rawFilesList, fetchFilesList] = useAsyncFn(async () => {
    if (!studyId || !filePaths || documents.length) {
      return;
    }

    const list = filePaths.map((objectName) => {
      return {
        name: objectName,
        sizeBytes: 0
      } as ObjectInfo    
    });
    setDocuments(list.map((i) => ({ ...i, id: uuid() })));
  }, [filePaths, studyId, documents]);

  useFirstMount(() => {
    fetchFilesList();
  }, []);

  const maxFileSize = useMemo(() => humanFileSize(MAX_ALL_DOCUMENTS_SIZE), []);
  const [fileToDelete, setFileToDelete] = useState<FileItemToRemove | undefined>();
  const showSnackbar = useShowSnackbar();

  const handleReceiveFiles = useCallback(
    (newFiles: File[]) => {
      const docs = [...documents];
      if (docs.length + newFiles.length > MAX_ALL_DOCUMENTS_COUNT) {
        showSnackbar({
          id: 'lab-visit-documents-file-count',
          text: `Upload failed. Number of files must be less than ${(MAX_ALL_DOCUMENTS_COUNT)}`,
          showErrorIcon: true,
          showCloseIcon: true,
        });
      } else {
      newFiles
        .filter((f) => {
          if (f.size > MAX_DOCUMENT_SIZE) {
            showSnackbar({
              id: 'lab-visit-documents-file-size',
              text: `Upload failed. Files must be less than ${humanFileSize(MAX_DOCUMENT_SIZE)}`,
              showErrorIcon: true,
              showCloseIcon: true,
            });
            return false;
          }
          return true;
        })
        .forEach((f) => {
          const fileNameInfo = getFilenameInfo(f.name);

          let pickedName = fileNameInfo.name;
          let isUniqueName = false;
          let nameIntersections = 0;

          do {
            // eslint-disable-next-line @typescript-eslint/no-loop-func
            isUniqueName = !docs.find((fi) => getFilenameInfo(fi.name).name === pickedName);
            if (!isUniqueName) {
              nameIntersections += 1;
              pickedName = `${fileNameInfo.name} (${nameIntersections})`;
            }
          } while (!isUniqueName);

          docs.push({
            id: uuid(),
            name: `${pickedName}.${fileNameInfo.extension}`,
            sizeBytes: f.size,
            file: f,
            isNew: true,
          });
        });

      setDocuments(docs);
      filePaths = docs.map((d) => d.name);
      onChange(filePaths);
    }},
    [documents, showSnackbar, onChange]
  );

  const confirmRemove = useCallback(() => {
    const documentsAfterDelete = documents.map((i) => {
      if (i.name === fileToDelete?.item.name) {
        return i.isNew ? undefined : { ...i, isDeleting: true };
      }
      return i;
    }).filter(Boolean) as DocumentsList
    setDocuments(documentsAfterDelete);
    filePaths = documentsAfterDelete.map((d) => d.name);
    onChange(filePaths);
    setFileToDelete(undefined);
  }, [documents, fileToDelete, onChange]);

  const handleFileUploaded = useCallback(
    (item: DocumentEntry) => {
      const list = documents.map((i) =>
        i.id === item.id ? { ...item, file: undefined, isUploading: undefined } : i
      );
      setDocuments(list);
    },
    [documents]
  );

  const [isValid, setValid] = useState(false);

  const validate = useCallback(
    () => !documents.length || calcFilesSize(documents) <= MAX_ALL_DOCUMENTS_SIZE,
    [documents]
  );

  useEffect(() => {
    const v = validate();
    onValidateChange(v);
    setValid(v);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validate]);

  const isUploading = useMemo(() => documents.some((i) => i.isUploading), [documents]);

  useEffect(() => {
    onUploadingStatusChange(isUploading);
  }, [isUploading, onUploadingStatusChange]);

  const caption = () => {
    if (rawFilesList.error) {
      return 'A server error has occurred while loading content. Please try again.';
    }

    if (!isValid) {
      return `You've reached the maximum file size of ${maxFileSize}`;
    }

    return `Upload either XLM, CSV, PNG, JPG, PDF, or TXT file types (${maxFileSize} max)`;
  };

  const computedDocuments = useMemo(() => documents.filter((d) => !d.isDeleting), [documents]);

  return (
    <>
      <DndProvider backend={HTML5Backend}>
        <VisitDocumentsContainer data-testid="visit-documents">
          <InputFieldShell
            label="Upload documents"
            fixedHeight={false}
            caption={
              <DropAreaCaption error={!isValid || !!rawFilesList.error}>
                {caption()}
              </DropAreaCaption>
            }
          >
            <DropArea
              data={computedDocuments}
              onFiles={handleReceiveFiles}
              keyExtractor={(i) => i.id}
              renderAdd={({ add }) => <AddFileItem onAdd={add} />}
              renderEmpty={() => <DropAreaEmpty />}
              loading={rawFilesList.loading}
              error={!!rawFilesList.error}
              renderLoading={() => <DropAreaLoading />}
              renderError={() => <DropAreaError onReload={fetchFilesList} />}
              renderItem={(item) => (
                <FileItem
                  item={item}
                  onRequestRemove={setFileToDelete}
                  onFileUploaded={handleFileUploaded}
                />
              )}
            />
          </InputFieldShell>
        </VisitDocumentsContainer>
      </DndProvider>
      <RemoveDocumentModal
        data={fileToDelete?.item}
        onRequestClose={() => setFileToDelete(undefined)}
        onAccept={confirmRemove}
      />
    </>
  );
};
