import { LOCALE } from 'src/common/utils/datetime';

export const format = (num: number, options?: Intl.NumberFormatOptions): string =>
  new Intl.NumberFormat(LOCALE, options).format(num);

export const parseNumber = (
  s?: string,
  { round }: { round?: boolean } = {}
): number | undefined => {
  const n = parseFloat(s || '');

  if (Number.isNaN(n)) {
    return undefined;
  }

  if (round) {
    return Math.round(n);
  }

  return n;
};

export const roundNumber = (n: number | undefined | null): number | undefined => {
  if (Number.isFinite(n)) {
    return Math.round(n as unknown as number);
  }
  return undefined;
};

export type PluralConfigMap = Map<Intl.LDMLPluralRule, string>;

export const PLURAL_MINUTES: PluralConfigMap = new Map([
  ['one', 'minute'],
  ['two', 'minutes'],
  ['few', 'minutes'],
  ['other', 'minutes'],
]);

export const PLURAL_HOURS: PluralConfigMap = new Map([
  ['one', 'hour'],
  ['two', 'hours'],
  ['few', 'hours'],
  ['other', 'hours'],
]);

export const PLURAL_DAYS: PluralConfigMap = new Map([
  ['one', 'day'],
  ['two', 'days'],
  ['few', 'days'],
  ['other', 'days'],
]);

export const PLURAL_WEEKS: PluralConfigMap = new Map([
  ['one', 'week'],
  ['two', 'weeks'],
  ['few', 'weeks'],
  ['other', 'weeks'],
]);

export const PLURAL_MONTHS: PluralConfigMap = new Map([
  ['one', 'month'],
  ['two', 'months'],
  ['few', 'months'],
  ['other', 'months'],
]);

const pr = new Intl.PluralRules(LOCALE, { type: 'ordinal' });

export const formatPlural = (
  num: number | string,
  suffixes: Map<Intl.LDMLPluralRule, string>,
  space = true
): string => {
  const rule = pr.select(+num);
  const suffix = suffixes.get(rule);
  return `${num}${space ? ' ' : ''}${suffix}`;
};

export const formatOrdinals = (num: number | string): string =>
  formatPlural(
    num,
    new Map([
      ['one', 'st'],
      ['two', 'nd'],
      ['few', 'rd'],
      ['other', 'th'],
    ]),
    false
  );
