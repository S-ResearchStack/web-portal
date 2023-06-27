import React, { ChangeEvent, ForwardedRef, forwardRef, useCallback, useMemo, useRef } from 'react';

import styled, { css } from 'styled-components';

import Dropdown, { MenuItem } from 'src/common/components/Dropdown';
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

import { colors, px, typography } from 'src/styles';
import Button from 'src/common/components/Button';
import Toggle from 'src/common/components/Toggle';
import { laptopMq, useMatchDeviceScreen } from 'src/common/components/SimpleGrid';
import TextArea, { TextAreaProps } from 'src/modules/study-management/common/TextArea';
import withLocalDebouncedState from 'src/common/withLocalDebouncedState';
import combineRefs from 'src/common/utils/combineRefs';
import Tooltip from 'src/common/components/Tooltip';
import { getQuestionHandler } from './questions';
import ChangeSkipLogicButton from './skip-logic/ChangeSkipLogicButton';
import { ConfirmOptionRemovalFn } from './questions/common/types';
import {
  QuestionItem,
  QuestionOptionKey,
  QuestionType,
  SurveyQuestionErrors,
} from './surveyEditor.slice';

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

const DeleteIconButton = styled(StyledButton)<{ $visible?: boolean }>`
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

const ComingSoonTooltipText = styled.span`
  font-family: 'Fira Code';
  font-size: ${px(14)};
  line-height: '130%';
  font-weight: 450;
`;
const ComingSoonTooltip: React.FC<React.PropsWithChildren> = ({ children }) => (
  <Tooltip
    content={<ComingSoonTooltipText>Coming soon</ComingSoonTooltipText>}
    trigger="hover"
    position="atl"
    horizontalPaddings="l"
    arrow
    static
    styles={{ zIndex: 1, transform: `translateY(${px(10)})` }}
  >
    {children}
  </Tooltip>
);

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

const questionTypes = [
  { label: 'Single-selection', key: 'single' as const, icon: <RadioCheckedIcon /> },
  { label: 'Multi-selection', key: 'multiple' as const, icon: <CheckboxCheckedIcon /> },
  { label: 'Slider scale', key: 'slider' as const, icon: <SliderIcon /> },
  { label: 'Dropdown', key: 'dropdown' as const, icon: <SubtractIcon /> },
  { label: 'Ranking', key: 'rank' as const, icon: <RankIcon /> },
  { label: 'Image selection', key: 'images' as const, icon: <ImageIcon /> },
  { label: 'Open-ended', key: 'open-ended' as const, icon: <EditIcon /> },
  { label: 'Date & Time', key: 'date-time' as const, icon: <CalendarIconStyled /> },
];

const optionsNames = {
  optional: 'Mark as optional',
  multiSelect: 'Multi-selection',
  imageLabels: 'Image label',
  isRange: 'Add range',
  includeOther: 'Include ‘Other’ option',
};

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

    const handleQuestionCopy = () => onCopy?.(question);
    const handleQuestionRemove = () => onRemove?.(question);

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
        data-testid={`question-${question.id}`}
      >
        <HeaderContainer>
          <QuestionNumber>Question {index + 1}</QuestionNumber>
          <ChangeSkipLogicButton question={question} />
        </HeaderContainer>
        <MainInformation>
          <TitleContainer>
            <TitleTextField
              sizeUpdaterUniqueValue={updater}
              autoHeight
              placeholder="Enter question*"
              value={question.title}
              onChange={handleTitleChange}
              invalid={errors?.title.empty}
              maxLength={256}
            />
            <DescriptionTextField
              sizeUpdaterUniqueValue={updater}
              autoHeight
              appearance="description"
              placeholder="Add question description (optional)"
              value={question.description}
              onChange={handleDescriptionChange}
              readOnly={isDescriptionReadonly}
              maxLength={256}
            />
          </TitleContainer>
          <Dropdown
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
            {(
              [
                'optional',
                'imageLabels',
                'multiSelect',
                'isRange',
                // 'includeOther', // TODO: currently not supported by API
              ] as QuestionOptionKey[]
            )
              .filter((ot) => ot in question.options)
              .map((ot) => ot as keyof typeof question.options)
              .map((ot) => {
                const isDisabled = ot === 'optional';

                const t = (
                  <Toggle
                    key={ot}
                    checked={question.options[ot]}
                    disabled={isDisabled}
                    onChange={(evt) => {
                      handleChange({
                        options: {
                          ...question.options,
                          [ot]: evt.target.checked,
                        },
                      });
                    }}
                    label={optionsNames[ot]}
                  />
                );

                if (isDisabled) {
                  return <ComingSoonTooltip key={ot}>{t}</ComingSoonTooltip>;
                }
                return t;
              })}
          </QuestionActions>
          <CardActions>
            <DeleteIconButton
              onClick={handleQuestionRemove}
              $visible={isDeleteButtonVisible}
              fill="text"
              icon={<DeleteIcon />}
              rate="icon"
              aria-label="Delete Question"
              rippleOff
            />
            <StyledButton
              onClick={handleQuestionCopy}
              fill="text"
              icon={<CopyIcon />}
              rate="icon"
              aria-label="Copy Question"
              rippleOff
            />
          </CardActions>
        </Footer>
      </Container>
    );
  }
);

export default QuestionCard;
