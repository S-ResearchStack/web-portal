import type { XYCoord } from 'dnd-core';
import React, { FC } from 'react';
import styled, { css } from 'styled-components';

import CheckboxUncheckedIcon from 'src/assets/icons/checkbox_blank.svg';
import CloseIcon from 'src/assets/icons/close.svg';
import DragTriggerIcon from 'src/assets/icons/drag_trigger.svg';
import PlusIcon from 'src/assets/icons/plus.svg';
import RadioUncheckedIcon from 'src/assets/icons/radio_unchecked.svg';
import {
  QuestionType,
  SelectableAnswer,
} from 'src/modules/trial-management/survey-editor/surveyEditor.slice';
import { animation, colors, px, theme } from 'src/styles';
import Button from 'src/common/components/Button';

import TextArea from '../common/TextArea';
import DraggableList, { DraggableItemRenderer } from './DraggableList';

const Icon = styled.div`
  width: ${px(40)};
  height: ${px(40)};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const OptionTextField = styled(TextArea)`
  margin: ${px(9.5)} 0;
`;

const OptionActions = styled.div`
  height: ${px(40)};
  display: grid;
  align-items: center;
  gap: ${px(8)};
  grid-template-columns: repeat(2, ${px(24)});
`;

const IconButton = styled(Button)<{ $hidden?: boolean }>`
  visibility: ${({ $hidden }) => $hidden && 'hidden'};
`;

const DragIconButton = styled(IconButton)`
  cursor: move !important;
`;

interface OptionContainerProps {
  isDragging?: boolean;
  isPreview?: boolean;
  position: XYCoord;
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

const OptionContainer = styled.div.attrs<OptionContainerProps>((props) => ({
  style: getOptionContainerStyles(props),
}))<OptionContainerProps>`
  min-height: ${px(40)};
  height: auto;
  border-radius: ${px(4)};
  display: grid;
  grid-template-columns: ${px(40)} 1fr ${px(72)};
  gap: ${px(4)};
  align-items: flex-start;
  opacity: ${({ isDragging }) => (isDragging ? 0 : 1)};
  background-color: ${colors.surface};
  margin: ${px(4)} 0;

  ${({ isPreview }) =>
    isPreview &&
    css`
      background-color: ${colors.background};
    `}};
  
  ${OptionActions} {
    opacity: ${({ isPreview }) => (isPreview ? 1 : 0)};
    transition: opacity 300ms ${animation.defaultTiming};
  }
  
  &:hover {
    background-color: ${colors.background};
    
    ${OptionActions} {
      opacity: 1;
    }
  }
`;

const AddOptionButton = styled(Button)`
  justify-content: flex-start;
  padding: 0 ${px(8)};
  width: 100%;
  margin-top: ${px(4)};
`;

interface QuestionCardSelectableOptionsProps {
  uniqueId: string | number;
  data: SelectableAnswer[];
  type: 'single' | 'multiple';
  onChange: (data: SelectableAnswer[]) => void;
  onAdd: () => void;
  onRemove: (item: SelectableAnswer) => void;
}

const getSecondaryIconByQuestionType = (type: QuestionType) => {
  switch (type) {
    case 'multiple':
      return <CheckboxUncheckedIcon />;
    case 'single':
      return <RadioUncheckedIcon />;
    default:
      return null;
  }
};

const QuestionCardSelectableOptions: FC<QuestionCardSelectableOptionsProps> = ({
  type,
  data,
  onChange,
  onAdd,
  onRemove,
  uniqueId,
}) => {
  const renderOption: DraggableItemRenderer<SelectableAnswer> = ({
    item,
    dragRef,
    dropRef,
    isDragging,
    isPreview,
    currentOffset,
  }) => {
    const coords: XYCoord = { x: 0, y: 0 };

    if (currentOffset) {
      coords.y = currentOffset.y - 24;
    }

    const isRemoveAllowed = data.length > 2;

    return (
      <OptionContainer
        ref={dropRef as React.RefObject<HTMLDivElement>}
        isDragging={isDragging}
        isPreview={isPreview}
        position={coords}
      >
        <Icon>{getSecondaryIconByQuestionType(type)}</Icon>
        <OptionTextField
          autoHeight
          scrollbarThumbColor={theme.colors.primary30}
          appearance="description"
          placeholder="Enter option"
          value={item.value}
          onChange={(evt) => {
            onChange(data.map((d) => (d.id === item.id ? { ...d, value: evt.target.value } : d)));
          }}
        />
        <OptionActions>
          <IconButton
            fill="text"
            rate="icon"
            icon={<CloseIcon />}
            onClick={() => onRemove(item)}
            $hidden={!isRemoveAllowed}
            aria-label="Delete Question"
          />
          <DragIconButton
            fill="text"
            rate="icon"
            icon={<DragTriggerIcon />}
            ref={dragRef as React.RefObject<HTMLButtonElement>}
            aria-label="Drag and Drop Question"
          />
        </OptionActions>
      </OptionContainer>
    );
  };

  return (
    <>
      <DraggableList
        type={`question_option_${uniqueId}`}
        items={data}
        renderItem={renderOption}
        keyExtractor={(item) => item.id}
        onChange={onChange}
      />
      <AddOptionButton onClick={onAdd} dashed fill="bordered" icon={<PlusIcon />}>
        Add option
      </AddOptionButton>
    </>
  );
};

export default QuestionCardSelectableOptions;
