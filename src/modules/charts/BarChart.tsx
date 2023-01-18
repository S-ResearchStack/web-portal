import React, { useRef, useMemo, useState, useCallback } from 'react';
import styled from 'styled-components';
import * as d3 from 'd3';

import Tooltip from 'src/common/components/Tooltip';
import { colors, px, theme, typography } from 'src/styles';
import { XAxis, YAxis, Bar } from './common-components';
import {
  TooltipProps,
  TooltipContent,
  NO_RESPONSES_LABEL,
  MARGIN_FOCUS,
  NoResponsesLabel,
} from './common-helpers';

interface StyledSvgProps {
  $isHorizontal?: boolean;
}

const Container = styled.div`
  position: relative;
`;

const StyledSvg = styled.svg<StyledSvgProps>`
  .xAxis {
    .tick {
      line {
        stroke: ${colors.backgoundLight};
        stroke-width: ${px(1)};
        opacity: ${({ $isHorizontal }) => ($isHorizontal ? 1 : 0)};
      }
      text {
        ${typography.labelRegular};
        color: ${colors.textPrimary};
      }
    }
  }

  .yAxis {
    .tick {
      line {
        stroke: ${colors.backgoundLight};
        stroke-width: ${px(1)};
        opacity: ${({ $isHorizontal }) => ($isHorizontal ? 0 : 1)};
      }
      text {
        ${typography.labelRegular};
        color: ${colors.textPrimary};
        text-anchor: end;
      }
    }
  }
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
  margin: 0;
`;

interface DataItem {
  name: string;
  value: number;
  totalValue: number;
}

export type BarChartProps = {
  data: DataItem[];
  width: number;
  height: number;
  isHorizontal?: boolean;
};

const MAX_VALUE = 100;
const LABEL_MARGIN = 16;
const TOOLTIP_MARGIN_TOP = 4;

const getMargins = (isHorizontal = false) =>
  isHorizontal
    ? { top: 4, right: 30, bottom: 37, left: 53 }
    : { top: 4, right: 0, bottom: 23, left: 43 };

const BarChart = ({ width, height, data, isHorizontal = false }: BarChartProps) => {
  const svgRef = useRef<SVGSVGElement>(null);

  const [tooltipProps, setTooltipProps] = useState<TooltipProps>(null);

  const margins = useMemo(() => getMargins(isHorizontal), [isHorizontal]);

  const xRange = useMemo(
    () => [margins.left, width - margins.right],
    [margins.left, margins.right, width]
  );
  const yRange = useMemo(
    () => [height - margins.bottom, margins.top],
    [height, margins.bottom, margins.top]
  );

  // y for vertical view, x for horizontal view (% value scale)
  const scaleLinear = useMemo(
    () =>
      d3
        .scaleLinear()
        .domain([0, MAX_VALUE])
        .nice()
        .range(isHorizontal ? xRange : yRange),
    [isHorizontal, xRange, yRange]
  );

  const domainName = useMemo(() => data.map((d) => d.name), [data]);

  // y for horizontal view, x for vertical view (name scale)
  const scaleBand = useMemo(() => {
    const domain = [...domainName];
    if (isHorizontal) {
      domain.reverse();
    }

    return d3
      .scaleBand()
      .domain(domain)
      .range(isHorizontal ? yRange : xRange)
      .paddingInner(isHorizontal ? 0.34 : 0.37);
  }, [domainName, isHorizontal, xRange, yRange]);

  const getPercentage = (d: DataItem) => (d.value / d.totalValue) * 100;

  const getBarKeyByIndex = (index: number) => `bar-${index}`;

  const currentHoveredBar = useRef<number>(-1);

  const onBarMouseEnter = useCallback(
    (_: React.MouseEvent<SVGPathElement, MouseEvent> | null, index: number) => {
      currentHoveredBar.current = index;

      if (!svgRef.current) {
        return;
      }

      const barId = getBarKeyByIndex(index);
      const svgRect = svgRef.current.getBoundingClientRect();
      const barRect = (
        d3.select(svgRef.current).select(`#${barId}`).node() as Element
      )?.getBoundingClientRect();

      const barData = data[index];

      const tooltipContent = (
        <TooltipContent>
          <TooltipNameBlock>{`${barData.name.toUpperCase()}:`}</TooltipNameBlock>
          <TooltipDataBlock>{`${barData.value}/${barData.totalValue}`}</TooltipDataBlock>
        </TooltipContent>
      );

      const getPosition = () => {
        if (isHorizontal) {
          return 't';
        }

        switch (index) {
          case 0:
            return 'atl';
          case data.length - 1:
            return 'atr';
          default:
            return 't';
        }
      };

      const getPointX = () => {
        const barCenter = barRect.left - svgRect.left + barRect.width / 2;
        if (isHorizontal) {
          return barCenter;
        }

        switch (index) {
          case 0:
            return barRect.left - svgRect.left;
          case data.length - 1:
            return barRect.left - svgRect.left + barRect.width;
          default:
            return barCenter;
        }
      };

      setTooltipProps({
        content: tooltipContent,
        point: [getPointX(), barRect.top - svgRect.top + TOOLTIP_MARGIN_TOP],
        position: getPosition(),
      });
    },
    [data, isHorizontal]
  );

  const onBarMouseLeave = useCallback(() => {
    setTooltipProps(null);
  }, []);

  const isEmptyState = useMemo(() => data.every((d) => d.totalValue === 0), [data]);

  if (!data.length) {
    return null;
  }

  return (
    <Container>
      <StyledSvg ref={svgRef} width={width} height={height} $isHorizontal={isHorizontal}>
        <XAxis
          xScale={isHorizontal ? scaleLinear : scaleBand}
          removeDomain
          yOffset={height - margins.bottom}
          yTickOffset={isHorizontal ? 20 : 12}
          xTickOffset={!isHorizontal ? 1 : 0}
          ticks={5}
          tickSize={height - margins.top - margins.bottom}
          tickFormatFn={(d) => (isHorizontal ? `${d}%` : `${d}`)}
          orientation={isHorizontal ? 'top' : 'bottom'}
          isScaleBand={!isHorizontal}
        />
        <YAxis
          yScale={isHorizontal ? scaleBand : scaleLinear}
          xOffset={margins.left}
          removeDomain
          ticks={5}
          tickSize={width - margins.left - margins.right}
          tickFormatFn={(d) => (isHorizontal ? `${d}` : `${d}%`)}
          orientation={isHorizontal ? 'left' : 'right'}
          xTickOffset={-30}
          yTickOffset={isHorizontal ? 2 : 1}
          isScaleBand={isHorizontal}
          customCall={(el: d3.Selection<SVGGElement, unknown, HTMLElement, unknown>) => {
            const textItems = el.selectAll('.tick text');
            const textWidth = textItems
              .nodes()
              .map((item: d3.BaseType) => (item as Element).getBoundingClientRect().width);

            textItems.attr('x', (d, i) => (isHorizontal ? -textWidth[i] - 8 : -8));
          }}
        />
        {data.map((d, index) => (
          <Bar
            id={getBarKeyByIndex(index)}
            key={getBarKeyByIndex(index)}
            isHorizontal={isHorizontal}
            rectProps={{
              x: isHorizontal ? margins.left : scaleBand(d.name) || 0,
              y: isHorizontal ? +(scaleBand(d.name) || 0) : scaleLinear(getPercentage(d)),
              height: isHorizontal
                ? scaleBand.bandwidth()
                : scaleLinear(0) - scaleLinear(getPercentage(d)),
              width: isHorizontal
                ? scaleLinear(getPercentage(d)) - scaleLinear(0)
                : scaleBand.bandwidth(),
            }}
            textProps={{
              x: isHorizontal
                ? scaleLinear(getPercentage(d)) -
                  (getPercentage(d) > 10 ? scaleLinear(0) : 0) +
                  LABEL_MARGIN
                : +(scaleBand(d.name) || 0) + scaleBand.bandwidth() / 2 + 1,
              y: isHorizontal
                ? +(scaleBand(d.name) || 0) + scaleBand.bandwidth() / 2
                : height -
                  margins.bottom -
                  (scaleLinear(0) - scaleLinear(getPercentage(d))) +
                  (getPercentage(d) > 10 ? LABEL_MARGIN : -LABEL_MARGIN),
              dy: isHorizontal ? '.35em' : '0', // vertical align middle
              fill: getPercentage(d) > 10 ? theme.colors.primaryWhite : theme.colors.textPrimary,
              text: `${getPercentage(d)}%`,
            }}
            onMouseEnter={(event) => onBarMouseEnter(event, index)}
            onMouseLeave={onBarMouseLeave}
          />
        ))}
        {isEmptyState && <rect x="0px" y="0px" width={width} height={height} fill="transparent" />}
        {isEmptyState && (
          <NoResponsesLabel
            x="50%"
            y="50%"
            dx={MARGIN_FOCUS.left}
            dy={-MARGIN_FOCUS.top}
            textAnchor="middle"
            dominantBaseline="middle"
            width={width}
            height={height}
          >
            {NO_RESPONSES_LABEL}
          </NoResponsesLabel>
        )}
      </StyledSvg>
      <Tooltip
        static
        content={tooltipProps?.content}
        point={tooltipProps?.point}
        show={!!tooltipProps}
        position={tooltipProps?.position}
        arrow
      />
    </Container>
  );
};

export default BarChart;
