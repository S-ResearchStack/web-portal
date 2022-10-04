import React, { useRef, useState, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import _sumBy from 'lodash/sumBy';
import _slice from 'lodash/slice';
import styled from 'styled-components';

import { typography, px, colors } from 'src/styles';
import Tooltip from 'src/common/components/Tooltip';
import { XAxis, YAxis, Area } from './common-components';
import { TooltipProps } from './common-helpers';

const TooltipContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const TooltipRowContent = styled.div`
  display: flex;
`;

const TooltipNameBlock = styled.div`
  display: flex;
  margin-right: ${px(8)};
  ${typography.labelSemibold};
  color: ${colors.surface};
`;

const TooltipDataBlock = styled.div`
  display: flex;
  flex-direction: column;
  ${typography.labelRegular};
  color: ${colors.surface};
`;

interface DataItem {
  percentage: number;
  scaleValue: number;
}

export type BarChartProps = {
  data: DataItem[];
  width: number;
  height: number;
  color?: string;
  minScale?: number;
  maxScale?: number;
  className?: string;
};

const DEFAULT_COLOR = '#00B0D7';

const TOOLTIP_MARGIN_TOP = 37;

const StackedBarChart = ({
  width,
  height,
  data,
  color = DEFAULT_COLOR,
  minScale = 1,
  maxScale = 10,
  className,
}: BarChartProps) => {
  const svgRef = useRef<SVGSVGElement>(null);

  const [tooltipProps, setTooltipProps] = useState<TooltipProps>(null);

  const x = useMemo(
    () => d3.map(data, (d, index) => _sumBy(_slice(data, 0, index + 1), 'percentage')),
    [data]
  );
  const y = useMemo(() => [0, 1], []);

  const xRange = useMemo(() => [0, width], [width]);
  const yRange = useMemo(() => [height, 0], [height]);

  const xScale = useMemo(() => d3.scaleLinear([0, 100], xRange).nice(), [xRange]);
  const yScale = useMemo(() => d3.scaleLinear(y, yRange).nice(), [y, yRange]);

  const getAreaKeyByIndex = (index: number) => `area-${index}`;

  const onAreaMouseEnter = useCallback(
    (event: React.MouseEvent<SVGPathElement, MouseEvent>, index: number) => {
      const svgRect = d3.select(svgRef.current).node()?.getBoundingClientRect();
      const areaId = getAreaKeyByIndex(index);
      const areaRect = (
        d3.select(svgRef.current).select(`#${areaId}`).node() as Element
      )?.getBoundingClientRect();

      const tooltipContent = (
        <TooltipContent>
          <TooltipRowContent>
            <TooltipNameBlock>SCALE VALUE:</TooltipNameBlock>
            <TooltipDataBlock>{data[index].scaleValue}</TooltipDataBlock>
          </TooltipRowContent>
          <TooltipRowContent>
            <TooltipNameBlock>PERCENTAGE:</TooltipNameBlock>
            <TooltipDataBlock>{`${Math.round(data[index].percentage)}%`}</TooltipDataBlock>
          </TooltipRowContent>
        </TooltipContent>
      );
      const position =
        (svgRect && (areaRect.left + 200 > svgRect.left + svgRect.width ? 'l' : 'r')) || 'l';
      const pointX =
        position === 'r'
          ? areaRect.left - 10 + areaRect.width / 2
          : areaRect.right + 10 - areaRect.width / 2;

      setTooltipProps({
        content: tooltipContent,
        point: [pointX, areaRect.top + TOOLTIP_MARGIN_TOP],
        position,
      });
    },
    [data]
  );

  const onAreaMouseLeave = useCallback(() => {
    setTooltipProps(null);
  }, []);

  return (
    <div className={className}>
      <svg ref={svgRef} width={width} height={height}>
        <XAxis key="x-axis" xScale={xScale} removeDomain yOffset={height} ticks={0} tickSize={0} />
        <YAxis key="y-axis" yScale={yScale} xOffset={0} removeDomain ticks={0} tickSize={0} />
        {data.map((d, index) => (
          <Area
            key={getAreaKeyByIndex(index)}
            id={getAreaKeyByIndex(index)}
            data={[
              { x: x[index - 1] || 0, y0: 0, y1: 1 },
              { x: x[index], y0: 0, y1: 1 },
            ]}
            xScale={xScale}
            yScale={yScale}
            color={color}
            fillOpacity={(1 / (maxScale - minScale + 1)) * (index + 1)}
            visible
            onMouseEnter={(event) => onAreaMouseEnter(event, index)}
            onMouseLeave={onAreaMouseLeave}
          />
        ))}
      </svg>
      <Tooltip
        content={tooltipProps?.content}
        point={tooltipProps?.point}
        show={!!tooltipProps}
        position={tooltipProps?.position}
        arrow
        dynamic
      />
    </div>
  );
};

export default styled(StackedBarChart)``;
