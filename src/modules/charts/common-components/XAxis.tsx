import React, { useRef, useEffect, useMemo } from 'react';
import * as d3 from 'd3';
import styled from 'styled-components';
import { typography } from 'src/styles';

import { X_AXIS_CLASS_NAME } from '../common-helpers';

const AxisGroup = styled.g`
  > .tick > text {
    ${typography.labelRegular};
  }
`;

type XScale =
  | d3.ScaleLinear<number, number, never>
  | d3.ScaleTime<number, number, never>
  | d3.ScaleBand<string>
  | d3.ScaleBand<string | number>;

type Props = {
  className?: string;
  xScale: XScale;
  tickSize: number;
  yOffset?: number;
  xOffset?: number;
  ticks?: number;
  yTickOffset?: number;
  xTickOffset?: number;
  removeDomain?: boolean;
  orientation?: 'top' | 'bottom';
  isScaleBand?: boolean;
  tickValues?: Iterable<d3.NumberValue>;
  tickFormatFn?: (d: d3.NumberValue) => string;
  customCall?: (el: d3.Selection<SVGGElement, unknown, HTMLElement, unknown>) => void;
};

const XAxis: React.FC<Props> = ({
  className,
  xScale,
  tickSize,
  yTickOffset,
  xTickOffset,
  yOffset,
  xOffset,
  ticks,
  removeDomain,
  orientation = 'top',
  isScaleBand,
  tickValues,
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

    const axis = axisType(
      xScale as d3.ScaleLinear<number, number, never> | d3.ScaleTime<number, number, never>
    )
      .tickSize(tickSize)
      // TODO: what timezone we should use? should be in sync with tz used in slice
      .tickFormat((d) => tickFormatFn?.(d) || `${d}`)
      .ticks(ticks);

    return tickValues ? axis.tickValues(tickValues) : axis;
  }, [axisType, isScaleBand, tickFormatFn, tickSize, tickValues, ticks, xScale]);

  const gX = (g: d3.Selection<SVGGElement, unknown, HTMLElement, unknown>) =>
    g
      .attr('transform', `translate(${xOffset || 0}, ${yOffset || 0})`)
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

  return <AxisGroup className={`${X_AXIS_CLASS_NAME} ${className}`} ref={xAxisRef} />;
};

export default XAxis;
