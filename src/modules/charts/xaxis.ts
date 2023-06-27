import { DateTime } from 'luxon';
import _range from 'lodash/range';

import type { DataItem } from './LineChartWithDynamicAxis';

const TICK_WIDTH = 74;

const tickFormattersFirstLevel = {
  hour: (d: d3.NumberValue) => DateTime.fromMillis(d.valueOf()).toFormat('h a'),
  day: (d: d3.NumberValue) => DateTime.fromMillis(d.valueOf()).toFormat('d'),
  week: (d: d3.NumberValue) => DateTime.fromMillis(d.valueOf()).toFormat('d'),
  month: (d: d3.NumberValue) => DateTime.fromMillis(d.valueOf()).toFormat('MMM d'),
  year: (d: d3.NumberValue) => DateTime.fromMillis(d.valueOf()).toFormat('y'),
};

const tickFormattersSecondLevel = {
  hour: (d: d3.NumberValue) => DateTime.fromMillis(d.valueOf()).toFormat('d MMM'),
  day: (d: d3.NumberValue) => DateTime.fromMillis(d.valueOf()).toFormat('MMM'),
  week: (d: d3.NumberValue) => DateTime.fromMillis(d.valueOf()).toFormat('MMM'),
  month: (d: d3.NumberValue) => DateTime.fromMillis(d.valueOf()).toFormat('y'),
  year: () => ' ',
};

const calculateTicks = (values: DataItem[], focusWidth: number) => {
  if (values.length === 0) {
    return {
      ticks: [],
      tickFormatter: [tickFormattersFirstLevel.hour, tickFormattersSecondLevel.hour],
      tickFormatterType: 'hour' as keyof typeof tickFormattersFirstLevel,
    };
  }

  const tickStart = values[0].ts;
  const tickEnd = values[values.length - 1].ts;
  const tickStartDate = DateTime.fromMillis(tickStart);
  const tickEndDate = DateTime.fromMillis(tickEnd);

  let tickFormatterType: keyof typeof tickFormattersFirstLevel = 'year';

  const numDays = tickEndDate.diff(tickStartDate, 'days').toObject().days;
  const numMonths = tickEndDate.diff(tickStartDate, 'months').toObject().months;
  const numYears = tickEndDate.diff(tickStartDate, 'years').toObject().years;

  if (numYears && numYears <= 2) {
    tickFormatterType = 'month';
  }

  if (numMonths && numMonths <= 6) {
    tickFormatterType = 'week';
  }

  if (numDays && numDays <= 30) {
    tickFormatterType = 'day';
  }

  if (numDays && numDays <= 2) {
    tickFormatterType = 'hour';
  }

  const ticksNumber = focusWidth / TICK_WIDTH;
  const tickFormat = tickFormatterType === 'week' ? 'day' : tickFormatterType;
  const diff = tickEndDate.diff(tickStartDate, tickFormat).toObject()[`${tickFormat}s`];
  const tickWidthInUnits = diff && Math.round(diff / ticksNumber);

  const ticks =
    values.length <= ticksNumber || !tickWidthInUnits
      ? values.map((v) => v.ts)
      : _range(0, ticksNumber + 1).map((v, i) =>
          tickStartDate.plus({ [tickFormat]: tickWidthInUnits * i }).toMillis()
        );

  return {
    ticksFirstLevel: ticks,
    ticksSecondLevel: ticks.map((tick, i) =>
      i === 0 ||
      tickFormattersSecondLevel[tickFormatterType](tick) !==
        tickFormattersSecondLevel[tickFormatterType](ticks[i - 1]) ||
      (i === ticks.length - 1 &&
        tickFormattersSecondLevel[tickFormatterType](tick) ===
          tickFormattersSecondLevel[tickFormatterType](ticks[0]))
        ? tick
        : 0
    ),
    tickFormatter: [
      tickFormattersFirstLevel[tickFormatterType],
      tickFormattersSecondLevel[tickFormatterType],
    ],
    tickFormatterType,
  };
};

const calculateDomain = (values?: number[]) => {
  if (!values || values.length === 0) {
    return [0, 0];
  }

  const start = values[0];
  const end = values[values.length - 1];
  const extra = (end - start) * 0.03;

  return [start - extra, end + extra];
};

function calculate(values: DataItem[], focusWidth: number) {
  const { tickFormatter, ticksFirstLevel, ticksSecondLevel, tickFormatterType } = calculateTicks(
    values,
    focusWidth
  );
  const domain = calculateDomain(ticksFirstLevel);

  return {
    xAxisProps: {
      tickFormatter,
      ticksFirstLevel,
      ticksSecondLevel,
      domain,
      tickFormatterType,
    },
  };
}

export default calculate;
