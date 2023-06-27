import React, { useMemo } from 'react';

import styled, { css } from 'styled-components';
import { DateTime } from 'luxon';

import { px, typography } from 'src/styles';
import { CarouselWrapper, CarouselItemWrapper, handleAddBase } from '../common';

type WithCarouselSize = { size: 's' | 'l' };

const TimeCarouselWrapper = styled(CarouselWrapper)<WithCarouselSize>`
  row-gap: ${px(15)};

  ${({ size }) => {
    const isL = size === 'l';

    return css`
      width: ${px(isL ? 220 : 130)};
      ${isL ? typography.sdkBodyXXLRegular : typography.sdkBodyLargeRegular};

      > :nth-child(2) {
        ${isL ? typography.headingLargeSemibold : typography.sdkBodyLargeSemibold};
      }
    `;
  }};
`;

const TimeValueContainer = styled.div`
  display: flex;
  flex: 1;
`;

const TimeRow = styled.div<WithCarouselSize>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  column-gap: ${({ size }) => px(size === 'l' ? 30 : 10)};
`;

const PmWrapper = styled(CarouselItemWrapper)`
  width: ${px(45)};
  flex: unset !important;
`;

type Props = {
  time: Date;
  onChange: (time: Date) => void;
} & WithCarouselSize;

const handleAddMinutes = (m: number, delta: number) => handleAddBase(m, delta, 60);
const handleAddHours = (h: number, delta: number) => handleAddBase(h, delta, 12) || 12;

const TimePicker: React.FC<Props> = ({ time, onChange, size }) => {
  const [hour, minute, a] = DateTime.fromJSDate(time).toFormat('hh mm a').split(' ');
  const [h, m] = [hour, minute].map((v) => Number.parseInt(v, 10));
  const isPm = a === 'PM';

  const rowsData = useMemo(
    () => [
      [handleAddHours(h, -1), handleAddMinutes(m, -1), ''],
      [h, m, a],
      [handleAddHours(h, 1), handleAddMinutes(m, 1), isPm ? 'AM' : 'PM'],
    ],
    [a, h, m, isPm]
  );

  return (
    <TimeCarouselWrapper size={size}>
      {rowsData.map((r, idx) => (
        <TimeRow key={r.join('-')} size={size}>
          <TimeValueContainer>
            <CarouselItemWrapper
              data-testid={`time-picker-carousel-item-hour-${idx}`}
              $nonClickable={idx === 1}
              onClick={() => {
                const newDate = new Date(time);
                newDate.setHours((r[0] as number) + (isPm && r[0] < 12 ? 12 : 0));
                onChange(newDate);
              }}
            >
              {r[0]}
            </CarouselItemWrapper>
            <CarouselItemWrapper $nonClickable>:</CarouselItemWrapper>
            <CarouselItemWrapper
              data-testid={`time-picker-carousel-item-minute-${idx}`}
              $nonClickable={idx === 1}
              onClick={() => {
                const newDate = new Date(time);
                newDate.setMinutes(r[1] as number);
                onChange(newDate);
              }}
            >
              {r[1].toString().padStart(2, '0')}
            </CarouselItemWrapper>
          </TimeValueContainer>
          <PmWrapper
            data-testid={`time-picker-pm-${idx}`}
            $nonClickable={idx === 1 || !r[2]}
            onClick={() => {
              const newDate = new Date(time);
              newDate.setHours(((h === 12 ? 0 : h) + (isPm ? 0 : 12)) % 24);
              onChange(newDate);
            }}
          >
            {r[2]}
          </PmWrapper>
        </TimeRow>
      ))}
    </TimeCarouselWrapper>
  );
};

export default TimePicker;
