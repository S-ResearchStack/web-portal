import _first from 'lodash/first';
import _last from 'lodash/last';
import _range from 'lodash/range';
import * as d3 from 'd3';

import type { DataItem } from './LineChartWithDynamicAxis';

type CalculateParams = {
  start?: number;
  numTicks?: number;
  step?: number;
};

type CalculateParamContext = {
  maxValue: number;
  current: CalculateParams;
};

type CalculateConditionalParams = CalculateParams & {
  when: (ctx: CalculateParamContext) => boolean;
  fn?: (ctx: CalculateParamContext) => CalculateParams;
};

type CalculateDomainContext = {
  step: number;
  minTick: number;
  maxTick: number;
};

type CalculateOptions = {
  values?: readonly DataItem[];
  defaultParams?: CalculateParams;
  params?: CalculateConditionalParams[];
  addZeroTick?: boolean;
  domain?: (ctx: CalculateDomainContext) => [number, number];
};

const INCREMENT_DIVIDER = 5;

const INCREMENT_POINTS = [5, 10, 50, 100, 500, 1000, 5000, 10000, 50000];

const getMaxY = (value: number, increment: number) => Math.ceil(value / increment) * increment;

const calculateYAxisParams = (opts: CalculateOptions) => {
  const { values = [], defaultParams, params: conditionalParams = [], domain, addZeroTick } = opts;

  const maxValue = d3.max(values, (d) => (d.value ? +d.value : 0)) || 0;
  const increment = (INCREMENT_POINTS.find((point) => maxValue <= point) || 0) / INCREMENT_DIVIDER;
  let maxY;

  if (increment <= 2 && maxValue <= 8) {
    maxY = maxValue + increment;
  } else {
    maxY = getMaxY(maxValue, increment);
  }

  let params = {
    numTicks: maxY / increment,
    step: maxY / (maxY / increment),
    start: 0,
    ...defaultParams,
  };
  for (const { when, fn, ...p } of conditionalParams) {
    const ctx = {
      maxValue: maxY,
      current: params,
    };
    if (when(ctx)) {
      params = {
        ...params,
        ...p,
        ...(fn ? fn(ctx) : {}),
      };
      break;
    }
  }

  const { step, numTicks, start } = params;
  const yAxisTicks = _range(addZeroTick ? 0 : 1, numTicks + 1).map((i) => start + step * i);

  const minTick = _first(yAxisTicks) ?? 0;
  const maxTick = _last(yAxisTicks) ?? 0;
  const yAxisDomain: [number, number] = domain ? domain({ step, minTick, maxTick }) : [0, maxTick];

  return {
    yAxisDomain,
    yAxisTicks,
  };
};

export default calculateYAxisParams;
