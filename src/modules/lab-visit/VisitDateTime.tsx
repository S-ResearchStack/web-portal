import React, { useCallback, useEffect, useMemo, useState } from 'react';

import styled from 'styled-components';
import { DateTime, Duration } from 'luxon';
import _range from 'lodash/range';

import Dropdown from 'src/common/components/Dropdown';
import { colors, px } from 'src/styles';
import { InputFieldShell } from 'src/common/components/InputField';
import DatePicker from 'src/common/components/DatePicker';
import TimeIcon from 'src/assets/icons/time.svg';
import { Timestamp } from 'src/common/utils/datetime';
import Tooltip from 'src/common/components/Tooltip';
import InfoIcon from 'src/assets/icons/info.svg';

const VisitDateTimeContainer = styled.div`
  display: grid;
  grid-template-columns: ${px(312)} ${px(156)} ${px(12)};
  align-items: center;
  column-gap: ${px(8)};
`;

const TimeIconStyled = styled(TimeIcon)`
  fill: ${colors.primary};
`;

const TimeDropdown = styled(Dropdown)`
  width: ${px(156)};
`;

const InfoIconStyled = styled(InfoIcon)`
  display: block;
`;

const VisitEndContainer = styled.div`
  grid-area: visit-end;
`;

const VisitStartContainer = styled.div`
  grid-area: visit-start;
`;

type TimeListItem = {
  disabled?: boolean;
  label: string;
  key: number;
};

type VisitDateTimeDuration = [Timestamp | undefined, Timestamp | undefined];

type DateTimeSectionProps = {
  label: string;
  minAllowedDate?: Timestamp;
  maxAllowedDate?: Timestamp;
  onChange: (value: VisitDateTimeDuration) => void;
  disabledDate?: boolean;
  disabledTime?: boolean;
  tooltip: string;
  timeValue?: Timestamp;
  timeList: TimeListItem[];
  dateValue?: Timestamp;
  invalidTime?: boolean;
  hideDisabledTime?: boolean;
  testIdSuffix?: string;
};

const DateTimeSection = ({
  label,
  minAllowedDate,
  maxAllowedDate,
  onChange,
  tooltip,
  timeList,
  timeValue,
  dateValue,
  disabledDate,
  disabledTime,
  invalidTime,
  hideDisabledTime,
  testIdSuffix,
}: DateTimeSectionProps) => {
  const date = useMemo(
    () => (dateValue ? DateTime.fromMillis(dateValue).toJSDate() : undefined),
    [dateValue]
  );
  const minAllowedDateDt = useMemo(
    () => DateTime.fromMillis(minAllowedDate || 0),
    [minAllowedDate]
  );
  const maxAllowedDateDt = useMemo(
    () => DateTime.fromMillis(maxAllowedDate || Number.MAX_SAFE_INTEGER).toJSDate(),
    [maxAllowedDate]
  );

  const [isTouchedTime, setTouchedTime] = useState(timeValue !== undefined);
  const isInvalidTime = isTouchedTime && !disabledTime && invalidTime;

  return (
    <VisitDateTimeContainer>
      <InputFieldShell label={label} disabled={disabledDate}>
        <DatePicker
          data-testid={`visit-date-${testIdSuffix}`}
          value={date}
          min={minAllowedDateDt.toJSDate()}
          max={maxAllowedDateDt}
          disabled={disabledDate}
          onChange={(d) => onChange([d.getTime(), isTouchedTime ? timeValue : undefined])}
          onOpen={() =>
            !date &&
            onChange([
              DateTime.fromJSDate(new Date()).startOf('day').toMillis(),
              isTouchedTime ? timeValue : undefined,
            ])
          }
        />
      </InputFieldShell>
      <InputFieldShell
        disabled={disabledTime}
      >
        <TimeDropdown
          data-testid={`visit-time-${testIdSuffix}`}
          hideDisabledItems={hideDisabledTime}
          arrowIcon={<TimeIconStyled />}
          placeholder="Select time"
          activeKey={isTouchedTime ? timeValue : undefined}
          items={timeList}
          disabled={disabledTime}
          error={isInvalidTime}
          onChange={(d) => {
            setTouchedTime(true);
            onChange([dateValue, Number(d)]);
          }}
        />
      </InputFieldShell>
      <Tooltip arrow static content={tooltip} trigger="hover" position="bl">
        <InfoIconStyled />
      </Tooltip>
    </VisitDateTimeContainer>
  );
};

const getDate = (ts: Timestamp) => DateTime.fromMillis(ts).startOf('day').toMillis();

const getMinutes = (ts: Timestamp) => {
  const dt = DateTime.fromMillis(ts);
  return Duration.fromObject({ hours: dt.hour, minutes: dt.minute }).as('minutes');
};

const durationToTs = ([date, time]: VisitDateTimeDuration) =>
  DateTime.fromMillis(date ?? 0)
    .plus({ minute: time ?? 0 })
    .toMillis();

type ValidationItem = [boolean, boolean];
type ValidationResult = [ValidationItem, ValidationItem];

type VisitDateTimeProps = {
  maxAllowedTimestamp: Timestamp;
  duration: VisitDateTimeDuration;
  onChange: (duration: VisitDateTimeDuration) => void;
  onValidateChange: (status: ValidationItem) => void;
};

export const VisitDateTime = ({
  maxAllowedTimestamp,
  duration: [startTs, endTs],
  onChange,
  onValidateChange,
}: VisitDateTimeProps) => {
  const maxAllowedDateTime = useMemo(() => {
    const ts = DateTime.fromMillis(maxAllowedTimestamp);
    return ts.startOf('hour').plus({ minute: ts.get('minute') + 1 >= 30 ? 30 : 0 });
  }, [maxAllowedTimestamp]);

  const [[startDate, startTime], setStartDateTime] = useState<VisitDateTimeDuration>([
    startTs ? getDate(startTs) : undefined,
    startTs ? getMinutes(startTs) : undefined,
  ]);

  const [[endDate, endTime], setEndDateTime] = useState<VisitDateTimeDuration>([
    endTs ? getDate(endTs) : undefined,
    endTs ? getMinutes(endTs) : undefined,
  ]);

  const getTimeRange = useCallback(
    (d: Timestamp) =>
      _range(0, 24 * 60, 30).map(
        (mins) => [DateTime.fromMillis(d).startOf('day').plus({ minute: mins }), mins] as const
      ),
    []
  );

  const startTimeList = useMemo(
    () =>
      getTimeRange(startDate ?? maxAllowedDateTime.toMillis()).map(([dt, mins]) => ({
        disabled: dt.toMillis() > maxAllowedDateTime.toMillis(),
        label: dt.toFormat('hh:mm a'),
        key: mins,
      })),
    [getTimeRange, maxAllowedDateTime, startDate]
  );

  const endTimeList = useMemo(
    () =>
      getTimeRange(endDate ?? maxAllowedDateTime.toMillis()).map(([dt, mins]) => ({
        disabled: startDate
          ? dt.toMillis() <=
              DateTime.fromMillis(startDate)
                .plus({ minute: startTime ?? 0 })
                .toMillis() || dt.toMillis() > maxAllowedDateTime.toMillis()
          : true,
        label: dt.toFormat('hh:mm a'),
        key: mins,
      })),
    [endDate, getTimeRange, maxAllowedDateTime, startDate, startTime]
  );

  const handleChange = useCallback(
    (list: [VisitDateTimeDuration, VisitDateTimeDuration]) => {
      onChange(list.map(([date, time]) => (date === undefined) ? undefined : durationToTs([date, time])) as VisitDateTimeDuration);
    },
    [onChange]
  );

  const handleStartDateTimeChange = useCallback(
    ([date, time]: VisitDateTimeDuration) => {
      setStartDateTime([date, time]);
      date &&
        handleChange([
          [date, time],
          [endDate, endTime],
        ]);
    },
    [endDate, endTime, handleChange]
  );

  const handleEndDateTimeChange = useCallback(
    ([date, time]: VisitDateTimeDuration) => {
      setEndDateTime([date, time]);
      handleChange([
        [startDate, startTime],
        [date, time],
      ]);
    },
    [handleChange, startDate, startTime]
  );

  const [[[, isStartTimeValid], [, isEndTimeValid]], setValid] = useState<ValidationResult>([
    [true, true],
    [true, true],
  ]);

  const validate = useCallback(
    () => [
      [
        !!startDate,
        startDate
          ? startTime !== undefined &&
            durationToTs([startDate, startTime]) <= maxAllowedDateTime.toMillis()
          : true,
      ],
      [
        !!endDate,
        !!startDate &&
          !!endDate &&
          startTime !== undefined &&
          endTime !== undefined &&
          durationToTs([startDate, startTime]) <= maxAllowedDateTime.toMillis() &&
          durationToTs([startDate, startTime]) < durationToTs([endDate, endTime]),
      ],
    ],
    [startDate, startTime, maxAllowedDateTime, endDate, endTime]
  );

  useEffect(() => {
    const v = validate();
    onValidateChange(v.map((i) => i.every(Boolean)) as ValidationItem);
    setValid(v as ValidationResult);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validate]);

  return (
    <>
      <VisitStartContainer>
        <DateTimeSection
          testIdSuffix="start"
          label="Visit start"
          tooltip="Local time when participant arrived at the lab."
          timeValue={startTime}
          timeList={startTimeList}
          dateValue={startDate}
          invalidTime={!isStartTimeValid}
          onChange={handleStartDateTimeChange}
          maxAllowedDate={endDate ?? maxAllowedDateTime.toMillis()}
          disabledTime={!startDate}
          hideDisabledTime
        />
      </VisitStartContainer>
      <VisitEndContainer>
        <DateTimeSection
          testIdSuffix="end"
          label="Visit end"
          tooltip="Local time when participant was discharged from the lab."
          timeValue={endTime}
          invalidTime={!isEndTimeValid}
          timeList={endTimeList}
          dateValue={endDate}
          onChange={handleEndDateTimeChange}
          minAllowedDate={startDate}
          maxAllowedDate={maxAllowedDateTime.toMillis()}
          disabledDate={startTime === undefined || startDate === undefined}
          disabledTime={!endDate}
        />
      </VisitEndContainer>
    </>
  );
};
