import React, { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import useAsync from 'react-use/lib/useAsync';

import styled from 'styled-components';

import { useFileUpload } from 'src/modules/file-upload/fileUpload.slice';
import { colors, px, typography } from 'src/styles';
import Tooltip from 'src/common/components/Tooltip';
import InfoIcon from 'src/assets/icons/info.svg';
import { EducationalContentType } from 'src/modules/api';
import useShowSnackbar from 'src/modules/snackbar/useShowSnackbar';
import { humanFileSize } from 'src/common/utils/file';
import SkeletonLoading, { SkeletonRect } from 'src/common/components/SkeletonLoading';
import PlayIcon from 'src/assets/education/play.svg';
import FilePicker, { OptionImage } from '../../common/FilePicker';
import { getPdfPoster, getVideoPoster } from './utils';

const ATTACHMENT_UPLOAD_KEY = 'attachment-upload-key';
const UPLOAD_LOADER_DELAY = 2_000;
const DEFAULT_COVER_WIDTH = 248;
const DEFAULT_COVER_HEIGHT = 160;
const MAX_FILE_SIZE_MB = 100;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: ${px(16)};
  position: relative;

  ${OptionImage} {
    background-color: ${colors.onPrimary};
  }
`;

const FilePickerLabel = styled.div`
  ${typography.bodySmallSemibold};
  color: ${colors.textPrimary};
  display: flex;
  align-items: center;
`;

const InfoIconStyled = styled(InfoIcon)`
  margin-top: ${px(3)};
  margin-left: ${px(8)};
  display: block;
  width: ${px(16)};
  height: ${px(16)};
`;

const LoadingContainer = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  z-index: 2;
`;

const Loading = () => (
  <LoadingContainer data-testid="loading">
    <SkeletonLoading>
      <SkeletonRect x={0} y={4} width={120} height={12} />
      <SkeletonRect x={0} y={37} width={248} height={160} />
    </SkeletonLoading>
  </LoadingContainer>
);

type AttachmentConfig = {
  label: string;
  tooltip: string;
  dimensions: [number, number];
  maxSize: number;
  mime: string;
  required: boolean;
};

const getConfigByAttachmentType = (type: EducationalContentType): AttachmentConfig | undefined =>
  ({
    SCRATCH: {
      label: 'Cover image',
      tooltip: `Optionally, upload a PNG, JPG, or SVG file of up ${humanFileSize(
        MAX_FILE_SIZE_BYTES
      )}s.`,
      dimensions: [248, 160],
      maxSize: MAX_FILE_SIZE_MB,
      mime: 'image/*',
      required: false,
    },
    PDF: {
      label: 'PDF',
      tooltip: `Upload a PDF of up ${humanFileSize(MAX_FILE_SIZE_BYTES)}s.`,
      dimensions: [160, 248],
      maxSize: MAX_FILE_SIZE_MB,
      mime: 'application/pdf',
      required: true,
    },
    VIDEO: {
      label: 'Video',
      tooltip: `Upload a MOV, MP4, or AVI file of up ${humanFileSize(MAX_FILE_SIZE_BYTES)}s.`,
      dimensions: [248, 160],
      maxSize: MAX_FILE_SIZE_MB,
      mime: 'video/mp4;video/quicktime;video/x-msvideo',
      required: true,
    },
  }[type] as AttachmentConfig);

const VideoOverlayContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.4);
  width: 100%;
  height: 100%;
`;

export const VideoOverlay = () => (
  <VideoOverlayContainer>
    <PlayIcon />
  </VideoOverlayContainer>
);

export type EducationAttachmentProps = {
  type: EducationalContentType;
  loading?: boolean;
  attachment?: string;
  onChange: (attachment: string) => void;
  error?: boolean;
  disableInput?: boolean;
};

const EducationAttachment = ({
  type,
  loading,
  attachment,
  onChange,
  error,
  disableInput,
}: EducationAttachmentProps) => {
  const showSnackbar = useShowSnackbar();

  const {
    isSending,
    upload,
    error: fileError,
    data: file,
  } = useFileUpload({ key: ATTACHMENT_UPLOAD_KEY });
  const [isProcessing, setProcessing] = useState(!!isSending);

  const config = useMemo(() => getConfigByAttachmentType(type), [type]);

  const [outgoingFile, setOutgoingFile] = useState<File | null>(null);

  const handleFileChanged = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const currentFile = e.target.files[0];

        if (currentFile.size > MAX_FILE_SIZE_BYTES) {
          showSnackbar({
            text: `Upload failed. Images must be less than ${MAX_FILE_SIZE_MB}MB`,
            showErrorIcon: true,
            showCloseIcon: true,
          });

          return;
        }

        setOutgoingFile(currentFile);
      }
    },
    [showSnackbar]
  );

  const uploadFile = useCallback(async () => {
    if (outgoingFile instanceof File) {
      await upload(outgoingFile);
      setOutgoingFile(null);
    }
  }, [outgoingFile, upload]);

  useEffect(() => {
    if (fileError) {
      showSnackbar({
        text: 'A server error has occurred while uploading the file. Please try again.',
        showErrorIcon: true,
        showCloseIcon: true,
        actionLabel: 'Retry',
        onAction: uploadFile,
      });
    }
  }, [uploadFile, fileError, showSnackbar]);

  useEffect(() => {
    uploadFile();
  }, [uploadFile]);

  useEffect(() => {
    if (file?.url) {
      onChange(file.url);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  useEffect(() => {
    if (!isSending) {
      setProcessing(false);
      return () => {};
    }

    const timer = setTimeout(() => setProcessing(true), UPLOAD_LOADER_DELAY);
    // eslint-disable-next-line consistent-return
    return () => clearTimeout(timer);
  }, [isSending]);

  const poster = useAsync(async () => {
    if (!attachment) {
      return undefined;
    }

    switch (type) {
      case EducationalContentType.PDF:
        return getPdfPoster(attachment);
      case EducationalContentType.VIDEO:
        return getVideoPoster(attachment);
      case EducationalContentType.SCRATCH:
        return attachment;
      default:
        return undefined;
    }
  }, [attachment, type]);

  return (
    <Container data-testid={`education-attachment-${type}`}>
      {loading && <Loading />}
      <FilePickerLabel>
        {config?.label ?? '\u00A0'}
        {config?.tooltip && !loading && (
          <Tooltip content={config.tooltip} position="r" trigger="hover" arrow>
            <InfoIconStyled />
          </Tooltip>
        )}
      </FilePickerLabel>
      <FilePicker
        loading={loading}
        poster={poster.value}
        overlay={type === 'VIDEO' && poster.value ? <VideoOverlay /> : undefined}
        isProcessing={isProcessing || poster.loading}
        width={config?.dimensions[0] ?? DEFAULT_COVER_WIDTH}
        height={config?.dimensions[1] ?? DEFAULT_COVER_HEIGHT}
        onChange={handleFileChanged}
        accept={config?.mime ?? ''}
        error={error}
        disableInput={disableInput}
      />
    </Container>
  );
};

export default EducationAttachment;
