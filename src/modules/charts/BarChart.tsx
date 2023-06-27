import React, { useRef, useMemo, useState, useCallback } from 'react';
import styled from 'styled-components';
import * as d3 from 'd3';

import Tooltip from 'src/common/components/Tooltip';
import { colors, px, theme, typography } from 'src/styles';
import { XAxis, YAxis, Bar } from './common-components';
import {
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
  overflow: visible;

  .xAxis {
    .tick {
      line {
        stroke: ${colors.backgoundLight};
        stroke-width: ${px(1)};
        opacity: ${({ $isHorizontal }) => ($isHorizontal ? 1 : 0)};
      }

      text,
      foreignObject > div {
        ${typography.labelRegular};
        color: ${colors.textPrimary};
      }

      foreignObject > div {
        text-align: center;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
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

const getMargins = (isHorizontal = false) =>
  isHorizontal
    ? { top: 4, right: 30, bottom: 37, left: 53 }
    : { top: 4, right: 0, bottom: 23, left: 43 };

const BarChart = ({ width, height, data, isHorizontal = false }: BarChartProps) => {
  const svgRef = useRef<SVGSVGElement>(null);

  const [isSmallText, setIsSmallText] = useState(false);

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

  const getPercentage = (d: DataItem) => (d.totalValue ? (d.value / d.totalValue) * 100 : 0);

  const getBarKeyByIndex = (index: number) => `bar-${index}`;

  const [currentHoveredBar, setCurrentHoveredBar] = useState<number>(-1);

  const tooltipContent = useMemo(() => {
    if (currentHoveredBar < 0) {
      return null;
    }

    const barData = data[currentHoveredBar];

    if (!barData || !barData.totalValue) {
      return null;
    }

    return (
      <TooltipContent>
        <TooltipNameBlock>{`${barData.name.toUpperCase()}:`}</TooltipNameBlock>
        <TooltipDataBlock>{`${barData.value}/${barData.totalValue}`}</TooltipDataBlock>
      </TooltipContent>
    );
  }, [currentHoveredBar, data]);

  const tooltipPosition = useMemo(() => {
    if (isHorizontal) {
      return 't';
    }

    switch (currentHoveredBar) {
      case 0:
        return 'atl';
      case data.length - 1:
        return 'atr';
      default:
        return 't';
    }
  }, [currentHoveredBar, data.length, isHorizontal]);

  const onBarMouseEnter = useCallback(
    (_: React.MouseEvent<SVGPathElement, MouseEvent> | null, index: number) => {
      setCurrentHoveredBar(index);
    },
    []
  );

  const onBarMouseLeave = useCallback(() => {
    setCurrentHoveredBar(-1);
  }, []);

  const isEmptyState = useMemo(() => data.every((d) => d.totalValue === 0), [data]);

  const tooltipContainer = useMemo(
    () =>
      currentHoveredBar < 0
        ? undefined
        : (d3
            .select(svgRef.current)
            .select(`#${getBarKeyByIndex(currentHoveredBar)}`)
            .node() as HTMLElement),
    [currentHoveredBar]
  );

  const handleXAxisCustomCall = useCallback(
    (el: d3.Selection<SVGGElement, unknown, HTMLElement, unknown>) => {
      if (el.select('.tick').selectChildren('text').nodes().length && !isHorizontal) {
        const barWidth = scaleBand.bandwidth();

        const oldNodes = el.selectAll('.tick text').remove().nodes();

        el.selectAll('.tick')
          .append('foreignObject')
          .append('xhtml:div')
          .style('width', px(barWidth))
          .style('height', px(30));

        el.selectAll('.tick foreignObject')
          .nodes()
          .forEach((node, idx) => {
            const n = node as SVGTextContentElement;
            const oldN = oldNodes[idx] as SVGTextContentElement;

            if (oldN) {
              oldN.getAttributeNames().forEach((name) => {
                n.setAttribute(name, oldN.getAttribute(name) || '');
              });

              n.setAttribute('width', px(barWidth));
              n.setAttribute('height', px(30));
              n.setAttribute('x', px(-barWidth / 2));
            }
          });

        el.selectAll('.tick foreignObject div')
          .nodes()
          .forEach((node, idx) => {
            (node as SVGTextContentElement).textContent = (
              oldNodes[idx] as SVGTextContentElement
            ).textContent;
          });
      }
    },
    [isHorizontal, scaleBand]
  );

  return (
    <Container>
      <StyledSvg ref={svgRef} width={width} height={height} $isHorizontal={isHorizontal}>
        <XAxis
          xScale={isHorizontal ? scaleLinear : scaleBand}
          removeDomain
          yOffset={height - margins.bottom}
          yTickOffset={isHorizontal ? 20 : 8}
          xTickOffset={!isHorizontal ? 1 : 0}
          ticks={5}
          tickSize={height - margins.top - margins.bottom}
          tickFormatFn={(d) => (isHorizontal ? `${d}%` : `${d}`)}
          orientation={isHorizontal ? 'top' : 'bottom'}
          isScaleBand={!isHorizontal}
          customCall={handleXAxisCustomCall}
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
        {!isEmptyState &&
          data.map((d, index) => (
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
              maxHeight={isHorizontal ? scaleBand.bandwidth() : scaleLinear(0) - scaleLinear(100)}
              maxY={isHorizontal ? +(scaleBand(d.name) || 0) : scaleLinear(100)}
              textProps={{
                x: isHorizontal
                  ? scaleLinear(getPercentage(d)) -
                    (getPercentage(d) > 10 ? scaleLinear(0) : 0) +
                    LABEL_MARGIN
                  : +(scaleBand(d.name) || 0) + scaleBand.bandwidth() / 2,
                y: isHorizontal
                  ? +(scaleBand(d.name) || 0) + scaleBand.bandwidth() / 2
                  : height -
                    margins.bottom -
                    (scaleLinear(0) - scaleLinear(getPercentage(d))) +
                    (getPercentage(d) > 10 ? 20 : -8),
                dy: isHorizontal ? '.35em' : '0', // vertical align middle
                fill: getPercentage(d) > 10 ? theme.colors.primaryWhite : theme.colors.textPrimary,
                text: `${Math.round(getPercentage(d))}%`,
              }}
              isSmallText={isSmallText}
              onMouseEnter={(event) => onBarMouseEnter(event, index)}
              onMouseLeave={onBarMouseLeave}
              setIsSmallText={setIsSmallText}
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
        content={tooltipContent}
        container={tooltipContainer}
        show={!!tooltipContent && !!tooltipContainer}
        position={tooltipPosition}
        arrow
        static
      />
    </Container>
  );
};

export default BarChart;
