import React, { FC, useMemo } from 'react';
import { DateTime } from 'luxon';

import Banner from 'src/common/components/Banner';
import {
  formatOrdinals,
  formatPlural,
  PLURAL_DAYS,
  PLURAL_HOURS,
  PLURAL_MINUTES,
  PLURAL_MONTHS,
  PLURAL_WEEKS,
  PluralConfigMap,
} from 'src/common/utils/number';
import * as dt from 'src/common/utils/datetime';
import { Timestamp } from 'src/common/utils/datetime';
import { TaskType } from 'src/modules/api';

import { DurationPeriod, ScheduleFrequency } from './publishTask.slice';
import { DEFAULT_VALID_DURATION_VALUE, VARIABLE_CLOSING_DAYS_OF_MONTH } from './constants';
import { titleByType } from './utils';
import { DurationObject } from 'src/common/components/Duration/DurationForm';

interface PublishBannerProps {
  frequency: ScheduleFrequency;
  startDate: Timestamp;
  endDate: Timestamp;
  durationObject: DurationObject;
  durationPeriodValue: number;
  durationPeriodType: DurationPeriod;
  noExpiration: boolean;
  type: TaskType;
}

const getValidPeriodPluralType = (durationPeriod: DurationPeriod): PluralConfigMap => {
  switch (durationPeriod) {
    case DurationPeriod.MINUTE:
      return PLURAL_MINUTES;
    case DurationPeriod.HOUR:
      return PLURAL_HOURS;
    case DurationPeriod.DAY:
      return PLURAL_DAYS;
    case DurationPeriod.WEEK:
      return PLURAL_WEEKS;
    case DurationPeriod.MONTH:
      return PLURAL_MONTHS;
    default:
      throw new Error('Incorrect type of active duration period');
  }
};

const PublishBanner: FC<PublishBannerProps> = ({
  frequency,
  startDate,
  endDate,
  durationObject,
  durationPeriodValue,
  durationPeriodType,
  noExpiration,
  type,
}) => (
  <Banner>
    {(() => {
      const ts = DateTime.fromMillis(startDate);
      const fromDate = dt.format(ts, 'LLL d');
      const fromDateWithYear = dt.format(ts, 'LLL d, kkkk');
      const toDate = dt.format(endDate, 'LLL d, kkkk');
      const time = dt.format(ts, 'h:mm a');
      const validPeriod = formatPlural(
        durationPeriodValue || DEFAULT_VALID_DURATION_VALUE,
        getValidPeriodPluralType(durationPeriodType)
      );
      const durationHTML = useMemo(()=> (
        <div>
          Duration is <strong>{durationObject.amount}</strong> {durationObject.durationUnitFirst} / {durationObject.durationUnitSecond}
        </div>
      ),[durationObject])

      switch (frequency) {
        case ScheduleFrequency.ONE_TIME: {
          const date = dt.format(ts, 'cccc, LLL d, kkkk');

          return (
            <>
              <div>
                The {titleByType(type, true)} will be published on <strong>{date}</strong> at{' '}
                <strong>
                  {time}{' '}
                  {`${
                    type === 'survey'
                      ? 'local time for each participant'
                      : 'at participants’ local time'
                  }`}
                </strong>
                .
              </div>
              <div>
                The {titleByType(type, true)} will be valid for <strong>{validPeriod}</strong>.
              </div>
              {durationHTML}
            </>
          );
        }

        case ScheduleFrequency.DAILY:
          return (
            <>
              <div>
                The {titleByType(type, true)} will be published <strong>everyday</strong> from{' '}
                <strong>{!noExpiration ? fromDate : fromDateWithYear}</strong>
                {!noExpiration ? (
                  <>
                    {' '}
                    to <strong>{toDate}</strong>{' '}
                  </>
                ) : (
                  ' '
                )}
                at <strong>{time} local time for each participant</strong>.
              </div>
              <div>
                Every daily {titleByType(type, true)} occurrence will be valid for{' '}
                <strong>{validPeriod}</strong>.
              </div>
              {durationHTML}
            </>
          );

        case ScheduleFrequency.WEEKLY: {
          const dayOfTheWeek = dt.format(ts, 'cccc');

          return (
            <>
              <div>
                The survey will be published <strong>every {dayOfTheWeek}</strong> from{' '}
                <strong>{!noExpiration ? fromDate : fromDateWithYear}</strong>
                {!noExpiration ? (
                  <>
                    {' '}
                    to <strong>{toDate}</strong>{' '}
                  </>
                ) : (
                  ' '
                )}
                at <strong>{time} local time for each participant</strong>.
              </div>
              <div>
                Every weekly survey occurrence will be valid for <strong>{validPeriod}</strong>.
              </div>
              {durationHTML}
            </>
          );
        }

        case ScheduleFrequency.MONTHLY:
          return (
            <>
              {VARIABLE_CLOSING_DAYS_OF_MONTH.includes(ts.day) ? (
                <div>
                  The survey will be published{' '}
                  <strong>the {formatOrdinals(dt.format(ts, 'd'))} day of the month</strong> from{' '}
                  <strong>{!noExpiration ? fromDate : fromDateWithYear}</strong>
                  {!noExpiration ? (
                    <>
                      {' '}
                      to <strong>{toDate}</strong>{' '}
                    </>
                  ) : (
                    ' '
                  )}
                  at <strong>{time} at the participant’s local time</strong>. For months with fewer
                  days than your selection, the survey will be published on the last day of the
                  month.
                </div>
              ) : (
                <div>
                  The survey will be published on{' '}
                  <strong>the {formatOrdinals(dt.format(ts, 'd'))} day of the month</strong> from{' '}
                  <strong>{!noExpiration ? fromDate : fromDateWithYear}</strong>
                  {!noExpiration ? (
                    <>
                      {' '}
                      to <strong>{toDate}</strong>{' '}
                    </>
                  ) : (
                    ' '
                  )}
                  at <strong>{time} local time for each participant</strong>.
                </div>
              )}
              <div>
                Every monthly survey occurrence will be valid for <strong>{validPeriod}</strong>.
              </div>
              {durationHTML}
            </>
          );

        default:
          throw new Error('Incorrect type of active schedule');
      }
    })()}
  </Banner>
);

export default PublishBanner;
