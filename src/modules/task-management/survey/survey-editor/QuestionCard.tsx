import React, { ChangeEvent, ForwardedRef, forwardRef, useCallback, useMemo, useRef } from 'react';

import styled, { css } from 'styled-components';

import Dropdown, { MenuItem } from 'src/common/components/Dropdown';
import { colors, px, typography } from 'src/styles';
import Button from 'src/common/components/Button';
import Toggle from 'src/common/components/Toggle';
import { laptopMq, useMatchDeviceScreen } from 'src/common/components/SimpleGrid';
import TextArea, { TextAreaProps } from 'src/common/components/TextArea';
import withLocalDebouncedState from 'src/common/withLocalDebouncedState';
import combineRefs from 'src/common/utils/combineRefs';
import { getQuestionHandler } from './questions';
import { ConfirmOptionRemovalFn } from './questions/common/types';
import {
  QuestionItem,
  QuestionType,
  SurveyQuestionErrors,
} from './surveyEditor.slice';
import { useTranslation } from 'src/modules/localization/useTranslation';

import CheckboxCheckedIcon from 'src/assets/icons/checkbox_checked.svg';
import CopyIcon from 'src/assets/icons/copy.svg';
import DeleteIcon from 'src/assets/icons/trash_can.svg';
import RadioCheckedIcon from 'src/assets/icons/radio_checked.svg';
import SliderIcon from 'src/assets/icons/slider.svg';
import ImageIcon from 'src/assets/icons/image.svg';
import RankIcon from 'src/assets/icons/rank.svg';
import SubtractIcon from 'src/assets/icons/subtract.svg';
import EditIcon from 'src/assets/icons/edit_open_ended.svg';
import CalendarIcon from 'src/assets/icons/calendar.svg';

export const QUESTION_CARD_HEIGHT = 344;
export const QUESTION_CARD_LOADER_TITLE_WIDTH = 258;

const Container = styled.div`
  width: 100%;
  padding: ${px(24)};
  min-height: ${px(QUESTION_CARD_HEIGHT)};
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: ${px(21)};
`;

const QuestionNumber = styled.div`
  ${typography.headingXSmall};
  color: ${colors.textPrimary};
`;

const TitleTextField = withLocalDebouncedState<HTMLTextAreaElement, TextAreaProps>(styled(TextArea)`
  max-height: ${px(80)};
  &::placeholder {
    color: ${({ theme, invalid }) => invalid && theme.colors.statusErrorText};
  }
`);

const DescriptionTextField = withLocalDebouncedState<HTMLTextAreaElement, TextAreaProps>(styled(
  TextArea
)`
  padding-left: ${px(16)};
`);

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
  flex-wrap: wrap;
  justify-content: space-between;
  margin-top: ${px(45)};
  row-gap: ${px(32)};

  @media screen and ${laptopMq.media} {
    margin-top: ${px(38)};
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-end;
  }
`;

const CardActions = styled.div`
  height: ${px(24)};
  display: grid;
  align-items: center;
  gap: ${px(16)};
  grid-template-columns: repeat(2, ${px(24)});
  flex-grow: 1;
  justify-content: flex-end;
  margin-left: ${px(24)};

  @media screen and ${laptopMq.media} {
    margin-left: 0;
  }
`;

const QuestionActions = styled.div<{ compact?: boolean }>`
  height: ${px(24)};
  display: flex;
  align-items: center;
  gap: ${px(16)};

  @media screen and ${laptopMq.media} {
    gap: ${(p) => px(p.compact ? 16 : 24)};
  }
`;

export const StyledButton = styled(Button)`
  background-color: transparent !important;
`;

const DeleteIconButton = styled(StyledButton) <{ $visible?: boolean }>`
  ${({ $visible }) =>
    !$visible &&
    css`
      opacity: 0;
      pointer-events: none;
    `}
`;

const Item = styled(MenuItem)`
  width: ${px(193)};
`;

const CalendarIconStyled = styled(CalendarIcon)`
  fill: ${colors.primary};
`;

interface QuestionCardProps {
  surveyId: string;
  question: QuestionItem;
  errors?: SurveyQuestionErrors;
  index: number;
  className?: string;
  onChange?: (data: QuestionItem) => void;
  onUpdateQuestionType?: (payload: Pick<QuestionItem, 'id' | 'type'>) => void;
  onCopy?: (data: QuestionItem) => void;
  onRemove?: (data: QuestionItem) => void;
  isDeleteButtonVisible: boolean;
  compactCardView?: boolean;
  confirmOptionRemoval: ConfirmOptionRemovalFn;
}

const QuestionCard = forwardRef(
  (
    {
      surveyId,
      className,
      question,
      errors,
      index,
      onChange,
      onCopy,
      onRemove,
      isDeleteButtonVisible,
      onUpdateQuestionType,
      compactCardView,
      confirmOptionRemoval,
    }: QuestionCardProps,
    ref: ForwardedRef<HTMLDivElement>
  ) => {
    const { t } = useTranslation();
    const questionTypes = [
      { label: t('LABEL_QUESTION_TYPE_SINGLE'), key: 'single' as const, icon: <RadioCheckedIcon /> },
      { label: t('LABEL_QUESTION_TYPE_MULTI'), key: 'multiple' as const, icon: <CheckboxCheckedIcon /> },
      { label: t('LABEL_QUESTION_TYPE_DROPDOWN'), key: 'dropdown' as const, icon: <SubtractIcon /> },
      { label: t('LABEL_QUESTION_TYPE_IMAGE'), key: 'images' as const, icon: <ImageIcon /> },
      { label: t('LABEL_QUESTION_TYPE_SLIDER'), key: 'slider' as const, icon: <SliderIcon /> },
      { label: t('LABEL_QUESTION_TYPE_OPEN_ENDED'), key: 'open-ended' as const, icon: <EditIcon /> },
      { label: t('LABEL_QUESTION_TYPE_DATE_TIME'), key: 'date-time' as const, icon: <CalendarIconStyled /> },
      { label: t('LABEL_QUESTION_TYPE_RANKING'), key: 'rank' as const, icon: <RankIcon /> },
    ];
    
    const options = {
      optional: t('LABEL_QUESTION_OPTION_OPTIONAL'),
      isRange: t('LABEL_QUESTION_OPTION_RANGE'),
      imageLabels: t('LABEL_QUESTION_OPTION_IMAGE_LABEL'),
    };
    const matchedDevice = useMatchDeviceScreen();
    const handleChange = useCallback(
      (q: Partial<QuestionItem>) => {
        onChange?.({ ...question, ...q } as typeof question);
      },
      [onChange, question]
    );

    const handleTitleChange = (evt: ChangeEvent<HTMLTextAreaElement>) =>
      handleChange({ title: evt.target.value });
    const changeDescription = (description: string) => handleChange({ description });
    const handleDescriptionChange = (evt: ChangeEvent<HTMLTextAreaElement>) =>
      changeDescription(evt.target.value);
    const handleTypeChange = (type: QuestionType) =>
      onUpdateQuestionType?.({ id: question.id, type });

    const handleQuestionRemove = () => onRemove?.(question);
    const handleQuestionCopy = () => onCopy?.(question);

    const isDescriptionReadonly = question.type === 'images';

    const updater = useMemo(
      () => [matchedDevice, compactCardView],
      [matchedDevice, compactCardView]
    );

    const containerRef = useRef<HTMLDivElement>(null);

    return (
      <Container
        className={className}
        ref={combineRefs([ref, containerRef])}
        data-id={question.id}
        data-testid={`question-${index + 1}`}
      >
        <HeaderContainer>
          <QuestionNumber>Question {index + 1}</QuestionNumber>
        </HeaderContainer>
        <MainInformation>
          <TitleContainer>
            <TitleTextField
              data-testid={`question-title-${index + 1}`}
              sizeUpdaterUniqueValue={updater}
              autoHeight
              placeholder={t('PLACEHOLDER_ENTER_SURVEY_QUESTION_TITLE')}
              value={question.title}
              onChange={handleTitleChange}
              invalid={errors?.title.empty}
              maxLength={256}
            />
            <DescriptionTextField
              sizeUpdaterUniqueValue={updater}
              autoHeight
              appearance="description"
              placeholder={t('PLACEHOLDER_ENTER_SURVEY_QUESTION_DESCRIPTION')}
              value={question.description}
              onChange={handleDescriptionChange}
              readOnly={isDescriptionReadonly}
              maxLength={256}
            />
          </TitleContainer>
          <Dropdown
            data-testid='dropdown-question-type'
            activeKey={question.type}
            items={questionTypes}
            onChange={handleTypeChange}
            maxVisibleMenuItems={4}
            menuItemComponent={Item}
          />
        </MainInformation>
        {getQuestionHandler(question.type).renderEditorContent({
          surveyId,
          containerRef,
          question,
          onChange: handleChange,
          compact: compactCardView,
          confirmOptionRemoval,
        })}
        <Footer>
          <QuestionActions compact={compactCardView}>
            {Object.keys(options)
              .filter((ot) => ot in question.options)
              .map((ot) => ot as keyof typeof question.options)
              .map((ot) => (
                <Toggle
                  key={ot}
                  checked={question.options[ot]}
                  onChange={(evt) => {
                    handleChange({
                      options: {
                        ...question.options,
                        [ot]: evt.target.checked,
                      },
                    });
                  }}
                  label={options[ot]}
                />
              ))}
          </QuestionActions>
          <CardActions>
            <DeleteIconButton
              rippleOff
              fill="text"
              rate="icon"
              aria-label="Delete Question"
              data-testid={`delete-question-${index + 1}`}
              $visible={isDeleteButtonVisible}
              icon={<DeleteIcon />}
              onClick={handleQuestionRemove}
            />
            <StyledButton
              rippleOff
              fill="text"
              rate="icon"
              aria-label="Copy Question"
              data-testid={`copy-question-${index + 1}`}
              icon={<CopyIcon />}
              onClick={handleQuestionCopy}
            />
          </CardActions>
        </Footer>
      </Container>
    );
  }
);

export default QuestionCard;
