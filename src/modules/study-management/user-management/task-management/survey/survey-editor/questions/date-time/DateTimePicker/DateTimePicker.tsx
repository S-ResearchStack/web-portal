import React, { useMemo } from 'react';

import styled from 'styled-components';
import { DateTime } from 'luxon';

import { px, typography } from 'src/styles';
import TimePicker from '../TimePicker/TimePicker';
import { CarouselWrapper, CarouselItemWrapper } from '../common';

const DateTimeContainer = styled.div`
  margin-bottom: ${px(145)};
  padding: 0 ${px(25)};
  display: flex;
  justify-content: space-between;
`;

const DateValueContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
`;

const DatePicker = styled(CarouselWrapper)`
  display: flex;
  flex-direction: column;
  row-gap: ${px(15)};
  ${typography.sdkBodyLargeRegular};

  > :nth-child(2) {
    ${typography.sdkBodyLargeSemibold};
  }
`;

type Props = {
  time: Date;
  date: Date;
  onChange: (date: Date, time: Date) => void;
};

const DateTimePicker: React.FC<Props> = ({ time, date, onChange }) => {
  const luxonDate = DateTime.fromJSDate(date);

  const dates = useMemo(
    () => [luxonDate.minus({ days: 1 }), luxonDate, luxonDate.plus({ days: 1 })],
    [luxonDate]
  );

  return (
    <DateTimeContainer>
      <DatePicker>
        {dates.map((d, idx) => (
          <DateValueContainer key={d.toISODate()}>
            <CarouselItemWrapper
              data-testid={`date-time-picker-carousel-item-date-${idx}`}
              $nonClickable={idx === 1}
              onClick={() => onChange(d.toJSDate(), time)}
            >
              {d.toFormat('ccc, MMM d')}
            </CarouselItemWrapper>
          </DateValueContainer>
        ))}
      </DatePicker>
      <TimePicker time={time} onChange={(t) => onChange(date, t)} size="s" />
    </DateTimeContainer>
  );
};

export default DateTimePicker;
