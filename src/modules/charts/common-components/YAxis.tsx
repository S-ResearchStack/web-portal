import React, { useRef, useEffect, useMemo } from 'react';
import * as d3 from 'd3';
import styled from 'styled-components';
import { typography } from 'src/styles';

import { Y_AXIS_CLASS_NAME } from '../common-helpers';

const AxisGroup = styled.g`
  > .tick > text {
    ${typography.labelRegular};
  }
`;

type YScale =
  | d3.ScaleLinear<number, number, never>
  | d3.ScaleTime<number, number, never>
  | d3.ScaleBand<string>
  | d3.ScaleBand<string | number>;

type Props = {
  yScale: YScale;
  tickSize: number;
  xOffset?: number;
  yOffset?: number;
  ticks?: number;
  xTickOffset?: number;
  yTickOffset?: number;
  removeDomain?: boolean;
  orientation?: 'left' | 'right';
  isScaleBand?: boolean;
  tickValues?: Iterable<d3.NumberValue>;
  tickFormatFn?: (d: d3.NumberValue) => string;
  customCall?: (el: d3.Selection<SVGGElement, unknown, HTMLElement, unknown>) => void;
};

const YAxis: React.FC<Props> = ({
  yScale,
  tickSize,
  xOffset,
  yOffset,
  xTickOffset,
  yTickOffset,
  ticks,
  removeDomain,
  orientation = 'right',
  isScaleBand,
  tickValues,
  tickFormatFn,
  customCall,
}) => {
  const yAxisRef = useRef(null);

  const axisType = useMemo(
    () => (orientation === 'right' ? d3.axisRight : d3.axisLeft),
    [orientation]
  );

  const yAxis = useMemo(() => {
    if (isScaleBand) {
      return axisType(yScale as d3.ScaleBand<string>);
    }

    const axis = axisType(
      yScale as d3.ScaleLinear<number, number, never> | d3.ScaleTime<number, number, never>
    )
      .tickSize(tickSize)
      .tickFormat((d) => tickFormatFn?.(d) || `${d}`)
      .ticks(ticks);

    return tickValues ? axis.tickValues(tickValues) : axis;
  }, [axisType, isScaleBand, tickFormatFn, tickSize, tickValues, ticks, yScale]);

  const gY = (g: d3.Selection<SVGGElement, unknown, HTMLElement, unknown>) =>
    g
      .attr('transform', `translate(${xOffset || 0},${yOffset || 0})`)
      .call(yAxis)
      .call((el) => {
        removeDomain && el.select('.domain').remove();
        xTickOffset && el.selectAll('.tick text').attr('x', xTickOffset);
        yTickOffset && el.selectAll('.tick text').attr('y', yTickOffset);
        customCall?.(el);
      });

  useEffect(() => {
    if (yAxisRef.current) {
      d3.select<SVGGElement, unknown>(yAxisRef.current).call(gY);
    }
  });

  return <AxisGroup className={Y_AXIS_CLASS_NAME} ref={yAxisRef} />;
};

export default YAxis;
