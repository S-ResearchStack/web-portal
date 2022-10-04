import React, { FC } from 'react';
import styled from 'styled-components';

import { px } from 'src/styles';
import DatePicker from 'src/common/components/DatePicker';
import { InputFieldShell } from 'src/common/components/InputField';
import CheckBox from 'src/common/components/CheckBox';
import { Timestamp } from 'src/common/utils/datetime';

import { FormBlock, FormSection } from './Form';

const DateInputShell = styled(InputFieldShell)`
  width: ${px(312)};
`;

const EndDateContainer = styled.div`
  position: relative;
`;

const ExpirationCheckbox = styled(CheckBox)`
  position: absolute;
  right: 0;
  top: ${px(-9.5)};
`;

interface SurveySeriesProps {
  noExpiration: boolean;
  startDate: Timestamp;
  endDate: Timestamp;
  minAllowedDate: Timestamp;
  onStartDateChange: (date: Timestamp) => void;
  onEndDateChange: (date: Timestamp) => void;
  onChangeExpiration: (checked: boolean) => void;
}

const SurveySeries: FC<SurveySeriesProps> = ({
  noExpiration,
  startDate,
  endDate,
  minAllowedDate,
  onStartDateChange,
  onEndDateChange,
  onChangeExpiration,
}) => (
  <FormBlock label="Survey series">
    <FormSection>
      <DateInputShell label="Start date">
        <DatePicker
          value={new Date(startDate)}
          min={new Date(minAllowedDate)}
          max={!noExpiration ? new Date(endDate) : undefined}
          onChange={(date) => onStartDateChange(date.getTime())}
        />
      </DateInputShell>
      <EndDateContainer>
        <ExpirationCheckbox
          checked={noExpiration}
          onChange={(evt) => onChangeExpiration(evt.target.checked)}
        >
          No expiration
        </ExpirationCheckbox>
        <DateInputShell label="End date">
          <DatePicker
            value={new Date(endDate)}
            min={new Date(Math.max(startDate, minAllowedDate))}
            disabled={noExpiration}
            onChange={(date) => onEndDateChange(date.getTime())}
          />
        </DateInputShell>
      </EndDateContainer>
    </FormSection>
  </FormBlock>
);

export default SurveySeries;
