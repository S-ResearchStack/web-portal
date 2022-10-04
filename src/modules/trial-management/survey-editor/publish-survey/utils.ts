import { DateTime } from 'luxon';
import _max from 'lodash/max';

export type TimeZoneIanaName = string;

export type TimeZoneOffset = number;

export type TimeZone = {
  iana: TimeZoneIanaName;
  offset: TimeZoneOffset;
};

export const getCurrentTimezone = (): TimeZone => {
  const currentTime = DateTime.local();

  return {
    iana: currentTime.zoneName,
    offset: currentTime.offset,
  };
};

export const getMaxTimezone = (offsets?: TimeZoneIanaName[]): TimeZone => {
  if (!offsets?.length) {
    return getCurrentTimezone();
  }

  const timezones: TimeZone[] = offsets.map((iana) => ({
    offset: DateTime.local().setZone(iana).offset,
    iana,
  }));

  const maxOffset = _max(timezones.map((tz) => tz.offset));

  return timezones.find((tz) => tz.offset === maxOffset) || getCurrentTimezone();
};
