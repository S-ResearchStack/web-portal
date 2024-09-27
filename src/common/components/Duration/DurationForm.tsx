import React from 'react';
import styled from 'styled-components';
import Dropdown from 'src/common/components/Dropdown';
import InputField from 'src/common/components/InputField';
import { px } from 'src/styles';

const DurationWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  column-gap: 5px;
  .custom-input__wrapper {
    margin-top: -5px;
  }
`;
const DurationInputField = styled(InputField)`
  width: ${px(112)};
`;
const DurationUnitFirstDropdown = styled(Dropdown)`
  width: ${px(192)};
`;
const DurationUnitSecondDropdown = styled(Dropdown)`
  width: ${px(192)};
`;

export enum durationUnitFirstKey {
  MINUTE = "minute(s)",
  HOUR = "hour(s)"
}
export enum durationUnitSecondKey {
  DAY = "day",
  WEEK = "week",
  MONTH = "month"
}
export type DurationObject = {
  amount: number,
  durationUnitFirst: durationUnitFirstKey,
  durationUnitSecond: durationUnitSecondKey
}
export interface DurationProps {
  label?: string;
  error?: string;
  firstOptions?: { label: string, key: durationUnitFirstKey }[];
  secondOptions?: { label: string, key: durationUnitSecondKey }[];
  duration: DurationObject;
  onChange: (duration: DurationObject) => void;
}

const defaultFirstOptions = [
  { label: 'minute(s)', key: durationUnitFirstKey.MINUTE },
  { label: 'hours(s)', key: durationUnitFirstKey.HOUR },
];
const defaultSecondOptions = [
  { label: 'day', key: durationUnitSecondKey.DAY },
  { label: 'week', key: durationUnitSecondKey.WEEK },
  { label: 'month', key: durationUnitSecondKey.MONTH },
];

const DurationForm = (props: DurationProps) => {
  const { label = "Duration", firstOptions = defaultFirstOptions, secondOptions = defaultSecondOptions, error, duration, onChange } = props;

  return (
    <DurationWrapper>
      <DurationInputField
        className='custom-input__wrapper'
        type="number"
        tabIndex={0}
        label={label}
        error={error}
        value={duration.amount}
        onChange={(evt) => onChange({ ...duration, amount: parseInt(evt.target.value, 10) })}
        onBlur={(evt) =>
          Number(evt.target.value) < 1 && onChange({ ...duration, amount: 1 })
        }
      />
      <DurationUnitFirstDropdown
        maxVisibleMenuItems={4}
        items={firstOptions}
        activeKey={duration.durationUnitFirst}
        onChange={(key) => onChange({ ...duration, durationUnitFirst: key as durationUnitFirstKey })}
      />
      <span> per </span>
      <DurationUnitSecondDropdown
        maxVisibleMenuItems={4}
        items={secondOptions}
        activeKey={duration.durationUnitSecond}
        onChange={(key) => onChange({ ...duration, durationUnitSecond: key as durationUnitSecondKey })}
      />
    </DurationWrapper>
  )
}
export default DurationForm;
