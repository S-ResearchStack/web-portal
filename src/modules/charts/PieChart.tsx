import React, { useEffect, useRef, useState, useCallback } from 'react';
import styled, { useTheme } from 'styled-components';
import * as d3 from 'd3';

import Tooltip from 'src/common/components/Tooltip';
import { SpecColorType } from 'src/styles/theme';
import { colors, typography, px } from 'src/styles';
import { drawPieChartShape } from './pieChartShape';
import { TooltipProps, TooltipContent } from './common-helpers';

const SVG_VIEWPORT_SIZE = 100;
const START_ANGLE = 0;

interface ContainerProps {
  $width: number;
  $height: number;
}

const Container = styled.div.attrs<ContainerProps>(({ $width, $height }) => ({
  style: {
    width: px($width),
    height: px($height),
  },
}))<ContainerProps>`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const SvgContainer = styled.svg<{ textScale: number }>`
  overflow: visible;
  width: 100%;
  height: 100%;

  text {
    text-anchor: middle;
    ${typography.pieChartTitleSemibold24};
    fill: ${colors.updPrimaryWhite};
    transform: scale(${({ textScale }) => textScale});
  }
`;

export const TooltipContainer = styled.div`
  display: flex;
`;

export const TooltipColorPoint = styled.div<{ color: SpecColorType }>`
  width: ${px(12)};
  height: ${px(12)};
  background-color: ${({ theme, color }) => theme.colors[color]};
  border-radius: 50%;
`;

export const TooltipNameContent = styled.div`
  ${typography.labelSemibold};
  margin: 0 ${px(8)};
  color: ${colors.updPrimaryWhite};
`;

export const TooltipCountContent = styled.div`
  ${typography.labelRegular};
  color: ${colors.updPrimaryWhite};
`;

const getShapeId = (index: number) => `pie-chart-shape-${index}`;

export const getTooltipContent = (data: PieChartDataItem) => (
  <TooltipContent>
    <TooltipContainer>
      <TooltipColorPoint color={data.color} />
      <TooltipNameContent>{data.name.toUpperCase()}:</TooltipNameContent>
      <TooltipCountContent>{`${data.count}/${data.total}`}</TooltipCountContent>
    </TooltipContainer>
  </TooltipContent>
);

export function drawPieChartLabels(
  { container, pieData, arcGenerator }: ReturnType<typeof drawPieChartShape>,
  onMouseEnter: (event: React.MouseEvent<SVGPathElement, MouseEvent>, index: number) => void,
  onMouseLeave: (event: React.MouseEvent<SVGPathElement, MouseEvent>) => void
) {
  container
    .selectAll(null)
    .data(pieData)
    .enter()
    .append('g')
    .attr('transform', (d) => `translate(${pieData.length > 1 ? arcGenerator.centroid(d) : 0})`)
    .append('text')
    .text((d) => `${d.value}%`)
    .attr('id', (d) => getShapeId(d.index))
    .on('mouseenter', (event, d) => onMouseEnter(event, d.index))
    .on('mouseleave', onMouseLeave);
}

type PieChartDataItem = {
  value: number;
  color: SpecColorType;
  name: string;
  count: number;
  total: number;
};

type Props = {
  data: PieChartDataItem[];
  width: number;
  height: number;
};

const TOOLTIP_THRESHOLD = 100;

const PieChart = ({ data, width, height }: Props) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const theme = useTheme();
  const [tooltipProps, setTooltipProps] = useState<TooltipProps>(null);

  const onLabelMouseEnter = useCallback(
    (event: React.MouseEvent<SVGPathElement, MouseEvent>, index: number) => {
      const labelRect = (
        d3
          .select(svgRef.current)
          .select(`#${getShapeId(index)}`)
          .node() as Element
      )?.getBoundingClientRect();
      const svgRect = d3.select(svgRef.current).node()?.getBoundingClientRect();
      const position = svgRect && svgRect.right - labelRect.right < TOOLTIP_THRESHOLD ? 'l' : 'r';
      const pointX = position === 'r' ? labelRect.right : labelRect.left;
      const pointY = labelRect.top + labelRect.height / 2;

      setTooltipProps({
        content: getTooltipContent(data[index]),
        point: [pointX, pointY],
        position,
      });
    },
    [data]
  );

  const onLabelMouseLeave = useCallback(() => {
    setTooltipProps(null);
  }, []);

  useEffect(() => {
    if (svgRef.current) {
      const pieChartShape = drawPieChartShape(
        {
          svg: svgRef.current,
          outerRadius: SVG_VIEWPORT_SIZE / 2,
          startAngleDegrees: START_ANGLE,
          data: data
            .filter((d) => d.value !== 0)
            .map(({ color, ...restData }) => ({ ...restData, color: theme.colors[color] })),
        },
        onLabelMouseEnter,
        onLabelMouseLeave
      );

      drawPieChartLabels(pieChartShape, onLabelMouseEnter, onLabelMouseLeave);
    }
  }, [data, onLabelMouseEnter, onLabelMouseLeave, theme]);

  const textScale = SVG_VIEWPORT_SIZE / height;

  return (
    <Container $width={width} $height={height}>
      <SvgContainer
        ref={svgRef}
        textScale={textScale}
        viewBox={`0 0 ${SVG_VIEWPORT_SIZE} ${SVG_VIEWPORT_SIZE}`}
      />
      <Tooltip
        content={tooltipProps?.content}
        point={tooltipProps?.point}
        show={!!tooltipProps}
        position={tooltipProps?.position}
        arrow
        dynamic
      />
    </Container>
  );
};

export default PieChart;
