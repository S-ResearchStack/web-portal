import React, { useRef, useEffect, useMemo } from 'react';
import * as d3 from 'd3';

import { X_AXIS_CLASS_NAME } from '../common-helpers';

type Props = {
  xScale:
    | d3.ScaleLinear<number, number, never>
    | d3.ScaleTime<number, number, never>
    | d3.ScaleBand<string>
    | d3.ScaleBand<string | number>;
  tickSize: number;
  yOffset: number;
  ticks: number;
  yTickOffset?: number;
  xTickOffset?: number;
  removeDomain?: boolean;
  orientation?: 'top' | 'bottom';
  isScaleBand?: boolean;
  tickFormatFn?: (d: d3.NumberValue) => string;
  customCall?: (el: d3.Selection<SVGGElement, unknown, HTMLElement, unknown>) => void;
};

const XAxis: React.FC<Props> = ({
  xScale,
  tickSize,
  yTickOffset,
  xTickOffset,
  yOffset,
  ticks,
  removeDomain,
  orientation = 'top',
  isScaleBand,
  tickFormatFn,
  customCall,
}) => {
  const xAxisRef = useRef(null);

  const axisType = useMemo(
    () => (orientation === 'top' ? d3.axisTop : d3.axisBottom),
    [orientation]
  );

  const xAxis = useMemo(() => {
    if (isScaleBand) {
      return axisType(xScale as d3.ScaleBand<string>);
    }

    return (
      axisType(
        xScale as d3.ScaleLinear<number, number, never> | d3.ScaleTime<number, number, never>
      )
        .tickSize(tickSize)
        // TODO: what timezone we should use? should be in sync with tz used in slice
        .tickFormat((d) => tickFormatFn?.(d) || `${d}`)
        .ticks(ticks)
    );
  }, [axisType, isScaleBand, tickFormatFn, tickSize, ticks, xScale]);

  const gX = (g: d3.Selection<SVGGElement, unknown, HTMLElement, unknown>) =>
    g
      .attr('transform', `translate(0, ${yOffset})`)
      .call(xAxis)
      .call((el) => {
        removeDomain && el.select('.domain').remove();
        yTickOffset && el.selectAll('.tick text').attr('y', yTickOffset);
        xTickOffset && el.selectAll('.tick text').attr('x', xTickOffset);
        customCall?.(el);
      });

  useEffect(() => {
    if (xAxisRef.current) {
      d3.select<SVGGElement, unknown>(xAxisRef.current).call(gX);
    }
  });

  return <g className={X_AXIS_CLASS_NAME} ref={xAxisRef} />;
};

export default XAxis;
