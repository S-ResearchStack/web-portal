import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import styled, { useTheme } from 'styled-components';
import * as d3 from 'd3';

import Tooltip from 'src/common/components/Tooltip';
import { SpecColorType } from 'src/styles/theme';
import { typography, px, colors } from 'src/styles';
import { drawPieChartShape } from './pieChartShape';
import { getTooltipContent } from './PieChart';
import { NO_RESPONSES_LABEL, getEmptyStateData } from './common-helpers';

const SVG_VIEWPORT_SIZE = 100;
const INNER_RADIUS_RATIO = (176 - 60) / 176; // where 176 is radius and 60 is sector height in reference design
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

const SvgContainer = styled.svg`
  position: absolute;
  width: 100%;
  height: 100%;
`;

const LabelContainer = styled.div``;

const ValueLabel = styled.span<{ isEmptyState: boolean }>`
  ${({ isEmptyState }) =>
    isEmptyState ? typography.headingXMediumRegular : typography.headingXLargeSemibold};
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const PercentageLabel = styled.span`
  ${typography.headingLargeSemibold};
  color: ${colors.textPrimary};
`;

type DonutChartDataItem = {
  value: number;
  color: SpecColorType;
  name: string;
  count: number;
  total: number;
};

type Props = {
  data: DonutChartDataItem[];
  totalPercents: number;
  width: number;
  height: number;
};

const getShapeId = (index: number) => `donut-chart-shape-${index}`;

function drawPieChartLabels(
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
    .text('')
    .attr('id', (d) => getShapeId(d.index))
    .attr('data-testid', (d) => getShapeId(d.index))
    .on('mouseenter', (event, d) => onMouseEnter(event, d.index))
    .on('mouseleave', onMouseLeave);
}

const TOOLTIP_THRESHOLD = 100;

const DonutChart = ({ data, totalPercents, width, height }: Props) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const theme = useTheme();
  const [currentHoveredShape, setCurrentHoveredShape] = useState<number>(-1);

  const outerRadius = SVG_VIEWPORT_SIZE / 2;
  const innerRadius = outerRadius * INNER_RADIUS_RATIO;

  const isEmptyState = useMemo(() => !data.length, [data.length]);

  const filteredData = useMemo(() => data.filter((d) => d.value !== 0), [data]);

  const tooltipContent = useMemo(() => {
    const hoveredShapeData = filteredData[currentHoveredShape];
    if (!hoveredShapeData) {
      return undefined;
    }

    return getTooltipContent(hoveredShapeData);
  }, [currentHoveredShape, filteredData]);

  const tooltipContainer = useMemo(
    () =>
      currentHoveredShape < 0
        ? undefined
        : (d3
            .select(svgRef.current)
            .select(`#${getShapeId(currentHoveredShape)}`)
            .node() as HTMLElement),
    [currentHoveredShape]
  );

  const tooltipPosition = useMemo(() => {
    if (!svgRef.current || !tooltipContainer) {
      return 'r';
    }

    const labelRect = tooltipContainer?.getBoundingClientRect();
    const svgRect = svgRef.current.getBoundingClientRect();

    return svgRect.right - labelRect.right < TOOLTIP_THRESHOLD ? 'l' : 'r';
  }, [tooltipContainer]);

  const onLabelMouseEnter = useCallback(
    (_: React.MouseEvent<SVGPathElement, MouseEvent>, index: number) => {
      setCurrentHoveredShape(index);
    },
    []
  );

  const onLabelMouseLeave = useCallback(() => {
    setCurrentHoveredShape(-1);
  }, []);

  useEffect(() => {
    if (svgRef.current) {
      const pieChartShape = drawPieChartShape(
        {
          svg: svgRef.current,
          outerRadius,
          innerRadius,
          startAngleDegrees: START_ANGLE,
          data: isEmptyState
            ? [getEmptyStateData(theme.colors.background)]
            : filteredData.map(({ color, ...restData }) => ({
                ...restData,
                color: theme.colors[color],
              })),
        },
        onLabelMouseEnter,
        onLabelMouseLeave
      );

      drawPieChartLabels(pieChartShape, onLabelMouseEnter, onLabelMouseLeave);
    }
  }, [
    filteredData,
    innerRadius,
    isEmptyState,
    onLabelMouseEnter,
    onLabelMouseLeave,
    outerRadius,
    theme,
  ]);

  return (
    <Container $width={width} $height={height}>
      <SvgContainer ref={svgRef} viewBox={`0 0 ${SVG_VIEWPORT_SIZE} ${SVG_VIEWPORT_SIZE}`} />
      <LabelContainer>
        <ValueLabel isEmptyState={isEmptyState}>
          {isEmptyState ? NO_RESPONSES_LABEL : totalPercents}
        </ValueLabel>
        {!isEmptyState && <PercentageLabel>%</PercentageLabel>}
      </LabelContainer>
      <Tooltip
        static
        content={tooltipContent}
        container={tooltipContainer}
        show={!!tooltipContent && !!tooltipContainer}
        position={tooltipPosition}
        arrow
      />
    </Container>
  );
};

export default DonutChart;
