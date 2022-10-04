import React, { ChangeEvent, FC, useMemo, useRef, useState } from 'react';

import styled, { css } from 'styled-components';
import { XYCoord } from 'dnd-core';

import DragTriggerIcon from 'src/assets/icons/drag_trigger.svg';
import { StyledTextField } from 'src/common/components/InputField';
import Modal from 'src/common/components/Modal';
import { animation, colors, px, typography } from 'src/styles';

import DraggableList, { DraggableItemRenderer } from './DraggableList';
import QuestionCard from './QuestionCard';
import { QuestionItem, useSurveyEditor } from './surveyEditor.slice';

const QuestionsEditorContainer = styled.div`
  padding-top: ${px(40)};
`;

const TitleEditorContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${px(8)};
  margin-bottom: ${px(26)};
`;

const TitleEditorTitleTextField = styled(StyledTextField)`
  ${typography.headingMedium};
  color: ${colors.updTextPrimary};
  height: ${px(52)};
  margin: 0;

  &::placeholder {
    color: ${({ theme, error }) => error && theme.colors.updStatusErrorText};
  }
`;

const TitleEditorDescriptionTextField = styled.input`
  ${typography.bodySmallRegular};
  color: ${colors.updTextPrimary};
  border: none;
  outline: none;
  background: transparent;
  display: block;
  width: 100%;
  padding: 0 ${px(16)};
  margin: 0;
  height: ${px(24)};

  &::placeholder {
    color: ${colors.updTextSecondaryGray};
  }
`;

const LimitsCounterContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;

  input {
    padding-right: ${px(60)};
  }
`;

const LimitsCounterValues = styled.div`
  position: absolute;
  right: ${px(16)};
  ${typography.labelRegular};
  color: ${colors.updTextSecondaryGray};
`;

interface LimitsCounterProps extends React.PropsWithChildren<unknown> {
  current: number;
  max: number;
}

const LimitsCounter: FC<LimitsCounterProps> = ({ current, max, children }) => (
  <LimitsCounterContainer>
    {children}
    <LimitsCounterValues>{`${current}/${max}`}</LimitsCounterValues>
  </LimitsCounterContainer>
);

type TitleEditorChangeListener = (evt: ChangeEvent<HTMLInputElement>) => void;

interface TitleEditorProps {
  title: string;
  description: string;
  onChangeTitle: TitleEditorChangeListener;
  onChangeDescription: TitleEditorChangeListener;
  error?: boolean;
}

const createChangeListenerWithValueLengthLimit =
  (listener: TitleEditorChangeListener, symbolsLimit: number): TitleEditorChangeListener =>
  (evt) => {
    if (evt.target.value.length <= symbolsLimit) {
      listener(evt);
    } else {
      evt.preventDefault();
    }
  };

const MAX_TITLE_LENGTH = 90;
const MAX_DESCRIPTION_LENGTH = 120;

const TitleEditor: FC<TitleEditorProps> = ({
  title,
  description,
  onChangeTitle,
  onChangeDescription,
  error,
}) => {
  const handleTitleChange = useMemo(
    () => createChangeListenerWithValueLengthLimit(onChangeTitle, MAX_TITLE_LENGTH),
    [onChangeTitle]
  );

  const handleDescriptionChange = useMemo(
    () => createChangeListenerWithValueLengthLimit(onChangeDescription, MAX_DESCRIPTION_LENGTH),
    [onChangeDescription]
  );

  return (
    <TitleEditorContainer>
      <LimitsCounter current={title.length} max={MAX_TITLE_LENGTH}>
        <TitleEditorTitleTextField
          lighten
          type="text"
          placeholder="Enter survey title*"
          value={title}
          onChange={handleTitleChange}
          error={error}
        />
      </LimitsCounter>
      <LimitsCounter current={description.length} max={MAX_DESCRIPTION_LENGTH}>
        <TitleEditorDescriptionTextField
          type="text"
          placeholder="Add survey description (optional)"
          value={description}
          onChange={handleDescriptionChange}
        />
      </LimitsCounter>
    </TitleEditorContainer>
  );
};

const DRAGGABLE_ITEM_TYPE = Symbol('DRAGGABLE_ITEM');
export const LIST_ITEM_MARGIN = 12;

type DraggableItemContainerProps = React.PropsWithChildren<{
  isDragging?: boolean;
  isPreview?: boolean;
  position: XYCoord | null;
}>;

const draggableItemContainerHoverShadow = `
  0 0 ${px(2)} rgba(0, 0, 0, 0.15),
  ${px(10.9232)} ${px(3.64106)} ${px(31.8592)} rgba(1, 38, 116, 0.1);
`;

const getOptionContainerStyles = ({
  isPreview,
  position,
}: DraggableItemContainerProps): React.CSSProperties =>
  isPreview
    ? {
        opacity: position ? 0.7 : 0,
        transform: position ? `translate(${px(position.x)}, ${px(position.y)})` : 'none',
      }
    : {};

const DraggableItemContainer = styled.div.attrs<DraggableItemContainerProps>((props) => ({
  style: getOptionContainerStyles(props),
}))<DraggableItemContainerProps>`
  min-height: ${px(414)};
  background-color: ${colors.surface};
  box-shadow: 0 0 ${px(2)} rgba(0, 0, 0, 0.15), 0 0 0 rgba(1, 38, 116, 0.1); // TODO: unknown color
  transition: box-shadow 300ms ${animation.defaultTiming};
  border-radius: ${px(4)};
  display: flex;
  align-items: stretch;
  opacity: ${({ isDragging }) => (isDragging ? 0 : 1)};
  margin: ${px(LIST_ITEM_MARGIN)} 0;

  ${({ isPreview }) =>
    isPreview &&
    css`
      box-shadow: ${draggableItemContainerHoverShadow};
      opacity: 0.7;
    `}

  &:hover {
    box-shadow: ${draggableItemContainerHoverShadow};
  }
`;

const DraggableItemDragTrigger = styled.div.attrs({
  children: <DragTriggerIcon />,
})`
  width: ${px(40)};
  background-color: ${colors.updPrimaryLight};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: move;

  > svg {
    fill: ${colors.updPrimary};
  }
`;

const DraggableItemBody = styled.div`
  flex: 1;
`;

const QuestionsEditor: FC = () => {
  const { survey, surveyErrors, updateSurvey, updateQuestion, removeQuestion, copyQuestion } =
    useSurveyEditor();
  const [questionToDelete, setQuestionToDelete] = useState<QuestionItem | null>(null);
  const clientY = useRef<number>(0);

  const questionCardRef = useRef<HTMLDivElement>(null);

  const handleRemoveQuestion = () => {
    if (questionToDelete) {
      removeQuestion(questionToDelete);
    }
    setQuestionToDelete(null);
  };

  const handleClose = () => setQuestionToDelete(null);

  const renderListItem: DraggableItemRenderer<QuestionItem> = ({
    item,
    index,
    dropRef,
    dragRef,
    isDragging,
    isPreview,
    currentOffset,
    items,
  }) => {
    const coords: XYCoord | null = useMemo(() => {
      if (isPreview && currentOffset) {
        return {
          y: currentOffset.y - clientY.current - 12,
          x: 0,
        };
      }

      return null;
    }, [currentOffset, isPreview]);

    return (
      <DraggableItemContainer
        ref={dropRef as React.RefObject<HTMLDivElement>}
        onMouseDown={(evt) => {
          if (dragRef.current && dropRef.current) {
            const dragRect = dragRef.current?.getBoundingClientRect();
            const dropRect = dropRef.current?.getBoundingClientRect();
            const diff = dragRect.y - dropRect.y;

            clientY.current = evt.clientY - dropRect.y - diff;
          }
        }}
        isDragging={isDragging}
        isPreview={isPreview}
        position={coords}
      >
        <DraggableItemDragTrigger ref={dragRef as React.RefObject<HTMLDivElement>} />
        <DraggableItemBody>
          <QuestionCard
            ref={questionCardRef}
            question={item}
            errors={surveyErrors?.questions.find((q) => q.id === item.id)}
            index={index}
            onCopy={copyQuestion}
            onRemove={setQuestionToDelete}
            onChange={updateQuestion}
            isDeleteButtonVisible={items.length > 1}
          />
        </DraggableItemBody>
      </DraggableItemContainer>
    );
  };

  return (
    <QuestionsEditorContainer>
      <TitleEditor
        title={survey.title}
        description={survey.description}
        onChangeTitle={(evt) => updateSurvey({ title: evt.target.value })}
        onChangeDescription={(evt) => updateSurvey({ description: evt.target.value })}
        error={surveyErrors?.title.empty}
      />
      <DraggableList
        type={DRAGGABLE_ITEM_TYPE}
        items={survey.questions}
        renderItem={renderListItem}
        keyExtractor={(item) => item.id}
        onChange={(qs) => {
          updateSurvey({ questions: qs });
        }}
      />
      <Modal
        open={!!questionToDelete}
        title="Delete Question"
        onAccept={handleRemoveQuestion}
        onDecline={handleClose}
        declineLabel="Cancel"
        acceptLabel="Delete Question"
        description="Are you sure you want to delete the question? By doing this, you will lose the content you have entered for this question."
      />
    </QuestionsEditorContainer>
  );
};

export default QuestionsEditor;
