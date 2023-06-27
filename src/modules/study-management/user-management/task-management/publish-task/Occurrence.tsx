import React, { FC, useMemo } from 'react';

import { DateTime, Duration } from 'luxon';
import styled from 'styled-components';
import _range from 'lodash/range';

import { colors, px, typography } from 'src/styles';
import DatePicker from 'src/common/components/DatePicker';
import TimeIcon from 'src/assets/icons/time.svg';
import InputField, { InputFieldShell } from 'src/common/components/InputField';
import Toggle from 'src/common/components/Toggle';
import Tooltip from 'src/common/components/Tooltip';
import InfoIconSvg from 'src/assets/icons/info.svg';
import Dropdown from 'src/common/components/Dropdown';
import { formatOrdinals } from 'src/common/utils/number';
import { Timestamp } from 'src/common/utils/datetime';
import { TaskType } from 'src/modules/api';

import { DurationPeriod, ScheduleFrequency } from './publishTask.slice';
import { FormBlock, FormSection } from './Form';
import { DEFAULT_VALID_DURATION_VALUE, VARIABLE_CLOSING_DAYS_OF_MONTH } from './constants';
import { titleByType } from './utils';

export const TimeIconStyled = styled(TimeIcon)`
  fill: ${colors.primary};
`;

export const DateInputShell = styled(InputFieldShell)`
  width: ${px(312)};
`;

export const PublishTimeShell = styled(InputFieldShell)`
  width: ${px(156)};
`;

export const PublishTimeWithTooltipContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${px(9)};
`;

export const PublishTimeDropdown = styled(Dropdown)`
  width: ${px(156)};
`;

export const InfoIcon = styled.div.attrs({
  children: <InfoIconSvg />,
})`
  display: flex;
`;

const ScheduleHint = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  > span {
    display: flex;
    align-items: center;
    gap: ${px(8)};
  }

  > * {
    ${typography.bodySmallRegular};
    color: ${colors.textPrimary};
  }
`;

const ValidDurationInputField = styled(InputField)`
  width: ${px(112)};
`;

const ValidDurationDropdown = styled(Dropdown)`
  width: ${px(192)};
`;

const LateResponseHelp = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const IconContainer = styled.div`
  height: ${px(56)};
  margin-top: ${px(24)};
  margin-bottom: ${px(24)};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LateResponseFormSection = styled(FormSection)`
  margin-top: ${px(-24)} !important;
`;

const durationPeriodList = [
  { label: 'Minute(s)', key: DurationPeriod.MINUTE },
  { label: 'Hour(s)', key: DurationPeriod.HOUR },
  { label: 'Day(s)', key: DurationPeriod.DAY },
  { label: 'Week(s)', key: DurationPeriod.WEEK },
  { label: 'Month(s)', key: DurationPeriod.MONTH },
];

interface TaskOccurrenceProps {
  frequency: ScheduleFrequency;
  startDate: Timestamp;
  minAllowedDate: Timestamp;
  noExpiration: boolean;
  endDate: Timestamp;
  durationPeriodValue: number;
  durationPeriodType: DurationPeriod;
  onStartDateChange: (date: Timestamp) => void;
  onPublishTimeChange: (minutes: number) => void;
  onDurationPeriodValueChange: (minutes: number) => void;
  onDurationPeriodTypeChange: (period: DurationPeriod) => void;
  lateResponse: boolean;
  onLateResponseChange: (checked: boolean) => void;
  onPublishTimeClick: () => void;
  type: TaskType;
}

const Occurrence: FC<TaskOccurrenceProps> = ({
  frequency,
  startDate,
  minAllowedDate,
  noExpiration,
  endDate,
  onStartDateChange,
  onPublishTimeChange,
  durationPeriodValue,
  durationPeriodType,
  onDurationPeriodValueChange,
  onDurationPeriodTypeChange,
  lateResponse,
  onLateResponseChange,
  onPublishTimeClick,
  type,
}) => {
  const startDateDt = useMemo(() => DateTime.fromMillis(startDate), [startDate]);
  const minAllowedDateDt = useMemo(() => DateTime.fromMillis(minAllowedDate), [minAllowedDate]);

  const publishTime = useMemo(
    () =>
      Duration.fromObject({ hours: startDateDt.hour, minutes: startDateDt.minute }).as('minutes'),
    [startDateDt.hour, startDateDt.minute]
  );

  const publishTimeList = useMemo(
    () =>
      _range(0, 24 * 60, 30)
        .map((mins) => [startDateDt.startOf('day').plus({ minute: mins }), mins] as const)
        .filter(([dt]) => dt.toMillis() >= minAllowedDateDt.toMillis())
        .map(([dt, mins]) => ({
          label: dt.toFormat('hh:mm a'),
          key: mins,
        })),
    [startDateDt, minAllowedDateDt]
  );

  const publishTimeHint = useMemo(() => {
    switch (frequency) {
      case ScheduleFrequency.ONE_TIME:
        return (
          <IconContainer>
            <Tooltip
              arrow
              trigger="hover"
              position="abr"
              content={`Participant local time when ${titleByType(
                type,
                true
              )} will appear in the App.`}
              styles={{
                transform: `translate(${px(6)}, ${px(-6)})`,
                width: px(239),
              }}
            >
              <InfoIcon />
            </Tooltip>
          </IconContainer>
        );

      case ScheduleFrequency.DAILY:
        return <span>every day</span>;

      case ScheduleFrequency.WEEKLY:
        return <span>every {startDateDt.toFormat('cccc')}</span>;

      case ScheduleFrequency.MONTHLY: {
        const dayOfMonth = startDateDt.day;

        return (
          <span>
            <span>{formatOrdinals(dayOfMonth)} day of the month</span>
            {VARIABLE_CLOSING_DAYS_OF_MONTH.includes(dayOfMonth) && (
              <Tooltip
                arrow
                trigger="hover"
                position="r"
                content="For months with fewer days than your selection, the survey will be published on the last day of the month."
                styles={{ width: px(341) }}
              >
                <InfoIcon />
              </Tooltip>
            )}
          </span>
        );
      }

      default:
        return null;
    }
  }, [frequency, startDateDt, type]);

  return (
    <FormBlock label="Occurrence">
      <FormSection>
        {frequency === ScheduleFrequency.ONE_TIME && (
          <DateInputShell label="Publish time">
            <DatePicker
              value={new Date(startDate)}
              min={new Date(minAllowedDate)}
              max={!noExpiration ? new Date(endDate) : undefined}
              onClick={onPublishTimeClick}
              onChange={(date) => onStartDateChange(date.getTime())}
            />
          </DateInputShell>
        )}
        <PublishTimeShell
          label={
            frequency !== ScheduleFrequency.ONE_TIME ? (
              <PublishTimeWithTooltipContainer>
                Publish time
                <Tooltip
                  arrow
                  trigger="hover"
                  position="r"
                  content={`Participant local time when ${titleByType(
                    type,
                    true
                  )} will appear in the App.`}
                  styles={{ width: px(255) }}
                >
                  <InfoIcon />
                </Tooltip>
              </PublishTimeWithTooltipContainer>
            ) : undefined
          }
        >
          <PublishTimeDropdown
            arrowIcon={<TimeIconStyled />}
            activeKey={publishTime}
            items={publishTimeList}
            onChange={(key) => onPublishTimeChange(key as number)}
          />
        </PublishTimeShell>
        <ScheduleHint>{publishTimeHint}</ScheduleHint>
      </FormSection>
      <FormSection>
        <ValidDurationInputField
          label="Valid duration"
          type="number"
          value={durationPeriodValue}
          onChange={(evt) => onDurationPeriodValueChange(parseInt(evt.target.value, 10))}
          onBlur={(evt) =>
            Number(evt.target.value) < 1 &&
            onDurationPeriodValueChange(DEFAULT_VALID_DURATION_VALUE)
          }
        />
        <InputFieldShell>
          <ValidDurationDropdown
            activeKey={durationPeriodType}
            items={durationPeriodList}
            onChange={(key) => onDurationPeriodTypeChange(key as number)}
          />
        </InputFieldShell>
      </FormSection>
      <LateResponseFormSection>
        <Toggle
          label="Allow late completion after selected duration"
          checked={lateResponse}
          onChange={(evt) => onLateResponseChange(evt.target.checked)}
        />
        <LateResponseHelp>
          <Tooltip
            arrow
            trigger="hover"
            position="r"
            content={
              'Turning this on will enable participants\n' +
              'to complete the task past its valid duration.'
            }
            styles={{ width: px(283) }}
          >
            <InfoIcon />
          </Tooltip>
        </LateResponseHelp>
      </LateResponseFormSection>
    </FormBlock>
  );
};

export default Occurrence;
