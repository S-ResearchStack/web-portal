import React, { FC } from 'react';
import styled from 'styled-components';

import { px } from 'src/styles';
import Dropdown from 'src/common/components/Dropdown';
import { InputFieldShell } from 'src/common/components/InputField';
import { ScheduleFrequency } from './publishSurvey.slice';

import { FormBlock } from './Form';

const ActiveScheduleDropdown = styled(Dropdown)`
  width: ${px(312)};
`;

interface SurveyScheduleProps {
  frequency: ScheduleFrequency;
  onFrequencyChange: (value: ScheduleFrequency) => void;
}

const scheduleList = [
  { label: 'One-time', key: ScheduleFrequency.ONE_TIME },
  { label: 'Daily', key: ScheduleFrequency.DAILY },
  { label: 'Weekly', key: ScheduleFrequency.WEEKLY },
  { label: 'Monthly', key: ScheduleFrequency.MONTHLY },
];

const SurveySchedule: FC<SurveyScheduleProps> = ({ frequency, onFrequencyChange }) => (
  <FormBlock label="Survey schedule">
    <InputFieldShell label="Frequency">
      <ActiveScheduleDropdown
        activeKey={frequency}
        items={scheduleList}
        onChange={(key) => onFrequencyChange(key as number)}
      />
    </InputFieldShell>
  </FormBlock>
);

export default SurveySchedule;
