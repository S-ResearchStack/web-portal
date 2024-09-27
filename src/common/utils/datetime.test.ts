import {
  duration,
  second,
  minute,
  hour,
  day,
  getTimeDiff,
  format,
  getRelativeTimeByTs,
  getAbsoluteTimeByTs,
  parseDateFromApi,
} from 'src/common/utils/datetime';

beforeAll(() => {
  jest.spyOn(Date, 'now').mockImplementation().mockReturnValue(+new Date(1970, 1, 1, 0, 10, 0));
});

describe('duration', () => {
  it('Should return value', () => {
    expect(duration({ day: 1 })).toEqual(24 * 60 * 60 * 1000);
  });

  it('[NEGATIVE] Should return value with wrong props', () => {
    expect(duration({ day: '1' as unknown as number })).toEqual(24 * 60 * 60 * 1000);
  });

  it('[NEGATIVE] Should throw with undefined arg', () => {
    expect(() => duration(undefined as unknown as { day: number })).toThrow();
  });
});

describe('second', () => {
  it('Should return value', () => {
    expect(second(1)).toEqual(1000);
  });

  it('[NEGATIVE] Should return value with wrong initial arguments', () => {
    expect(second('1' as unknown as number)).toEqual(1000);
  });

  it('[NEGATIVE] Should assume 0 for undefined value', () => {
    expect(second(undefined as unknown as number)).toEqual(1000);
  });
});

describe('minute', () => {
  it('Should return value', () => {
    expect(minute(1)).toEqual(60 * 1000);
  });

  it('[NEGATIVE] Should return value with wrong initial arguments', () => {
    expect(minute('1' as unknown as number)).toEqual(60 * 1000);
  });

  it('[NEGATIVE] Should assume 0 for undefined value', () => {
    expect(minute(undefined as unknown as number)).toEqual(60 * 1000);
  });
});

describe('hour', () => {
  it('Should return value', () => {
    expect(hour(1)).toEqual(60 * 60 * 1000);
  });

  it('[NEGATIVE] Should return value with wrong initial arguments', () => {
    expect(hour('1' as unknown as number)).toEqual(60 * 60 * 1000);
  });

  it('[NEGATIVE] Should assume 0 for undefined value', () => {
    expect(hour(undefined as unknown as number)).toEqual(60 * 60 * 1000);
  });
});

describe('day', () => {
  it('Should return value', () => {
    expect(day(1)).toEqual(24 * 60 * 60 * 1000);
  });

  it('[NEGATIVE] Should return value with wrong initial arguments', () => {
    expect(day('1' as unknown as number)).toEqual(24 * 60 * 60 * 1000);
  });

  it('[NEGATIVE] Should assume 0 for undefined value', () => {
    expect(day(undefined as unknown as number)).toEqual(24 * 60 * 60 * 1000);
  });
});

describe('getTimeDiff', () => {
  it('Should return value', () => {
    expect(getTimeDiff(Date.now() - 1000)).toEqual(1000);
  });

  it('[NEGATIVE] Should return value with wrong initial arguments', () => {
    expect(getTimeDiff(`${Date.now() - 1000}` as unknown as number)).toEqual(1000);
  });

  it('[NEGATIVE] Should return NaN for undefined value', () => {
    expect(getTimeDiff(undefined as unknown as number)).toBeNaN();
  });
});

describe('format', () => {
  it('Should return value', () => {
    expect(format('1970-01-01', 'yyyy-LL-dd')).toEqual('1970-01-01');
  });

  it('[NEGATIVE] Should return value with empty value', () => {
    expect(format('', 'yyyy-LL-dd')).toEqual('Invalid DateTime');
  });

  it('[NEGATIVE] Should return value with undefined value', () => {
    expect(format(undefined as unknown as string, 'yyyy-LL-dd')).toEqual('Invalid DateTime');
  });

  it('[NEGATIVE] Should throw with undefined format', () => {
    expect(() => format('1970-01-01', undefined as unknown as string)).toThrow();
  });
});

describe('getRelativeTimeByTs', () => {
  it('Should return value', () => {
    expect(getRelativeTimeByTs(Date.now() - 5 * 24 * 60 * 60 * 1000)).toEqual('5 days');
    expect(getRelativeTimeByTs(Date.now() - 60 * 60 * 1000)).toEqual('1 hrs');
    expect(getRelativeTimeByTs(Date.now() - 60 * 1000)).toEqual('1 min');
  });

  it('[NEGATIVE] Should return value with wrong initial arguments', () => {
    expect(getRelativeTimeByTs(`${Date.now() - 60000}` as unknown as number)).toEqual('1 min');
  });
});

describe('getAbsoluteTimeByTs', () => {
  it('Should return value', () => {
    expect(getAbsoluteTimeByTs(Date.now() - 5 * 24 * 60 * 60 * 1000)).toEqual([
      'Jan 27',
      '12:10 AM',
    ]);
    expect(getAbsoluteTimeByTs(Date.now() - 60 * 60 * 1000)).toEqual(['Today', '11:10 PM']);
    expect(getAbsoluteTimeByTs(Date.now() - 60 * 1000)).toEqual(['Today', '12:09 AM']);
  });

  it('[NEGATIVE] Should return value with wrong initial arguments', () => {
    expect(getAbsoluteTimeByTs(`${Date.now() - 60000}` as unknown as number)).toEqual([
      'Today',
      'Invalid DateTime',
    ]);
  });
});

describe('parseDateFromApi', () => {
  it('should parse date', () => {
    expect(parseDateFromApi('2022-10-31 12:00:00')).toBe(
      new Date(2022, 9, 31, 12, 0, 0, 0).valueOf()
    );
  });

  it('[NEGATIVE] should parse wrong date', () => {
    expect(parseDateFromApi(undefined)).toBeUndefined();
    expect(parseDateFromApi('')).toBeUndefined();
  });
});
