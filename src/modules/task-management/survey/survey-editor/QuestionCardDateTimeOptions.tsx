import React from 'react';

import styled, { css } from 'styled-components';
import _xor from 'lodash/xor';
import _range from 'lodash/range';

import { px, colors, typography } from 'src/styles';
import { DateTimeQuestionConfig, DateTimeLabels } from 'src/modules/api/models';
import TimeIcon from 'src/assets/icons/time.svg';
import CalendarIcon from 'src/assets/icons/calendar.svg';
import CloseIcon from 'src/assets/icons/close.svg';
import PlusIcon from 'src/assets/icons/plus.svg';
import type { DateTimeQuestionItem } from './surveyEditor.slice';

const Container = styled.div`
  height: ${px(150)};
`;

const RowsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: ${px(16)};
`;

const CloseIconStyled = styled(CloseIcon)`
  fill: ${colors.primary};
  cursor: pointer;
  opacity: 0;
  pointer-events: none;
`;

const ItemBlock = styled.div`
  height: ${px(56)};
  width: ${px(200)};
  padding: ${px(16)};
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: ${colors.background};
  border-radius: ${px(4)};
  border: ${px(1)} solid ${colors.background};
  ${typography.bodyMediumRegular};

  svg {
    fill: ${colors.textSecondaryGray};
  }
`;

const RowContainer = styled.div`
  width: 100%;
  display: flex;
`;

const RowFiller = styled.div`
  flex: 1;
`;

const RowWrapper = styled.div<{ $hoverable?: boolean }>`
  display: flex;
  column-gap: ${px(16)};
  align-items: center;

  ${({ $hoverable }) =>
    $hoverable &&
    css`
      :hover {
        ${CloseIconStyled} {
          opacity: 1;
          pointer-events: all;
        }

        ${ItemBlock} {
          border-color: ${colors.primaryHovered};
        }
      }
    `}
`;

const ItemsWrapper = styled.div`
  display: flex;
  column-gap: ${px(24)};
`;

const AddContainer = styled.div`
  margin-top: ${px(32)};
`;

const AddRow = styled.div`
  display: flex;
  cursor: pointer;
`;

const PlusIconStyled = styled(PlusIcon)`
  fill: ${colors.primary};
  margin-right: ${px(10)};
`;

const AddTitle = styled.div`
  ${typography.bodyMediumSemibold};
  color: ${colors.primary};
`;

interface QuestionCardDateTimeOptionsProps {
  config: DateTimeQuestionConfig;
  onChange: (config: DateTimeQuestionConfig) => void;
  options: DateTimeQuestionItem['options'];
}

const QuestionCardDateTimeOptions: React.FC<QuestionCardDateTimeOptionsProps> = ({
  config,
  onChange,
  options,
}) => {
  const { isDate, isTime } = config;

  const rowItems: DateTimeLabels[] = [
    ...(isDate ? ['Date' as const] : []),
    ...(isTime ? ['Time' as const] : []),
  ];
  const numItems = options.isRange ? 2 : 1;

  return (
    <Container>
      <RowsWrapper>
        {rowItems.map((label) => {
          const isDateField = label === 'Date';

          return (
            <RowContainer key={label}>
              <RowWrapper $hoverable={rowItems.length > 1}>
                <ItemsWrapper>
                  {_range(numItems).map((idx) => (
                    <ItemBlock key={idx}>
                      {label}
                      {isDateField ? <CalendarIcon /> : <TimeIcon />}
                    </ItemBlock>
                  ))}
                </ItemsWrapper>
                {(isDate || isTime) && (
                  <CloseIconStyled
                    onClick={() =>
                      onChange({
                        ...config,
                        ...(isDateField ? { isDate: false } : { isTime: false }),
                      })
                    }
                  />
                )}
              </RowWrapper>
              <RowFiller />
            </RowContainer>
          );
        })}
      </RowsWrapper>
      {rowItems.length < 2 && (
        <AddContainer>
          {_xor(['Date', 'Time'], rowItems).map((label) => (
            <RowContainer key={label}>
              <AddRow
                data-testid="date-time-options-add-row"
                onClick={() =>
                  onChange({
                    ...config,
                    ...(label === 'Date' ? { isDate: true } : { isTime: true }),
                  })
                }
              >
                <PlusIconStyled />
                <AddTitle>Add {label}</AddTitle>
              </AddRow>
              <RowFiller />
            </RowContainer>
          ))}
        </AddContainer>
      )}
    </Container>
  );
};

export default QuestionCardDateTimeOptions;
