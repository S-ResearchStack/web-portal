import React, { ChangeEvent, useCallback, useState } from 'react';

import styled, { css } from 'styled-components';
import _uniqueId from 'lodash/uniqueId';

import { animation, colors, px } from 'src/styles';
import SkeletonLoading, { SkeletonRect } from 'src/common/components/SkeletonLoading';
import Spinner from 'src/common/components/Spinner';
import PlusIcon from 'src/assets/icons/plus.svg';

const OptionFileInputBackdrop = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  border: ${px(1)} solid ${colors.primary};
  border-radius: ${px(4)};
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:before {
    content: '';
    width: 100%;
    height: 100%;
    position: absolute;
    background-color: ${colors.primary10};
    opacity: 0.8;
  }
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Processing = styled(Overlay)`
  cursor: pointer;
`;

export const OptionImage = styled.label<{
  src?: string;
  asAddButton?: boolean;
  isSending?: boolean;
  width: number;
  height: number;
  error?: boolean;
  disabled?: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin: 0;
  background-image: ${(p) => (p.src ? `url(${p.src})` : 'none')};
  background-size: cover;
  background-position: center;
  width: ${(p) => px(p.width)};
  height: ${(p) => px(p.height)};
  border-radius: ${px(4)};
  overflow: hidden;
  position: relative;
  background-color: ${(p) => (p.asAddButton ? colors.disabled20 : colors.background)};
  ${(p) =>
    p.error &&
    css`
      background-color: ${colors.statusError10};
    `};

  ${OptionFileInputBackdrop} {
    opacity: ${(p) => (p.isSending || p.error ? 1 : 0)};
    transition: opacity 300ms ${animation.defaultTiming};

    ${(p) =>
      p.error &&
      css`
        border-color: ${colors.statusError10};
        &:before {
          background-color: ${colors.statusError10};
        }
      `}
  }

  ${Processing} svg {
    opacity: ${(p) => (p.isSending || !p.src ? 1 : 0)};
    fill: ${(p) => (p.asAddButton ? colors.onDisabled : colors.primary)};
    position: relative;
    z-index: 1;
    pointer-events: none;

    ${(p) =>
      p.error &&
      css`
        fill: ${colors.statusErrorText} !important;
      `}
  }

  &:hover {
    ${OptionFileInputBackdrop} {
      opacity: ${(p) => (!p.disabled ? 1 : 0)};
    }

    ${Processing} svg {
      opacity: ${(p) => (!p.disabled ? 1 : 0)};
      fill: ${colors.primary};
    }
  }
`;

const OptionFileInput = styled.input`
  display: none;
`;

type FilePickerProps = {
  loading?: boolean;
  poster?: string;
  asAddButton?: boolean;
  isProcessing?: boolean;
  width: number;
  height: number;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  accept: string;
  error?: boolean;
  overlay?: JSX.Element;
  disableInput?: boolean;
};

const FilePicker = ({
  loading,
  poster,
  asAddButton,
  isProcessing,
  overlay,
  width,
  height,
  onChange,
  accept,
  error,
  disableInput,
}: FilePickerProps) => {
  const [fileInputKey, setFileInputKey] = useState<React.Key>(_uniqueId);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (!error && !loading) {
        onChange(e);
        setFileInputKey(_uniqueId());
      }
    },
    [error, loading, onChange, setFileInputKey]
  );

  return loading ? (
    <SkeletonLoading>
      <SkeletonRect x={0} y={0} rx="4" width={width} height={height} />
    </SkeletonLoading>
  ) : (
    <OptionImage
      src={poster}
      asAddButton={asAddButton}
      isSending={isProcessing}
      width={width}
      height={height}
      error={error}
      data-testid="label-image"
      disabled={disableInput}
    >
      {!isProcessing && overlay && <Overlay>{overlay}</Overlay>}
      <OptionFileInputBackdrop data-testid="backdrop" />
      <Processing>{isProcessing ? <Spinner size="xs" /> : <PlusIcon />}</Processing>
      {!error && !isProcessing && (
        <OptionFileInput
          key={fileInputKey} // reset value
          type="file"
          accept={accept}
          onChange={handleChange}
          data-testid="file-input"
          disabled={disableInput}
        />
      )}
    </OptionImage>
  );
};

export default FilePicker;
