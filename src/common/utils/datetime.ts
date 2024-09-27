import { DurationLikeObject } from 'luxon/src/duration';
import { DateTime, Duration } from 'luxon';

export type Timestamp = number;
export type ISOTimestamp = string;
export type SQLTimestamp = string;

type TimeType = Timestamp | ISOTimestamp | DateTime | Date;

export const LOCALE = 'en';

export const duration = (params: DurationLikeObject): Timestamp =>
  Duration.fromObject(params).valueOf();

export const second = (count = 1): Timestamp => duration({ second: count });

export const minute = (count = 1): Timestamp => duration({ minute: count });

export const hour = (count = 1): Timestamp => duration({ hour: count });

export const day = (count = 1): Timestamp => duration({ day: count });

export const getTimeDiff = (ts: Timestamp): Timestamp => Date.now() - ts;

export const format = (ts: TimeType, fmt: string): string => {
  let date: DateTime;

  if (ts instanceof DateTime) {
    date = ts;
  } else if (ts instanceof Date) {
    date = DateTime.fromJSDate(ts);
  } else if (typeof ts === 'number') {
    date = DateTime.fromMillis(ts);
  } else {
    date = DateTime.fromISO(ts);
  }

  return date.setLocale(LOCALE).toFormat(fmt);
};

export const getRelativeTimeByTs = (ts: Timestamp): string => {
  const tsDiff = getTimeDiff(ts);

  if (tsDiff < hour()) return `${Math.floor(tsDiff / minute())} min`;
  if (tsDiff < day()) return `${Math.floor(tsDiff / hour())} hrs`;
  return `${Math.floor(tsDiff / day())} days`;
};

export const getAbsoluteTimeByTs = (ts: Timestamp): [string, string] => {
  const tsDiff = getTimeDiff(ts);
  const time = format(ts, 'hh:mm a');

  if (tsDiff < day()) return ['Today', time];
  return [format(ts, 'LLL d'), time];
};
export const convertSqlUtcDateStringToTimestamp = (ts?: SQLTimestamp): Timestamp | undefined =>
  ts ? DateTime.fromSQL(ts, { zone: 'utc' }).toMillis() : undefined;

export const convertIsoUtcToMillis = (ts: ISOTimestamp): Timestamp =>
  DateTime.fromISO(ts, { zone: 'utc' }).toMillis();

export const convertMillisToIsoUtc = (ts: Timestamp): ISOTimestamp =>
  DateTime.fromMillis(ts).toUTC().toISO({ includeOffset: false });

export const parseDateFromApi = (date: string | undefined) => date ? Date.parse(date) : undefined;
export const parseDateTimeToApi = (date: string, time: string) => `${DateTime.fromISO(date).toFormat('yyyy-LL-dd')}T${DateTime.fromISO(time).toFormat('T')}`;
