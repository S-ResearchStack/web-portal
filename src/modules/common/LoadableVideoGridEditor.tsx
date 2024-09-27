import React, { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import usePrevious from 'react-use/lib/usePrevious';
import useUpdateEffect from 'react-use/lib/useUpdateEffect';
import useDebounce from 'react-use/lib/useDebounce';
import {
  calculateLines,
  createHiddenCloneOfElement,
} from 'src/modules/common/utils';
import { Duration } from 'luxon';

import styled, { css } from 'styled-components';
import { XYCoord } from 'dnd-core';

import { colors, px } from 'src/styles';
import Button from 'src/common/components/Button';
import CloseIcon from 'src/assets/icons/close.svg';
import DragTriggerIcon from 'src/assets/icons/drag_trigger.svg';
import useShowSnackbar from 'src/modules/snackbar/useShowSnackbar';
import isDev from 'src/common/utils/dev';
import { useMatchDeviceScreen } from 'src/common/components/SimpleGrid';
import { LOCAL_STATE_DELAY } from 'src/common/withLocalDebouncedState';
import { useUploadObject } from 'src/modules/object-storage/objectStorage.slice';

import TextArea, { TextAreaProps } from 'src/common/components/TextArea';
import DraggableGrid, { DraggableItemRenderer, DraggableItemRendererProps } from './DraggableGrid';
import FilePicker from './FilePicker';
import usePreloadImages from 'src/common/hooks/usePreloadImages';
import { BlockContentType } from 'src/modules/api';
import { getVideoPoster } from '../education-management/education-editor/utils';
import { useAsync } from 'react-use';
import { VideoOverlay } from '../education-management/education-editor/EducationAttachment';

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${px(4)};
  align-items: stretch;
`;

const OPTION_IMAGE_WIDTH = 150;
const OPTION_IMAGE_HEIGHT = 144;

interface LabelTextareaProps extends TextAreaProps {
  muted?: boolean;
}

const LabelTextarea = styled(TextArea)<LabelTextareaProps>`
  height: ${px(42)};
  overflow: hidden;
  width: ${px(150)};
  color: ${colors.textPrimary};
  &::placeholder {
    color: ${colors.textPrimary};
  }
  ${(p) =>
    p.muted &&
    css`
      &::placeholder {
        color: ${colors.onDisabled};
      }
    `}
`;

const Actions = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${px(8)};
`;

interface OptionContainerProps {
  isDragging?: boolean;
  isPreview?: boolean;
  position: XYCoord;
  asAddButton: boolean;
}

const getOptionContainerStyles = ({
  isPreview,
  position,
}: OptionContainerProps): React.CSSProperties =>
  isPreview
    ? {
        opacity: 0.7,
        transform: `translate(${px(position.x)}, ${px(position.y)})`,
      }
    : {};

const ITEM_WIDTH = 182;

const OptionContainer = styled.div.attrs<OptionContainerProps>((props) => ({
  style: getOptionContainerStyles(props),
}))<OptionContainerProps>`
  
  display: flex;
  gap: ${px(8)};
  width: ${px(ITEM_WIDTH)};
  opacity: ${(p) => (p.isDragging ? 0 : 1)};

  ${(p) =>
    p.isPreview &&
    css`
      opacity: 0.7;
    `}};

  ${Actions} {
    opacity: ${(p) => (p.isPreview ? 1 : 0)};
  }

  &:hover ${Actions} {
    opacity: ${(p) => (p.asAddButton ? 0 : 1)};
  }
`;

type DraggableItemRendererPickedPropsForOptionProps =
  | 'item'
  | 'dragRef'
  | 'dropRef'
  | 'isDragging'
  | 'isPreview'
  | 'currentOffset';

type VideoCell = {
  id: string,
  type: BlockContentType,
  url: string,
  text: string,
  touched: boolean,
  sequence: number
};

interface OptionProps {
  data?: VideoCell[];
  onAdd?: () => void;
  position?: XYCoord;
  showLabels?: boolean;
  dnd?: Pick<DraggableItemRendererProps<VideoCell>, DraggableItemRendererPickedPropsForOptionProps>;
  onChange?: (data: VideoCell[]) => void;
  onRemove?: (item: VideoCell) => void;
  placeholder?: string;
  loading: boolean;
  limits: {
    min: number;
    max: number;
  };
  getUploadObjectPath: (file: File) => string;
}

const UPLOAD_LOADER_DELAY = 2000;
const MAX_LABEL_TEXT_LENGTH = 44;
const MAX_LABEL_ROWS_LENGTH = 2;
const MAX_FILE_SIZE_MB = 100
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const fitText = (element: HTMLElement, content: string, maxLines: number, maxLength: number) => {
  if (maxLines < 1 || maxLength < 1 || !content.length) {
    return '';
  }

  const node = createHiddenCloneOfElement(element);
  document.body.appendChild(node);

  let resultText = '';

  // WARNING: slow algorithm for long 'content'
  for (let i = 0; i < content.length; i += 1) {
    node.innerText = content.slice(0, maxLength - i);
    if (calculateLines(node) <= maxLines) {
      resultText = node.innerText;
      break;
    }
  }

  node.remove();

  return resultText;
};

const Option = ({
  data,
  onAdd,
  onRemove,
  dnd,
  position,
  onChange,
  showLabels,
  placeholder = 'Add label',
  loading,
  limits,
  getUploadObjectPath,
}: OptionProps) => {
  const showSnackbar = useShowSnackbar();

  const item = useMemo(
    () => (dnd?.item ? data?.find((i) => i.id === dnd.item.id) : undefined),
    [data, dnd?.item]
  );

  const isAddButton = !item?.touched;

  const { isSending, upload, error } = useUploadObject();
  const [isProcessing, setProcessing] = useState(isSending);
  const [caption, setCaption] = useState(item?.text);

  useUpdateEffect(() => {
    setCaption(item?.text);
  }, [item?.text]);

  const handleChange = useCallback(
    (answer: Partial<VideoCell>) => {
      data &&
        onChange?.(data.map((d) => (d.id === item?.id ? { ...d, ...answer, touched: true } : d)));
    },
    [data, item?.id, onChange]
  );

  useDebounce(
    () => {
      item?.touched &&
        handleChange({
          text: caption,
        });
    },
    LOCAL_STATE_DELAY,
    [caption]
  );

  const handleLabelFocus = useCallback(() => {
    handleChange({}); // mark as touched
  }, [handleChange]);

  const prevTouched = usePrevious(item?.touched);
  useEffect(() => {
    if (
      !isSending &&
      !error &&
      !item?.url &&
      item?.touched === true &&
      prevTouched !== undefined &&
      item?.touched !== prevTouched
    ) {
      onAdd?.();
    }
  }, [error, isSending, onAdd, item?.url, item?.touched, prevTouched]);

  const lastLabelSelection = useRef<number>();
  const labelRef = useRef<HTMLTextAreaElement>();

  const handleChangeLabel = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;

    // for caret restoration
    lastLabelSelection.current = e.target.selectionStart;
    labelRef.current = e.target;

    setCaption(fitText(e.target, value, MAX_LABEL_ROWS_LENGTH, MAX_LABEL_TEXT_LENGTH));
  }, []);

  // restore caret after value modified
  useEffect(() => {
    if (lastLabelSelection.current && labelRef.current) {
      labelRef.current?.setSelectionRange(lastLabelSelection.current, lastLabelSelection.current);
    }
  }, [caption]);

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
    [isAddButton, onAdd, showSnackbar]
  );

  const uploadFile = useCallback(async () => {
    if (outgoingFile instanceof File) {
      const image = URL.createObjectURL(outgoingFile);
      handleChange({ url: image });

      const res = await upload({
        path: image.split('/').pop() || '',
        file: outgoingFile,
      });
      if (res.err) {
        handleChange({}); // mark answer as touched
      }
      setOutgoingFile(null);
    }
  }, [outgoingFile, upload, getUploadObjectPath, handleChange]);

  useEffect(() => {
    uploadFile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outgoingFile]);

  useEffect(() => {
    if (!isSending) {
      setProcessing(false);
      return () => {};
    }

    const timer = setTimeout(() => setProcessing(true), UPLOAD_LOADER_DELAY);
    // eslint-disable-next-line consistent-return
    return () => clearTimeout(timer);
  }, [isSending]);

  useEffect(() => {
    if (error) {
      showSnackbar({
        text: 'A server error has occurred while uploading the image. Please try again.',
        showErrorIcon: true,
        showCloseIcon: true,
        actionLabel: 'Retry',
        onAction: uploadFile,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error, showSnackbar]);

  const isRemoveAllowed = ((data?.length || 0) > limits.min || !!item?.url) && onRemove;

  const poster = useAsync(async () => {
    if (!item?.url) {
      return undefined;
    }
    return getVideoPoster(item?.url);
  }, [item?.url]);
  return (
    <OptionContainer
      {...(item?.touched
        ? {
            ref: dnd?.dropRef as React.RefObject<HTMLDivElement>,
          }
        : {})}
      asAddButton={isAddButton}
      isDragging={dnd?.isDragging}
      isPreview={dnd?.isPreview}
      position={position || { x: 0, y: 0 }}
    >
      <Content>
        <FilePicker
          loading={loading}
          poster={poster.value}
          overlay={ item?.url ? <VideoOverlay /> : <></> }
          asAddButton={isAddButton && !isSending}
          isProcessing={isProcessing}
          width={OPTION_IMAGE_WIDTH}
          height={OPTION_IMAGE_HEIGHT}
          onChange={handleFileChanged}
          accept="video/*"
        />
        {showLabels && (
          <LabelTextarea
            appearance="description"
            placeholder={placeholder}
            value={caption}
            onFocus={handleLabelFocus}
            // onFocus={() => {}}
            onChangeCapture={handleChangeLabel}
            muted={isAddButton}
            maxLength={20}
          />
        )}
      </Content>
      {!isAddButton && (
        <Actions>
          <Button
            {...(item?.touched
              ? {
                  ref: dnd?.dragRef as React.RefObject<HTMLButtonElement>,
                }
              : {})}
            fill="text"
            rate="icon"
            icon={<DragTriggerIcon />}
            aria-label="Drag and Drop Item"
          />
          {isRemoveAllowed && (
            <Button
              fill="text"
              rate="icon"
              icon={<CloseIcon />}
              aria-label="Delete Item"
              onClick={() => item && onRemove?.(item)}
            />
          )}
        </Actions>
      )}
    </OptionContainer>
  );
};

export interface LoadableVideoGridEditorProps {
  data: VideoCell[];
  uniqueId: string | number;
  onChange: (data: VideoCell[]) => void;
  imageLabels: boolean;
  createCell: () => void;
  compact?: boolean;
  placeholder?: string;
  limits: {
    min: number;
    max: number;
  };
  gap?: number;
  containerRef?: React.RefObject<HTMLElement>;
  getUploadObjectPath: (file: File) => string;
}

const LoadableVideoGridEditor: React.FC<LoadableVideoGridEditorProps> = ({
  data,
  uniqueId,
  onChange,
  imageLabels,
  createCell,
  compact,
  limits,
  gap,
  placeholder,
  containerRef,
  getUploadObjectPath,
}) => {
  const handleRemoveItem = useCallback(
    (item: VideoCell) => {
      if (!onChange) {
        return;
      }

      if (data.length <= limits.min) {
        onChange(data.map((a) => (a.id === item.id ? { ...a, url: '' } : a)));
      } 
    },
    [limits, data, onChange, createCell]
  );

  const imagesPreloader = usePreloadImages();

  useEffect(() => {
    if (data && !imagesPreloader.isLoading && !imagesPreloader.isLoaded && !imagesPreloader.error) {
      imagesPreloader.preload(data.map((i) => i.url).filter((i) => !!i));
    }
  }, [imagesPreloader, data]);

  const renderItem: DraggableItemRenderer<VideoCell> = ({
    item,
    dragRef,
    dropRef,
    isDragging,
    isPreview,
    currentOffset,
    index,
  }) => {
    const coords: XYCoord = currentOffset
      ? {
          ...currentOffset,
          x: currentOffset.x - ITEM_WIDTH,
        }
      : { x: 0, y: 0 };

    return (
      <Option
        key={item?.id}
        data={data}
        position={coords}
        showLabels={imageLabels}
        loading={imagesPreloader.isLoading && !imagesPreloader.isLoaded}
        onChange={onChange}
        onRemove={handleRemoveItem}
        limits={limits}
        placeholder={placeholder}
        getUploadObjectPath={getUploadObjectPath}
        dnd={{
          item: data[index],
          dragRef,
          dropRef,
          isDragging,
          isPreview,
          currentOffset,
        }}
      />
    );
  };

  const keyExtractor = useCallback((item: VideoCell) => item.id, []);

  const matchedDevice = useMatchDeviceScreen();

  const columnsCount = useMemo(() => {
    if (matchedDevice.desktop) return 4;
    if (matchedDevice.laptop) return compact ? 2 : 3;
    return 2;
  }, [compact, matchedDevice]);

  return (
    <DraggableGrid
      columns={columnsCount}
      type={`question_image_option_${uniqueId}`}
      items={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      onChange={onChange}
      gap={gap}
      autoScroll={{ intersectionContainer: containerRef }}
    />
  );
};

export default React.memo(LoadableVideoGridEditor);
