import React from 'react';

import styled from 'styled-components';

import { px } from 'src/styles';
import { DateTimeQuestionConfig } from 'src/modules/api/models';
import type { DateTimeAnswers } from '../common/types';
import DateTimeRangePreview from './DateTimeRangePreview/DateTimeRangePreview';
import type { DateTimeQuestionItem } from '..';
import TimePicker from './TimePicker/TimePicker';
import DateTimePicker from './DateTimePicker/DateTimePicker';
import DatePicker from './DatePicker/DatePicker';

const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const CarouselContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const TimePickerContainer = styled.div`
  margin-bottom: ${px(100)};
  padding: 0 ${px(40)};
`;

interface DateTimePreviewProps {
  config: DateTimeQuestionConfig;
  options: DateTimeQuestionItem['options'];
  answers: DateTimeAnswers;
  onAnswersChange: (newAnswers: DateTimeAnswers) => void;
}

const DateTimePreview: React.FC<DateTimePreviewProps> = ({
  config,
  options,
  answers,
  onAnswersChange,
}) => {
  const { isDate, isTime } = config;
  const { date, time, datesRange, timesRange } = answers;

  let content;

  if (options.isRange) {
    content = (
      <DateTimeRangePreview
        datesRange={datesRange}
        timesRange={timesRange}
        hasDate={isDate}
        hasTime={isTime}
        onChange={(d: Date[], t: Date[]) =>
          onAnswersChange({ ...answers, datesRange: d, timesRange: t })
        }
      />
    );
  } else {
    let carouselContent;

    if (isDate && isTime) {
      carouselContent = (
        <DateTimePicker
          date={date}
          time={time}
          onChange={(d, t) => onAnswersChange({ ...answers, time: t, date: d })}
        />
      );
    } else if (isDate) {
      carouselContent = (
        <DatePicker date={date} onChange={(d) => onAnswersChange({ ...answers, date: d })} />
      );
    } else if (isTime) {
      carouselContent = (
        <TimePickerContainer>
          <TimePicker
            time={time}
            onChange={(t) => onAnswersChange({ ...answers, time: t })}
            size="l"
          />
        </TimePickerContainer>
      );
    }

    content = <CarouselContainer>{carouselContent}</CarouselContainer>;
  }

  return <Container>{content}</Container>;
};

export default DateTimePreview;
