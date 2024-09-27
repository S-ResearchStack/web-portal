import React, { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import usePrevious from 'react-use/lib/usePrevious';
import useUpdateEffect from 'react-use/lib/useUpdateEffect';
import useDebounce from 'react-use/lib/useDebounce';
import {
  calculateLines,
  createHiddenCloneOfElement,
} from 'src/modules/common/utils';

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

type ImageCell = {
  id: string;
  image: string;
  value: string;
  touched?: boolean;
};

interface OptionProps {
  data?: ImageCell[];
  onAdd?: () => void;
  position?: XYCoord;
  showLabels?: boolean;
  dnd?: Pick<DraggableItemRendererProps<ImageCell>, DraggableItemRendererPickedPropsForOptionProps>;
  onChange?: (data: ImageCell[]) => void;
  onRemove?: (item: ImageCell) => void;
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
const MAX_FILE_SIZE_MB = isDev ? 0.1 : 250;
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
  const [labelValue, setLabelValue] = useState(item?.value);

  useUpdateEffect(() => {
    setLabelValue(item?.value);
  }, [item?.value]);

  const handleChange = useCallback(
    (answer: Partial<ImageCell>) => {
      data &&
        onChange?.(data.map((d) => (d.id === item?.id ? { ...d, ...answer, touched: true } : d)));
    },
    [data, item?.id, onChange]
  );

  useDebounce(
    () => {
      item?.touched &&
        handleChange({
          value: labelValue,
        });
    },
    LOCAL_STATE_DELAY,
    [labelValue]
  );

  const handleLabelFocus = useCallback(() => {
    handleChange({}); // mark as touched
  }, [handleChange]);

  const prevTouched = usePrevious(item?.touched);
  useEffect(() => {
    if (
      !isSending &&
      !error &&
      !item?.image &&
      item?.touched === true &&
      prevTouched !== undefined &&
      item?.touched !== prevTouched
    ) {
      onAdd?.();
    }
  }, [error, isSending, onAdd, item?.image, item?.touched, prevTouched]);

  const lastLabelSelection = useRef<number>();
  const labelRef = useRef<HTMLTextAreaElement>();

  const handleChangeLabel = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;

    // for caret restoration
    lastLabelSelection.current = e.target.selectionStart;
    labelRef.current = e.target;

    setLabelValue(fitText(e.target, value, MAX_LABEL_ROWS_LENGTH, MAX_LABEL_TEXT_LENGTH));
  }, []);

  // restore caret after value modified
  useEffect(() => {
    if (lastLabelSelection.current && labelRef.current) {
      labelRef.current?.setSelectionRange(lastLabelSelection.current, lastLabelSelection.current);
    }
  }, [labelValue]);

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

        if (isAddButton) {
          onAdd?.();
        }

        setOutgoingFile(currentFile);
      }
    },
    [isAddButton, onAdd, showSnackbar]
  );

  const uploadFile = useCallback(async () => {
    if (outgoingFile instanceof File) {
      const image = URL.createObjectURL(outgoingFile);
      handleChange({ image });

      const res = await upload({
        path: image.split('/').pop() || '',
        file: outgoingFile,
      });
      if (res.err) {
        handleChange({}); // mark answer as touched
      };
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

  const isRemoveAllowed = ((data?.length || 0) > limits.min || !!item?.image) && onRemove;

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
          poster={item?.image}
          asAddButton={isAddButton && !isSending}
          isProcessing={isProcessing}
          width={OPTION_IMAGE_WIDTH}
          height={OPTION_IMAGE_HEIGHT}
          onChange={handleFileChanged}
          accept="image/*"
        />
        {showLabels && (
          <LabelTextarea
            appearance="description"
            placeholder={placeholder}
            value={labelValue}
            onFocus={handleLabelFocus}
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

export interface LoadableImageGridEditorProps {
  data: ImageCell[];
  uniqueId: string | number;
  onChange: (data: ImageCell[]) => void;
  imageLabels: boolean;
  createCell: () => ImageCell;
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

const LoadableImageGridEditor: React.FC<LoadableImageGridEditorProps> = ({
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
    (item: ImageCell) => {
      if (!onChange) {
        return;
      }

      if (data.length <= limits.min) {
        onChange(data.map((a) => (a.id === item.id ? { ...a, image: '' } : a)));
      } else if (data.length >= limits.max - 1) {
        onChange([...data.filter((a) => a.id !== item.id).filter((a) => a.touched), createCell()]);
      } else {
        onChange([...data.filter((a) => a.id !== item.id).filter((a) => a.touched), createCell()]);
      }
    },
    [limits, data, onChange, createCell]
  );

  const handleAddItem = useCallback(() => {
    onChange?.([...data, ...(data.length < limits.max ? [createCell()] : [])]);
  }, [limits, data, onChange, createCell]);

  const imagesPreloader = usePreloadImages();

  useEffect(() => {
    if (data && !imagesPreloader.isLoading && !imagesPreloader.isLoaded && !imagesPreloader.error) {
      imagesPreloader.preload(data.map((i) => i.image).filter((i) => !!i));
    }
  }, [imagesPreloader, data]);

  const renderItem: DraggableItemRenderer<ImageCell> = ({
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
        onAdd={handleAddItem}
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

  const keyExtractor = useCallback((item: ImageCell) => item.id, []);

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

export default React.memo(LoadableImageGridEditor);
