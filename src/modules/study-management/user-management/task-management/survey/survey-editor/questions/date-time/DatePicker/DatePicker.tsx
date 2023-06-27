import React, { useMemo } from 'react';

import styled from 'styled-components';
import { DateTime, Info } from 'luxon';

import { px, typography } from 'src/styles';
import { CarouselWrapper, CarouselItemWrapper, handleAddBase } from '../common';

const DateColumn = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
`;

const DateWrapper = styled(CarouselWrapper)`
  row-gap: ${px(30)};
  margin-bottom: ${px(150)};
  ${typography.sdkHeadingMedium};
`;

type Props = {
  date: Date;
  onChange: (date: Date) => void;
};

const handleAddMonths = (m: number, delta: number) => handleAddBase(m, delta, 12);
const handleAddDays = (m: number, delta: number, base: number) => handleAddBase(m, delta, base);
const handleAddYears = (y: number, delta: number) => y + delta;

const monthsNames = Info.monthsFormat('short');

const DatePicker: React.FC<Props> = ({ date, onChange }) => {
  const luxonDate = DateTime.fromJSDate(date);
  const { month, day, year, daysInMonth } = luxonDate;
  const actualMonth = month - 1;
  const actualDay = day - 1;

  const dates = useMemo(
    () => [
      [
        handleAddMonths(actualMonth, -1),
        handleAddDays(actualDay, -1, daysInMonth),
        handleAddYears(year, -1),
      ],
      [actualMonth, actualDay, year],
      [
        handleAddMonths(actualMonth, 1),
        handleAddDays(actualDay, 1, daysInMonth),
        handleAddYears(year, 1),
      ],
    ],
    [actualMonth, actualDay, year, daysInMonth]
  );

  return (
    <DateWrapper>
      {dates.map((r, idx) => (
        <DateColumn key={r.join('-')}>
          <CarouselItemWrapper
            data-testid={`date-picker-carousel-item-month-${idx}`}
            $nonClickable={idx === 1}
            onClick={() => {
              const newDate = luxonDate.set({ month: r[0] + 1 });
              onChange(newDate.toJSDate());
            }}
          >
            {monthsNames[r[0]].toUpperCase()}
          </CarouselItemWrapper>
          <CarouselItemWrapper
            data-testid={`date-picker-carousel-item-day-${idx}`}
            $nonClickable={idx === 1}
            onClick={() => {
              const newDate = luxonDate.set({ day: r[1] + 1 });
              onChange(newDate.toJSDate());
            }}
          >
            {(r[1] + 1).toString().padStart(2, '0')}
          </CarouselItemWrapper>
          <CarouselItemWrapper
            data-testid={`date-picker-carousel-item-year-${idx}`}
            $nonClickable={idx === 1}
            onClick={() => {
              const newDate = luxonDate.set({ year: r[2] });
              onChange(newDate.toJSDate());
            }}
          >
            {r[2]}
          </CarouselItemWrapper>
        </DateColumn>
      ))}
    </DateWrapper>
  );
};

export default DatePicker;
