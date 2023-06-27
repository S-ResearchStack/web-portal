import React, { useState } from 'react';

import styled, { css } from 'styled-components';
import { DateTime } from 'luxon';

import { px, colors, typography } from 'src/styles';
import CalendarPopover from 'src/common/components/DatePicker/CalendarPopover';
import TimeIcon from 'src/assets/icons/time_small.svg';
import CalendarIcon from 'src/assets/icons/calendar_small.svg';
import RangeTimePicker from './RangeTimePicker/RangeTimePicker';

const CalendarPopoverStyled = styled(CalendarPopover)`
  box-shadow: none;
`;

const RangeWrapper = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: ${px(12)};
`;

const RangeRow = styled.div`
  display: flex;
  justify-content: center;
  column-gap: ${px(12)};
`;

const RangeItem = styled.div<{ $disabled?: boolean; $active?: boolean }>`
  display: flex;
  align-items: center;
  flex: 1;
  justify-content: space-between;
  padding: ${px(9)} ${px(12)};
  height: ${px(36)};
  border-radius: ${px(3)};
  border-style: solid;
  border-width: ${px(1)};
  border-color: ${({ $active, $disabled }) => {
    if ($disabled) {
      return colors.disabled20;
    }
    if ($active) {
      return colors.primary;
    }
    return colors.primaryDisabled;
  }};
  color: ${({ $active, $disabled }) => {
    if ($disabled) {
      return colors.textDisabled;
    }
    if ($active) {
      return colors.textPrimary;
    }
    return colors.textSecondaryGray;
  }};

  ${({ $disabled }) =>
    css`
      background-color: ${$disabled ? colors.disabled20 : colors.surface};
      ${$disabled ? typography.sdkBodyMediumRegular : typography.bodyMediumRegular};
      cursor: ${$disabled ? 'default' : 'pointer'};
      pointer-events: ${$disabled && 'none'};

      svg {
        fill: ${$disabled ? colors.textDisabled : colors.primary};
      }
    `};
`;

type RangeLabel = 'Start' | 'End';

type Props = {
  hasDate?: boolean;
  hasTime?: boolean;
  datesRange: Date[];
  timesRange: Date[];
  onChange: (d: Date[], t: Date[]) => void;
};

const DateTimeRangePreview: React.FC<Props> = ({
  hasDate,
  hasTime,
  datesRange,
  timesRange,
  onChange,
}) => {
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [timePickerTarget, setTimePickerTarget] = useState<RangeLabel | undefined>();

  const rangeLabels: RangeLabel[] = ['Start', 'End'];

  return (
    <RangeWrapper>
      {hasDate && (
        <div>
          <RangeRow>
            {rangeLabels.map((label, index) => {
              const date = datesRange[index];

              return (
                <RangeItem
                  data-testid={`date-time-range-preview-range-item-${index}`}
                  key={label}
                  onClick={() => setIsCalendarVisible(!isCalendarVisible)}
                  $active={!!date || (label === 'Start' && isCalendarVisible)}
                >
                  {date ? DateTime.fromJSDate(date).toFormat('MM/dd/yyyy') : label}
                  <CalendarIcon />
                </RangeItem>
              );
            })}
          </RangeRow>
          {isCalendarVisible && (
            <CalendarPopoverStyled
              data-testid="calendar-popover-preview"
              selectedRange={datesRange}
              onSelectedRangeChange={(newRange) => onChange(newRange, timesRange)}
            />
          )}
        </div>
      )}
      {hasTime && (
        <RangeRow>
          {rangeLabels.map((label, idx) => {
            const time = timesRange[idx];

            return (
              <RangeItem
                data-testid={`date-time-range-preview-range-time-item-${idx}`}
                key={label}
                $disabled={hasDate && datesRange.length < 2}
                $active={timePickerTarget === label || !!time}
                onClick={() => setTimePickerTarget(label)}
              >
                {time ? DateTime.fromJSDate(time).toFormat('hh:mma') : label}
                <TimeIcon />
              </RangeItem>
            );
          })}
        </RangeRow>
      )}
      {!!timePickerTarget && (
        <RangeTimePicker
          time={timesRange[rangeLabels.indexOf(timePickerTarget)]}
          onClose={() => setTimePickerTarget(undefined)}
          onChange={(t) => {
            const newRange = [...timesRange];
            newRange[rangeLabels.indexOf(timePickerTarget)] = t;
            onChange(datesRange, newRange);
          }}
        />
      )}
    </RangeWrapper>
  );
};

export default DateTimeRangePreview;
