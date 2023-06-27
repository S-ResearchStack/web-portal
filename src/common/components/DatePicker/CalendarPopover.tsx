import React, { FC, useEffect, useMemo, useState } from 'react';
import _range from 'lodash/range';
import { DateTime } from 'luxon';

import styled from 'styled-components';

import ChevronLeftIcon from 'src/assets/icons/calendar_chevron_left.svg';
import ChevronRightIcon from 'src/assets/icons/calendar_chevron_right.svg';
import { ExtendProps } from 'src/common/utils/types';
import Ripple, { useRipple } from 'src/common/components/Ripple';
import { animation, colors, px, typography } from 'src/styles';

const Container = styled.div`
  width: ${px(312)};
  height: ${px(336)};
  padding: ${px(24)};
  background: ${colors.backgroundSurface};
  border-radius: ${px(4)};
  box-shadow: ${px(0)} ${px(5)} ${px(12)} rgba(0, 0, 0, 0.12); // TODO unknown color
  display: flex;
  flex-direction: column;
  z-index: 1;
  :hover {
    cursor: default;
  }
`;

const NavigationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  svg {
    fill: ${colors.textPrimary};
  }
`;

const ControlButtonContainer = styled.button<ControlButtonProps>`
  border: none;
  background-color: transparent;
  height: ${px(24)};
  width: ${px(24)};
  flex: ${px(24)} 0 auto;
  padding: 0;
  margin: 0 ${px(8)};
  border-radius: 50%;
  position: relative;
  z-index: 0;
  transition: background-color 300ms ${animation.defaultTiming};

  &:last-child {
    margin-right: 0;
  }

  &:enabled:hover {
    background-color: ${colors.black08};
    cursor: pointer;
  }

  svg {
    fill: ${colors.textPrimary};
    transition: fill 300ms ${animation.defaultTiming};
  }

  &:disabled {
    svg {
      fill: ${colors.disabled};
    }
  }
`;

const ControlButtonContent = styled.span`
  position: relative;
  z-index: 2;
  display: block;
`;

type ControlButtonProps = React.PropsWithChildren<{ active?: boolean }> &
  React.ButtonHTMLAttributes<HTMLButtonElement>;

// eslint-disable-next-line react/prop-types
const ControlButton: FC<ControlButtonProps> = ({ children, disabled, ...props }) => {
  const { rippleProps, addRippleTriggerProps, handleRippleOut } = useRipple<
    HTMLButtonElement,
    ControlButtonProps
  >({});

  useEffect(() => {
    if (disabled) {
      handleRippleOut(undefined, { force: true });
    }
  }, [disabled, handleRippleOut]);

  return (
    <ControlButtonContainer {...addRippleTriggerProps(props)} disabled={disabled}>
      <ControlButtonContent>{children}</ControlButtonContent>
      <Ripple {...rippleProps} />
    </ControlButtonContainer>
  );
};

const NavigationButton = styled(ControlButton)`
  margin: 0;
`;

const HeaderText = styled.div`
  color: ${colors.textPrimary};
  ${typography.bodyMediumSemibold};
`;

const NUM_WEEKS_DISPLAYED = 6;
const NUM_DAYS_PER_WEEK = 7;

const CalendarContainer = styled.div<{ $isRange?: boolean }>`
  margin-top: ${px(16)};
  display: grid;
  grid-template-columns: repeat(${NUM_DAYS_PER_WEEK}, ${px(36)});
  grid-template-rows: ${px(32)} repeat(${NUM_WEEKS_DISPLAYED}, ${px(36)});
  column-gap: ${({ $isRange }) => !$isRange && px(2)};
  align-self: center;
`;

const CalendarItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const WeekdayItem = styled(CalendarItem)`
  ${typography.bodyXSmallRegular};
  color: ${colors.textSecondaryGray};
`;

const DateItem = styled(CalendarItem)<{
  $isDisabled: boolean;
  $isOtherMonth: boolean;
  $isSelected: boolean;
  $isInRange?: boolean;
}>`
  ${typography.bodyMediumRegular};
  ${({ $isInRange }) =>
    $isInRange ? typography.bodyMediumSemibold : typography.bodyMediumRegular};
  border-radius: ${({ $isInRange }) => !$isInRange && px(2)};
  color: ${({ theme, $isSelected, $isDisabled, $isOtherMonth }) =>
    ($isSelected && theme.colors.primaryWhite) ||
    ($isDisabled && theme.colors.disabled) ||
    ($isOtherMonth && theme.colors.textSecondaryGray) ||
    theme.colors.textPrimary};
  background-color: ${({ theme, $isSelected, $isInRange }) => {
    if ($isSelected) {
      return theme.colors.primary;
    }
    if ($isInRange) {
      return theme.colors.primaryLight;
    }

    return '';
  }};
  &:hover {
    background-color: ${({ theme, $isSelected, $isDisabled }) =>
      !$isSelected && !$isDisabled && theme.colors.primaryLight};
    cursor: ${({ $isDisabled }) => !$isDisabled && 'pointer'};
  }
`;

type Props = ExtendProps<
  React.HTMLAttributes<HTMLDivElement>,
  {
    selectedDate?: Date;
    selectedRange?: Date[];
    onSelectedDateChange?: (d: Date) => void;
    onSelectedRangeChange?: (d: Date[]) => void;
    minAllowedDate?: Date;
    maxAllowedDate?: Date;
  }
>;

const weekdayLabels = _range(0, NUM_DAYS_PER_WEEK).map(
  (d) => DateTime.fromObject({ weekday: d + 1 }).weekdayShort
);

const isSameDate = (a: Date, b: DateTime) => DateTime.fromJSDate(a).hasSame(b, 'day');

const CalendarPopover = React.forwardRef(
  (
    {
      selectedDate,
      selectedRange,
      onSelectedDateChange,
      onSelectedRangeChange,
      minAllowedDate,
      maxAllowedDate,
      ...rest
    }: Props,
    ref: React.ForwardedRef<HTMLDivElement>
  ) => {
    const [currentMonth, setCurrentMonth] = useState(
      DateTime.fromJSDate((selectedRange ? selectedRange[0] : selectedDate) || new Date())
    );
    const adjustCurrentMonth = (change: number) =>
      setCurrentMonth(currentMonth.plus({ months: change }));

    const dates = useMemo(() => {
      const startDate = currentMonth.startOf('month').startOf('week');
      return _range(0, NUM_WEEKS_DISPLAYED * NUM_DAYS_PER_WEEK)
        .map((offsetDays) => startDate.plus({ days: offsetDays }))
        .map((d) => {
          const isCurrentMonth = d.hasSame(currentMonth, 'month');
          const isDisabled =
            (!!minAllowedDate &&
              d.startOf('day') < DateTime.fromJSDate(minAllowedDate).startOf('day')) ||
            (!!maxAllowedDate &&
              d.startOf('day') > DateTime.fromJSDate(maxAllowedDate).startOf('day'));

          return (
            <DateItem
              data-testid={isDisabled ? undefined : `calendar-popover-enabled-date`}
              data-date={d.startOf('day')}
              key={d.toISODate()}
              $isDisabled={isDisabled}
              $isOtherMonth={!isCurrentMonth}
              $isSelected={[...(selectedRange || []), selectedDate].some(
                (sDate) => sDate && isSameDate(sDate, d)
              )}
              $isInRange={
                selectedRange &&
                selectedRange[0] &&
                selectedRange[1] &&
                d.startOf('day') < DateTime.fromJSDate(selectedRange[1]).startOf('day') &&
                d.startOf('day') > DateTime.fromJSDate(selectedRange[0]).startOf('day')
              }
              onClick={() => {
                if (isDisabled) {
                  return;
                }

                if (selectedRange) {
                  if ([selectedRange[0]].some((sDate) => isSameDate(sDate, d))) {
                    onSelectedRangeChange?.([]);
                  } else if (!selectedRange[0] || (selectedRange[0] && selectedRange[1])) {
                    onSelectedRangeChange?.([d.startOf('day').toJSDate()]);
                  } else {
                    let newRange = [...selectedRange];
                    newRange[1] = d.startOf('day').toJSDate();
                    if (newRange[1] < newRange[0]) {
                      newRange = [newRange[1], newRange[0]];
                    }

                    onSelectedRangeChange?.(newRange);
                  }
                } else {
                  if (!isCurrentMonth) {
                    setCurrentMonth(d);
                  }

                  onSelectedDateChange?.(d.toJSDate());
                }
              }}
            >
              {d.day}
            </DateItem>
          );
        });
    }, [
      currentMonth,
      selectedDate,
      selectedRange,
      onSelectedDateChange,
      onSelectedRangeChange,
      minAllowedDate,
      maxAllowedDate,
    ]);

    return (
      <Container {...rest} ref={ref}>
        <NavigationHeader>
          <NavigationButton onClick={() => adjustCurrentMonth(-1)}>
            <ChevronLeftIcon />
          </NavigationButton>
          <HeaderText>{currentMonth.toFormat('MMMM yyyy')}</HeaderText>
          <NavigationButton onClick={() => adjustCurrentMonth(1)}>
            <ChevronRightIcon />
          </NavigationButton>
        </NavigationHeader>
        <CalendarContainer $isRange={!!selectedRange}>
          {weekdayLabels.map((d) => (
            <WeekdayItem key={`weekday-${d}`}>{d}</WeekdayItem>
          ))}
          {dates}
        </CalendarContainer>
      </Container>
    );
  }
);

export default CalendarPopover;
