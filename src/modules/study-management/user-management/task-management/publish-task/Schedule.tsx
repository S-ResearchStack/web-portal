import React, { FC } from 'react';

import styled from 'styled-components';

import { px } from 'src/styles';
import Dropdown from 'src/common/components/Dropdown';
import { InputFieldShell } from 'src/common/components/InputField';
import { ScheduleFrequency } from './publishTask.slice';
import { FormBlock } from './Form';

const ActiveScheduleDropdown = styled(Dropdown)`
  width: ${px(312)};
`;

interface TaskScheduleProps {
  frequency: ScheduleFrequency;
  onFrequencyChange: (value: ScheduleFrequency) => void;
}

const scheduleList = [
  { label: 'One-time', key: ScheduleFrequency.ONE_TIME },
  { label: 'Daily', key: ScheduleFrequency.DAILY },
  { label: 'Weekly', key: ScheduleFrequency.WEEKLY },
  { label: 'Monthly', key: ScheduleFrequency.MONTHLY },
];

const Schedule: FC<TaskScheduleProps> = ({ frequency, onFrequencyChange }) => (
  <FormBlock label="Schedule">
    <InputFieldShell label="Frequency">
      <ActiveScheduleDropdown
        activeKey={frequency}
        items={scheduleList}
        onChange={(key) => onFrequencyChange(key as number)}
      />
    </InputFieldShell>
  </FormBlock>
);

export default Schedule;
