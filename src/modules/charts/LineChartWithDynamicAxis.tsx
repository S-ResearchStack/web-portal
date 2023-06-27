import React, { useRef, useMemo, useState } from 'react';
import styled, { useTheme } from 'styled-components';
import * as d3 from 'd3';
import { DateTime } from 'luxon';

import { px, colors, typography } from 'src/styles';
import Tooltip from 'src/common/components/Tooltip';
import { Container, DOTS_CONTAINER_CLASS_NAME, StyledSvg } from './common-helpers';
import { Line, Dot, XAxis, YAxis } from './common-components';
import calculateYAxisParams from './yaxis';
import calculateXAxisParams from './xaxis';

export interface DataItem {
  ts: number;
  value: number;
}

type Props = {
  data: DataItem[];
  width: number;
  height: number;
};

const MARGIN_FOCUS = {
  top: 10,
  right: 12,
  bottom: 35,
  left: 28,
};

const TOOLTIP_SPACING = 8;

const getDotId = (ts: number) => `dot-${ts}`;

const SvgContainer = styled(StyledSvg)<{ fHeight: number; fWidth: number }>`
  .xAxis {
    .tick:first-child,
    .tick:last-child {
      text {
        text-anchor: middle;
      }
    }
  }

  .xAxisSecondLevel {
    .tick {
      text {
        text-anchor: start !important;
      }
    }
  }

  .focus {
    rect {
      fill: transparent;
      cursor: default;
    }
    .cursor {
      stroke: ${colors.disabled};
      stroke-dasharray: 2 2;
    }
  }
`;

const TooltipContent = styled.div`
  display: flex;
  flex-direction: column;
  height: ${px(38)};
  justify-content: space-between;
`;

const TooltipRow = styled.div`
  display: flex;
  align-items: center;
`;

const TooltipText = styled.div`
  ${typography.labelRegular};
`;

const TooltipValue = styled.div`
  ${typography.labelSemibold};
  margin-left: ${px(8)};
`;

const LineChartWithDynamicAxis = ({ width, height, data }: Props) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const theme = useTheme();

  const [activeDataItem, setActiveDataItem] = useState<DataItem>();
  const [firstLevelAxisTextWidth, setFirstLevelAxisTextWidth] = useState<number[]>();

  const focusWidth = useMemo(() => width - MARGIN_FOCUS.left - MARGIN_FOCUS.right, [width]);
  const focusHeight = useMemo(() => height - MARGIN_FOCUS.top - MARGIN_FOCUS.bottom, [height]);

  const xAxisParams = useMemo(() => calculateXAxisParams(data, focusWidth), [data, focusWidth]);

  const xScale = useMemo(
    () =>
      d3
        .scaleTime()
        .domain(xAxisParams.xAxisProps.domain)
        .range([MARGIN_FOCUS.left, width - MARGIN_FOCUS.right]),
    [xAxisParams, width]
  );

  const xAxisFirstLevel = useMemo(
    () => (
      <XAxis
        key="x-axis-first-level"
        xScale={xScale}
        tickSize={focusHeight}
        yOffset={height - MARGIN_FOCUS.bottom - MARGIN_FOCUS.top}
        yTickOffset={29}
        tickValues={xAxisParams.xAxisProps.ticksFirstLevel}
        tickFormatFn={xAxisParams.xAxisProps.tickFormatter[0]}
        removeDomain
        customCall={(el: d3.Selection<SVGGElement, unknown, HTMLElement, unknown>) => {
          const textItems = el.selectAll('.tick text');
          const textWidth = textItems
            .nodes()
            .map((item: d3.BaseType) => (item as Element).getBoundingClientRect().width);

          setFirstLevelAxisTextWidth(textWidth);
        }}
      />
    ),
    [
      focusHeight,
      height,
      xAxisParams.xAxisProps.tickFormatter,
      xAxisParams.xAxisProps.ticksFirstLevel,
      xScale,
    ]
  );

  const xAxisSecondLevel = useMemo(
    () => (
      <XAxis
        className="xAxisSecondLevel"
        key="x-axis-second-level"
        xScale={xScale}
        tickSize={focusHeight}
        yOffset={height - MARGIN_FOCUS.bottom - MARGIN_FOCUS.top}
        yTickOffset={42}
        tickValues={xAxisParams.xAxisProps.ticksSecondLevel}
        tickFormatFn={xAxisParams.xAxisProps.tickFormatter[1]}
        removeDomain
        customCall={(el: d3.Selection<SVGGElement, unknown, HTMLElement, unknown>) => {
          const textItems = el.selectAll('.tick text');

          firstLevelAxisTextWidth && textItems.attr('x', (d, i) => -firstLevelAxisTextWidth[i] / 2);
        }}
      />
    ),
    [
      firstLevelAxisTextWidth,
      focusHeight,
      height,
      xAxisParams.xAxisProps.tickFormatter,
      xAxisParams.xAxisProps.ticksSecondLevel,
      xScale,
    ]
  );

  const yAxisParams = calculateYAxisParams({
    values: data,
    addZeroTick: true,
  });

  const yScale = useMemo(
    () =>
      d3
        .scaleLinear()
        .domain(yAxisParams.yAxisDomain)
        .nice()
        .range([height - MARGIN_FOCUS.bottom, MARGIN_FOCUS.top]),
    [height, yAxisParams]
  );

  const yAxis = useMemo(
    () => (
      <YAxis
        key="y-axis"
        yScale={yScale}
        tickSize={focusWidth}
        xOffset={MARGIN_FOCUS.left}
        tickValues={yAxisParams.yAxisTicks}
        removeDomain
        customCall={(el: d3.Selection<SVGGElement, unknown, HTMLElement, unknown>) => {
          const textItems = el.selectAll('.tick text');
          const textWidth = textItems
            .nodes()
            .map((item: d3.BaseType) => (item as Element).getBoundingClientRect().width);

          textItems.attr('x', (d, i) => -textWidth[i] - 8);
        }}
      />
    ),
    [focusWidth, yAxisParams, yScale]
  );

  const line = useMemo(
    () => (
      <Line
        key="line"
        id="line"
        xScale={xScale}
        yScale={yScale}
        data={data.map((d) => ({ x: d.ts, y: d.value }))}
        color="#00B0D7"
        width={4}
        strokeOpacity={1}
        interpolation={false}
      />
    ),
    [data, xScale, yScale]
  );

  const dotItems = useMemo(
    () => (
      <g key="dots" className={DOTS_CONTAINER_CLASS_NAME}>
        {data.map((d) => (
          <Dot
            key={getDotId(d.ts)}
            id={getDotId(d.ts)}
            xScale={xScale}
            yScale={yScale}
            data={{ x: d.ts, y: d.value, name: getDotId(d.ts), lastSync: 0 }}
            color={theme.colors.onSurface}
            fillOpacity={d.ts === activeDataItem?.ts ? 1 : 0}
          />
        ))}
      </g>
    ),
    [activeDataItem?.ts, data, theme.colors.onSurface, xScale, yScale]
  );

  const showCursor = () => {
    d3.select('.focus').select('.cursor').style('opacity', '1');
  };

  const hideCursor = () => {
    d3.select('.focus').select('.cursor').style('opacity', '0');
  };

  const updateTooltipValues = (e: React.MouseEvent<SVGGElement, MouseEvent>) => {
    xScale.invert(d3.pointer(e)[0]);
    const point = d3.pointer(e);
    const x0 = xScale.invert(point[0]).valueOf();
    const idx = d3.bisect(
      data.map((d) => d.ts),
      x0
    );
    const item = data[idx];

    if (!item) {
      return;
    }

    setActiveDataItem(item);

    d3.select('.focus')
      .select('.cursor')
      .attr('d', () => {
        let d = `M${xScale(item.ts)},${focusHeight + MARGIN_FOCUS.top}`;
        d += ` ${xScale(item.ts)},${MARGIN_FOCUS.top}`;
        return d;
      });
  };

  const mouseOver = (e: React.MouseEvent<SVGGElement, MouseEvent>) => {
    showCursor();
    updateTooltipValues(e);
  };

  const mouseOut = () => {
    hideCursor();
    setActiveDataItem(undefined);
  };

  const mouseMove = (e: React.MouseEvent<SVGGElement, MouseEvent>) => {
    showCursor();
    updateTooltipValues(e);
  };

  const formattedDate = useMemo(() => {
    if (!activeDataItem) {
      return '';
    }

    const { tickFormatterType } = xAxisParams.xAxisProps;
    const dateTime = DateTime.fromMillis(activeDataItem.ts);

    switch (tickFormatterType) {
      case 'hour':
        return dateTime.toFormat('h a, MMM d, y').toUpperCase();
      case 'day':
        return dateTime.toFormat('MMM d, y').toUpperCase();
      case 'week':
        return `${dateTime.toFormat('MMM d').toUpperCase()} - ${dateTime
          .plus({ days: 7 })
          .toFormat('MMM d')
          .toUpperCase()}, ${dateTime.toFormat('y')}`;
      case 'month':
        return `${dateTime.toFormat('MMM d').toUpperCase()} - ${dateTime
          .plus({ months: 1 })
          .toFormat('MMM d')
          .toUpperCase()}, ${dateTime.toFormat('y')}`;
      default:
        return `${dateTime.startOf('year').toFormat('MMM d').toUpperCase()} - ${dateTime
          .endOf('year')
          .toFormat('MMM d')
          .toUpperCase()}, ${dateTime.toFormat('y')}`;
    }
  }, [activeDataItem, xAxisParams]);

  const tooltipContent = useMemo(() => {
    if (!activeDataItem) {
      return null;
    }

    return (
      <TooltipContent>
        <TooltipText>{formattedDate}</TooltipText>
        <TooltipRow>
          <TooltipText>ENROLLED:</TooltipText>
          <TooltipValue>{activeDataItem?.value}</TooltipValue>
        </TooltipRow>
      </TooltipContent>
    );
  }, [activeDataItem, formattedDate]);

  const tooltipPosition = useMemo(() => {
    const svgRect = svgRef.current?.getBoundingClientRect();

    if (!svgRect || !activeDataItem) {
      return 'r';
    }

    const pointX = xScale(activeDataItem.ts) - MARGIN_FOCUS.left - MARGIN_FOCUS.right;

    const isLeftPosition = pointX > 0.7 * focusWidth;

    return isLeftPosition ? 'l' : 'r';
  }, [activeDataItem, focusWidth, xScale]);

  if (!width || !height || !data.length) {
    return null;
  }

  return (
    <Container width={width} height={height} ref={containerRef}>
      <SvgContainer
        ref={svgRef}
        viewBox={`0, 0, ${width}, ${height}`}
        $contextVisible={false}
        fWidth={focusWidth}
        fHeight={focusHeight}
      >
        {xAxisFirstLevel}
        {xAxisSecondLevel}
        {yAxis}
        <g className="focus">
          <g className="mouse-effects">
            <path className="cursor" />
          </g>
          {line}
          <rect
            data-testid="line-chart-with-dynamic-axis-rect"
            transform={`translate(${MARGIN_FOCUS.left}, ${MARGIN_FOCUS.top})`}
            width={focusWidth}
            height={focusHeight}
            onMouseOver={mouseOver}
            onMouseOut={mouseOut}
            onMouseMove={mouseMove}
          />
        </g>
        {dotItems}
      </SvgContainer>
      <Tooltip
        static
        content={tooltipContent}
        point={
          activeDataItem
            ? [
                xScale(activeDataItem.ts) +
                  (tooltipPosition === 'r' ? -MARGIN_FOCUS.right : 0) +
                  TOOLTIP_SPACING,
                focusHeight / 2 + MARGIN_FOCUS.top,
              ]
            : undefined
        }
        show={!!activeDataItem}
        position={tooltipPosition}
        horizontalPaddings="m"
      />
    </Container>
  );
};

export default LineChartWithDynamicAxis;
