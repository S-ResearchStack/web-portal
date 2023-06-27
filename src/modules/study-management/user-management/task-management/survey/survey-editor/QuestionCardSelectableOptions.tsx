import React, { ChangeEvent, FC, useMemo } from 'react';
import useDebounce from 'react-use/lib/useDebounce';
import useUpdateEffect from 'react-use/lib/useUpdateEffect';

import type { XYCoord } from 'dnd-core';
import styled, { css } from 'styled-components';

import CloseIcon from 'src/assets/icons/close.svg';
import DragTriggerIcon from 'src/assets/icons/drag_trigger.svg';
import RadioUncheckedIcon from 'src/assets/icons/radio_unchecked.svg';
import RoundChips from 'src/common/components/RoundChips';
import CheckboxUncheckedIcon from 'src/assets/icons/checkbox_blank.svg';
import { animation, colors, px, theme, typography } from 'src/styles';
import Button from 'src/common/components/Button';
import TextArea, { TextAreaProps } from 'src/modules/study-management/common/TextArea';
import withLocalDebouncedState from 'src/common/withLocalDebouncedState';
import DraggableList, { DraggableItemRenderer } from './DraggableList';
import { OTHER_ANSWER_ID } from './questions/common';
import type { QuestionType, SelectableAnswer } from './surveyEditor.slice';
import { RankAnswer } from './questions/common/types';

const Icon = styled.div`
  width: ${px(40)};
  height: ${px(40)};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const OptionTextField = withLocalDebouncedState<HTMLTextAreaElement, TextAreaProps>(styled(
  TextArea
)`
  margin: ${px(9)} 0 ${px(7)} !important;
  color: ${colors.textPrimary};
  &::placeholder {
    color: ${colors.onDisabled};
  }
`);

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

const Container = styled.div`
  min-height: ${px(40)};
  height: ${px(40)};
  border-radius: ${px(4)};
  display: grid;
  margin: ${px(4)} 0;
  gap: ${px(4)};
  align-items: flex-start;
  background-color: ${colors.surface};
`;

const OptionContainer = styled(Container).attrs<OptionContainerProps>((props) => ({
  style: getOptionContainerStyles(props),
}))<OptionContainerProps>`
  grid-template-columns: ${px(40)} 1fr ${px(72)};
  opacity: ${({ isDragging }) => (isDragging ? 0 : 1)};
  height: fit-content;
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

const AddOptionContainer = styled(Container)`
  grid-template-columns: ${px(40)} 1fr;
`;

const OtherOptionContainer = styled.div`
  display: flex;
`;

const OtherOptionWithText = styled.div`
  display: flex;
  flex-direction: column;
`;

const MaxSymbolsText = styled.div`
  ${typography.bodyXSmallRegular};
  color: ${colors.textSecondaryGray};
  border-bottom: ${px(1)} solid ${colors.primary30};
`;

interface QuestionCardSelectableOptionsProps {
  uniqueId: string | number;
  data: SelectableAnswer[] | RankAnswer[];
  type: 'single' | 'multiple' | 'dropdown' | 'rank';
  withOtherOption?: boolean;
  onChange: (data: SelectableAnswer[] | RankAnswer[]) => void;
  onAdd: (value?: string) => void;
  onRemove: (item: SelectableAnswer | RankAnswer) => void;
  containerRef?: React.RefObject<HTMLElement>;
}

const getSecondaryIconByQuestionType = (type: QuestionType, index?: number) => {
  switch (type) {
    case 'multiple':
      return <CheckboxUncheckedIcon />;
    case 'single':
    case 'dropdown':
      return <RadioUncheckedIcon />;
    case 'rank':
      return <RoundChips type="default">{index}</RoundChips>;
    default:
      return null;
  }
};

const QuestionCardSelectableOptions: FC<QuestionCardSelectableOptionsProps> = ({
  type,
  data,
  withOtherOption,
  onChange,
  onAdd,
  onRemove,
  uniqueId,
  containerRef,
}) => {
  const [val, setVal] = React.useState('');
  const [addOptionTextHidden, setAddOptionTextHidden] = React.useState(false);

  const limitReached = useMemo(() => type === 'rank' && data.length > 99, [type, data.length]);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setVal(e.target.value);
    setAddOptionTextHidden(true); /* fix text blinking when adding a new option */
  };

  useDebounce(
    () => {
      if (val) {
        onAdd(val);
      }
      setVal('');
    },
    700,
    [val]
  );

  useUpdateEffect(() => {
    if (!val) {
      setAddOptionTextHidden(false);
    }
  }, [val]);

  const addOptionField = useMemo(() => {
    if (limitReached) {
      return null;
    }

    return (
      <AddOptionContainer key={data.length + 1}>
        <Icon>{getSecondaryIconByQuestionType(type, data.length + 1)}</Icon>
        <OptionTextField
          autoHeight
          data-testid="question-card-add-option"
          scrollbarThumbColor={theme.colors.primary30}
          appearance="description"
          placeholder="Add option"
          value={addOptionTextHidden ? '' : val}
          onChange={handleChange}
        />
      </AddOptionContainer>
    );
  }, [addOptionTextHidden, data.length, limitReached, type, val]);

  const renderOption: DraggableItemRenderer<SelectableAnswer | RankAnswer> = ({
    item,
    dragRef,
    dropRef,
    isDragging,
    isPreview,
    currentOffset,
    index,
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
        <Icon>{getSecondaryIconByQuestionType(type, index + 1)}</Icon>
        <OptionTextField
          autoHeight
          scrollbarThumbColor={theme.colors.primary30}
          appearance="description"
          placeholder="Enter option"
          value={item.value}
          onChange={(evt) => {
            onChange(data.map((d) => (d.id === item.id ? { ...d, value: evt.target.value } : d)));
          }}
          maxLength={256}
        />
        <OptionActions>
          <IconButton
            fill="text"
            rate="icon"
            data-testid="delete-option-button"
            icon={<CloseIcon />}
            onClick={() => onRemove(item)}
            $hidden={!isRemoveAllowed}
            aria-label="Delete Option"
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
        items={data.filter((d) => d.id !== OTHER_ANSWER_ID)}
        renderItem={renderOption}
        keyExtractor={(item) => item.id}
        onChange={onChange}
        autoScroll={{
          intersectionContainer: containerRef,
          scrollRegionHeight: 50,
        }}
      />
      {addOptionField}
      {withOtherOption && (
        <OtherOptionContainer>
          <Icon>{getSecondaryIconByQuestionType(type)}</Icon>
          <OtherOptionWithText>
            <OptionTextField
              autoHeight
              scrollbarThumbColor={theme.colors.primary30}
              appearance="description"
              value="Other"
              disabled
            />
            <MaxSymbolsText>Max 50 characters</MaxSymbolsText>
          </OtherOptionWithText>
        </OtherOptionContainer>
      )}
    </>
  );
};

export default QuestionCardSelectableOptions;
