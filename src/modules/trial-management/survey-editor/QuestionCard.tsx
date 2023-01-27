import React, { ChangeEvent, ForwardedRef, forwardRef, useCallback } from 'react';
import styled, { css } from 'styled-components';
import _uniqueId from 'lodash/uniqueId';

import Checkbox from 'src/common/components/CheckBox';
import Dropdown from 'src/common/components/Dropdown';
import CheckboxCheckedIcon from 'src/assets/icons/checkbox_checked.svg';
import CopyIcon from 'src/assets/icons/copy.svg';
import DeleteIcon from 'src/assets/icons/trash_can.svg';
import RadioCheckedIcon from 'src/assets/icons/radio_checked.svg';
import SliderIcon from 'src/assets/icons/slider.svg';
import {
  newId,
  QuestionItem,
  QuestionType,
  ScalableAnswer,
  SelectableAnswer,
  SurveyQuestionErrors,
} from 'src/modules/trial-management/survey-editor/surveyEditor.slice';
import { colors, px, typography } from 'src/styles';
import Button from 'src/common/components/Button';

import TextArea from '../common/TextArea';
import QuestionCardScalableOptions from './QuestionCardScalableOptions';
import QuestionCardSelectableOptions from './QuestionCardSelectableOptions';

const Container = styled.div`
  width: 100%;
  padding: ${px(24)};
`;

const QuestionNumber = styled.div`
  ${typography.headingXSmall};
  color: ${colors.textPrimary};
`;

const TitleTextField = styled(TextArea)`
  max-height: ${px(80)};
  &::placeholder {
    color: ${({ theme, invalid }) => invalid && theme.colors.statusErrorText};
  }
`;

const DescriptionTextField = styled(TextArea)`
  padding-left: ${px(16)};
`;

const TitleContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${px(8)};
`;

const MainInformation = styled.div`
  display: grid;
  grid-template-columns: 1fr ${px(200)};
  gap: ${px(8)};
  margin-top: ${px(16)};
  margin-bottom: ${px(20)};
`;

const Footer = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-top: ${px(38)};
`;

const CardActions = styled.div`
  height: ${px(24)};
  display: grid;
  align-items: center;
  gap: ${px(16)};
  grid-template-columns: repeat(2, ${px(24)});
`;

const DeleteIconButton = styled(Button)<{ $visible?: boolean }>`
  ${({ $visible }) =>
    !$visible &&
    css`
      opacity: 0;
      pointer-events: none;
    `}
`;

const createEmptySingleOrMultiSelectionAnswer = (): SelectableAnswer => ({
  id: _uniqueId('virtual_id_'),
  value: '',
});

interface QuestionCardProps {
  question: QuestionItem;
  errors?: SurveyQuestionErrors;
  index: number;
  className?: string;
  onChange?: (data: QuestionItem) => void;
  onCopy?: (data: QuestionItem) => void;
  onRemove?: (data: QuestionItem) => void;
  isDeleteButtonVisible: boolean;
}

const questionTypes = [
  { label: 'Single-selection', key: 'single' as const, icon: <RadioCheckedIcon /> },
  { label: 'Multi-selection', key: 'multiple' as const, icon: <CheckboxCheckedIcon /> },
  { label: 'Slider scale', key: 'slider' as const, icon: <SliderIcon /> },
];

const QuestionCard = forwardRef(
  (
    {
      className,
      question,
      errors,
      index,
      onChange,
      onCopy,
      onRemove,
      isDeleteButtonVisible,
    }: QuestionCardProps,
    ref: ForwardedRef<HTMLDivElement>
  ) => {
    const handleChange = useCallback(
      (q: Partial<QuestionItem>) => {
        onChange?.({ ...question, ...q });
      },
      [onChange, question]
    );

    const handleTitleChange = (evt: ChangeEvent<HTMLTextAreaElement>) =>
      handleChange({ title: evt.target.value });
    const handleDescriptionChange = (evt: ChangeEvent<HTMLTextAreaElement>) =>
      handleChange({ description: evt.target.value });
    const handleTypeChange = (type: QuestionType) => {
      handleChange({
        type,
        ...(type === 'slider'
          ? {
              // TODO: handle this in store
              answers: [
                {
                  id: newId(),
                  label: '',
                  value: 0,
                },
                {
                  id: newId(),
                  label: '',
                  value: 10,
                },
              ],
            }
          : {}),
      });
    };
    const handleOptionMarkerChange = (evt: ChangeEvent<HTMLInputElement>) =>
      handleChange({ optional: evt.target.checked });
    const handleAnswersChange = (answers: Array<SelectableAnswer | ScalableAnswer>) =>
      handleChange({ answers: answers as ScalableAnswer[] });
    const handleAnswerAdd = () => {
      const answers = [...question.answers];
      answers.push(createEmptySingleOrMultiSelectionAnswer());
      handleChange({ answers });
    };

    const handleAnswerRemove = (item: SelectableAnswer) => {
      handleChange({ answers: question.answers.filter((a) => a.id !== item.id) });
    };

    const handleQuestionCopy = () => onCopy?.(question);
    const handleQuestionRemove = () => onRemove?.(question);

    const renderOptions = () => {
      switch (question.type) {
        case 'single':
        case 'multiple':
          return (
            <QuestionCardSelectableOptions
              uniqueId={question.id}
              type={question.type}
              data={question.answers as SelectableAnswer[]}
              onChange={handleAnswersChange}
              onAdd={handleAnswerAdd}
              onRemove={handleAnswerRemove}
            />
          );

        case 'slider':
          return (
            <QuestionCardScalableOptions
              data={question.answers as ScalableAnswer[]}
              onChange={handleAnswersChange}
            />
          );

        default:
          return null;
      }
    };

    return (
      <Container
        className={className}
        ref={ref}
        data-id={question.id}
        data-testid={`question-${question.id}`}
      >
        <QuestionNumber>Question {index + 1}</QuestionNumber>
        <MainInformation>
          <TitleContainer>
            <TitleTextField
              autoHeight
              placeholder="Enter question*"
              value={question.title}
              onChange={handleTitleChange}
              invalid={errors?.title.empty}
            />
            <DescriptionTextField
              autoHeight
              appearance="description"
              placeholder="Add question description (optional)"
              value={question.description}
              onChange={handleDescriptionChange}
            />
          </TitleContainer>
          <Dropdown activeKey={question.type} items={questionTypes} onChange={handleTypeChange} />
        </MainInformation>
        {renderOptions()}
        <Footer>
          <Checkbox checked={question.optional} onChange={handleOptionMarkerChange}>
            Mark as optional
          </Checkbox>
          <CardActions>
            <DeleteIconButton
              onClick={handleQuestionRemove}
              $visible={isDeleteButtonVisible}
              fill="text"
              icon={<DeleteIcon />}
              rate="icon"
              aria-label="Delete Question"
            />
            <Button
              onClick={handleQuestionCopy}
              fill="text"
              icon={<CopyIcon />}
              rate="icon"
              aria-label="Copy Question"
            />
          </CardActions>
        </Footer>
      </Container>
    );
  }
);

export default QuestionCard;
