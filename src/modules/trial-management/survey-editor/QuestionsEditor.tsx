import React, { ChangeEvent, FC, useMemo, useRef, useState } from 'react';
import styled, { css } from 'styled-components';
import { XYCoord } from 'dnd-core';
import _isEqual from 'lodash/isEqual';

import DragTriggerIcon from 'src/assets/icons/drag_trigger.svg';
import PlusIcon from 'src/assets/icons/plus.svg';
import Button from 'src/common/components/Button';
import { StyledTextField } from 'src/common/components/InputField';
import Modal from 'src/common/components/Modal';
import { animation, colors, px, typography } from 'src/styles';
import SkeletonLoading, { SkeletonRect } from 'src/common/components/SkeletonLoading';
import { useSelectedStudyId } from 'src/modules/studies/studies.slice';

import { QuestionItem, useSurveyEditor } from './surveyEditor.slice';
import DraggableList, { DraggableItemRenderer, DraggableListContainer } from './DraggableList';
import QuestionCard from './QuestionCard';

export const SURVEY_TITLE_DATA_ID = 'survey-title';

const QuestionsEditorContainer = styled.div`
  padding-top: ${px(40)};
`;

const TitleEditorContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${px(8)};
  margin-bottom: ${px(26)};
  position: relative;
`;

const TitleEditorTitleTextField = styled(StyledTextField)`
  ${typography.headingMedium};
  color: ${colors.textPrimary};
  height: ${px(52)};
  margin: 0;

  &:disabled {
    background-color: ${colors.surface} !important;
  }

  &::placeholder {
    color: ${({ theme, error }) => error && theme.colors.statusErrorText};
  }
`;

const TitleEditorDescriptionTextField = styled.input`
  ${typography.bodySmallRegular};
  color: ${colors.textPrimary};
  border: none;
  outline: none;
  background: transparent;
  display: block;
  width: 100%;
  padding: 0 ${px(16)};
  margin: 0;
  height: ${px(24)};

  &::placeholder {
    color: ${colors.textSecondaryGray};
  }
`;

const AddQuestionButton = styled(Button)`
  border: ${px(1)} solid ${colors.primary};
  margin-top: ${px(20)};
  margin-bottom: ${px(38)};
  z-index: 3;
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
  color: ${colors.textSecondaryGray};
`;

interface LimitsCounterProps extends React.PropsWithChildren {
  current: number;
  max: number;
}

const LimitsCounter: FC<LimitsCounterProps> = ({ current, max, children }) => (
  <LimitsCounterContainer>
    {children}
    <LimitsCounterValues>{`${current}/${max}`}</LimitsCounterValues>
  </LimitsCounterContainer>
);

const TitleEditorLoadingContainer = styled(SkeletonLoading)`
  position: absolute;
  z-index: 1;
  top: ${px(18)};
  left: ${px(16)};
`;

const TitleEditorLoading = () => (
  <TitleEditorLoadingContainer>
    <SkeletonRect x={0} y={0} width={460} height={16} />
    <SkeletonRect x={0} y={48} width={258} height={12} />
  </TitleEditorLoadingContainer>
);

type TitleEditorChangeListener = (evt: ChangeEvent<HTMLInputElement>) => void;

interface TitleEditorProps {
  title: string;
  description: string;
  onChangeTitle: TitleEditorChangeListener;
  onChangeDescription: TitleEditorChangeListener;
  error?: boolean;
  loading?: boolean;
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
  loading,
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
      {loading && <TitleEditorLoading />}
      <LimitsCounter current={title.length} max={MAX_TITLE_LENGTH}>
        <TitleEditorTitleTextField
          data-id={SURVEY_TITLE_DATA_ID}
          lighten
          type="text"
          placeholder={!loading ? 'Enter survey title*' : ''}
          value={title}
          onChange={handleTitleChange}
          error={error}
          disabled={loading}
          aria-label="Survey Title"
        />
      </LimitsCounter>
      <LimitsCounter current={description.length} max={MAX_DESCRIPTION_LENGTH}>
        <TitleEditorDescriptionTextField
          type="text"
          placeholder={!loading ? 'Add survey description (optional)' : ''}
          value={description}
          onChange={handleDescriptionChange}
          disabled={loading}
          aria-label="Survey Description"
        />
      </LimitsCounter>
    </TitleEditorContainer>
  );
};

const DRAGGABLE_ITEM_TYPE = Symbol('DRAGGABLE_ITEM');
export const LIST_ITEM_MARGIN = 12;
export const QUESTION_CARD_HEIGHT = 414;

type DraggableItemContainerProps = React.PropsWithChildren<{
  isDragging?: boolean;
  isPreview?: boolean;
  position?: XYCoord;
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
  min-height: ${px(QUESTION_CARD_HEIGHT)};
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
  background-color: ${colors.primaryLight};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: move;

  > svg {
    fill: ${colors.primary};
  }
`;

const DraggableItemBody = styled.div`
  flex: 1;
`;

const isQuestionEmptyText = (q: QuestionItem) =>
  q && !q?.title && !q?.description && q?.answers.every((a) => a.value === '');

const DraggableItemSkeletonLoader = styled(SkeletonLoading)`
  margin: ${px(24)};
`;

const DraggableItemLoading = () => (
  <DraggableItemContainer>
    <DraggableItemSkeletonLoader>
      <SkeletonRect x={0} y={0} width={258} height={24} />
      <SkeletonRect x={0} y={354} width={1032} height={24} />
    </DraggableItemSkeletonLoader>
  </DraggableItemContainer>
);

const QuestionsEditor: FC = () => {
  const {
    survey,
    surveyErrors,
    updateSurvey,
    updateQuestion,
    removeQuestion,
    copyQuestion,
    addQuestion,
    isLoading,
  } = useSurveyEditor();

  const studyId = useSelectedStudyId();

  const isStudySwitching = useMemo(
    () => !survey.studyId || !_isEqual(studyId, survey.studyId),
    [studyId, survey.studyId]
  );

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
    const coords: XYCoord | undefined = useMemo(() => {
      if (isPreview && currentOffset) {
        return {
          y: currentOffset.y - clientY.current - 12,
          x: 0,
        };
      }

      return undefined;
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
            onRemove={isQuestionEmptyText(item) ? removeQuestion : setQuestionToDelete}
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
        loading={!survey.title ? (!survey.id && isLoading) || isStudySwitching : false}
      />
      {(!survey.id && isLoading) || isStudySwitching ? (
        <DraggableListContainer>
          {Array.from({ length: 2 }).map((_, idx) => (
            // eslint-disable-next-line react/no-array-index-key
            <DraggableItemLoading key={idx} />
          ))}
        </DraggableListContainer>
      ) : (
        <DraggableList
          type={DRAGGABLE_ITEM_TYPE}
          items={survey.questions}
          renderItem={renderListItem}
          keyExtractor={(item) => item.id}
          onChange={(qs) => {
            updateSurvey({ questions: qs });
          }}
        />
      )}
      <AddQuestionButton fill="text" icon={<PlusIcon />} onClick={addQuestion}>
        Add question
      </AddQuestionButton>
      <Modal
        open={!!questionToDelete && !isQuestionEmptyText(questionToDelete)}
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
