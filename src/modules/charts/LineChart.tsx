import React, { useCallback, useRef, useMemo, useState, useEffect } from 'react';
import styled, { useTheme } from 'styled-components';
import * as d3 from 'd3';

import { SpecColorType } from 'src/styles/theme';
import Tooltip from 'src/common/components/Tooltip';
import { format } from 'src/common/utils/datetime';
import {
  getFocusWidth,
  getFocusHeight,
  getDefaultXRange,
  getDefaultYRange,
  getTooltipPosition,
  MARGIN_FOCUS,
  Container,
  TooltipContent,
  formatTimeAxisWithNames,
  DOTS_CONTAINER_CLASS_NAME,
  TooltipProps,
  StyledSvg,
  TooltipNameBlock,
  TooltipDataBlock,
  TooltipColorPoint,
} from './common-helpers';
import { Line, Area, Dot, DotDataItem, XAxis, YAxis } from './common-components';

export interface DataItem {
  // TODO there should be participant id
  name: string;
  ts: number;
  value: number;
  min: number;
  max: number;
  highlighted: boolean;
  lastSync: number;
  color: SpecColorType;
}

type Props = {
  data: DataItem[];
  xDomain: number[];
  width: number;
  height: number;
  showTrendLines?: boolean;
  hiddenDataLines: string[];
  onDotClick: (_: React.MouseEvent<SVGPathElement, MouseEvent>, d: DataItem) => void; // TODO we need participant id from data, that's why unused attributes here
};

const getDotId = (name: string, ts: number) => `dot-${name}-${ts}`;

const SvgContainer = styled(StyledSvg)`
  .focus {
    cursor: default;
  }
`;

const LineChart = ({
  width,
  height,
  data,
  xDomain,
  showTrendLines,
  hiddenDataLines,
  onDotClick,
}: Props) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const theme = useTheme();

  const [tooltipProps, setTooltipProps] = useState<TooltipProps>(null);
  const [enteredDotId, setEnteredDotId] = useState<string>('');

  const chartData = useMemo(() => {
    const groupedData = d3.group(data, (d) => d.name);
    const groupNames = d3.map(groupedData, (d) => d[0]);
    const sortedChartData = d3.map(groupedData, (d) => {
      const ds = [...d[1]];
      ds.sort((item1, item2) => item1.ts - item2.ts);
      return ds;
    });

    const colorScale = d3.scaleOrdinal(
      groupNames,
      d3.map(groupedData, (d) => theme.colors[d[1][0].color])
    );

    return { sortedChartData, colorScale };
  }, [data, theme.colors]);

  const yStartDomain = useMemo(() => {
    const minData = d3.min(data, (d) => (d.min ? +d.min : 0)) || 0;
    const maxData = d3.max(data, (d) => (d.max ? +d.max : 0)) || 0;

    return [Math.floor(minData / 10) * 10, Math.ceil(maxData / 10) * 10];
  }, [data]);

  const xScale = useMemo(
    () => d3.scaleTime().domain(xDomain).range(getDefaultXRange(width)),
    [xDomain, width]
  );

  const yScale = useMemo(
    () => d3.scaleLinear().domain(yStartDomain).nice().range(getDefaultYRange(height)),
    [height, yStartDomain]
  );

  const showDot = useCallback(
    (d: DataItem) => !hiddenDataLines?.includes(d.name) && d.highlighted,
    [hiddenDataLines]
  );

  const onDotMouseEnter = useCallback(
    (event: React.MouseEvent<SVGPathElement, MouseEvent>, enteredDot: DotDataItem) => {
      if (!svgRef.current) {
        return;
      }

      const svgRect = svgRef.current.getBoundingClientRect();
      const dotNode = d3
        .select(svgRef.current)
        .select<Element>(`#${enteredDot.id}`)
        .node()
        ?.getBoundingClientRect();
      const color = chartData.colorScale(enteredDot.name);

      const tooltipContent = (
        <TooltipContent>
          <TooltipNameBlock>
            <TooltipColorPoint color={color} />
            <p>{`${enteredDot.name}:` /* TODO: replace name by participant id */}</p>
          </TooltipNameBlock>
          <TooltipDataBlock>
            <p>{Math.round(enteredDot.y)} bpm</p>
            <p>{format(enteredDot.lastSync, 'hh:mm a')}</p>
          </TooltipDataBlock>
        </TooltipContent>
      );

      setTooltipProps({
        content: tooltipContent,
        point: dotNode
          ? [
              dotNode.x - svgRect.left + dotNode.width / 2,
              dotNode.y - svgRect.top + dotNode.height / 2,
            ]
          : [event.pageX - svgRect.left, event.pageY - svgRect.top],
        position: getTooltipPosition(event.pageX, event.pageY, svgRect),
      });

      if (enteredDot.id) {
        setEnteredDotId(enteredDot.id);
      }
    },
    [chartData]
  );

  const resetSelectedDot = useCallback(() => {
    setTooltipProps(null);
    setEnteredDotId('');
  }, []);

  const getDotOpacity = useCallback(
    (d: DataItem, dotId: string) => {
      if (!showDot(d)) {
        return 0;
      }

      if (!tooltipProps || enteredDotId === dotId) {
        return 1;
      }

      return 0.5;
    },
    [enteredDotId, showDot, tooltipProps]
  );

  const xAxis = useMemo(
    () => (
      <XAxis
        key="x-axis"
        xScale={xScale}
        tickSize={getFocusHeight(height)}
        yOffset={height - MARGIN_FOCUS.bottom}
        yTickOffset={20}
        ticks={6}
        tickFormatFn={formatTimeAxisWithNames}
        removeDomain
      />
    ),
    [height, xScale]
  );

  const yAxis = useMemo(
    () => (
      <YAxis
        key="y-axis"
        yScale={yScale}
        tickSize={getFocusWidth(width)}
        xOffset={MARGIN_FOCUS.left}
        xTickOffset={-20}
        ticks={4}
        removeDomain
      />
    ),
    [width, yScale]
  );

  const lineItems = useMemo(
    () =>
      chartData.sortedChartData.map((dataItem) => {
        const id = `line-${dataItem[0].name}`;
        return (
          <Line
            key={id}
            id={id}
            xScale={xScale}
            yScale={yScale}
            data={dataItem.map((d) => ({ x: d.ts, y: d.value }))}
            color={chartData.colorScale(dataItem[0].name)}
            width={4}
            strokeOpacity={
              // eslint-disable-next-line no-nested-ternary
              !hiddenDataLines?.includes(dataItem[0].name) ? (tooltipProps ? 0.5 : 1) : 0
            }
          />
        );
      }),
    [chartData, hiddenDataLines, tooltipProps, xScale, yScale]
  );

  const areaItems = useMemo(
    () =>
      chartData.sortedChartData.map((dataItem) => {
        const id = `area-${dataItem[0].name}`;
        return (
          <Area
            key={id}
            id={id}
            xScale={xScale}
            yScale={yScale}
            data={dataItem.map((d) => ({ x: d.ts, y0: d.min, y1: d.max }))}
            color={chartData.colorScale(dataItem[0].name)}
            visible={!hiddenDataLines?.includes(dataItem[0].name) && showTrendLines}
          />
        );
      }),
    [chartData, hiddenDataLines, showTrendLines, xScale, yScale]
  );

  const dotItems = useMemo(
    () => (
      <g key="dots" className={DOTS_CONTAINER_CLASS_NAME}>
        {chartData.sortedChartData.map((dataItem) =>
          dataItem.map(
            (d) =>
              d.highlighted && (
                <Dot
                  key={getDotId(d.name, d.ts)}
                  id={getDotId(d.name, d.ts)}
                  xScale={xScale}
                  yScale={yScale}
                  data={{ x: d.ts, y: d.value, lastSync: d.lastSync, name: d.name }}
                  color={theme.colors.onSurface}
                  fillOpacity={getDotOpacity(d, `dot-${d.name}-${d.ts}`)}
                  onMouseEnter={onDotMouseEnter}
                  onClick={(event) => onDotClick(event, d)}
                />
              )
          )
        )}
      </g>
    ),
    [
      chartData.sortedChartData,
      getDotOpacity,
      onDotClick,
      onDotMouseEnter,
      theme.colors.onSurface,
      xScale,
      yScale,
    ]
  );

  useEffect(() => {
    d3.select(svgRef.current)
      .select<SVGGElement>('.focus')
      .on('mouseenter', () => tooltipProps && resetSelectedDot());
  });

  if (!width || !height || !data.length) {
    return null;
  }

  return (
    <Container width={width} height={height} ref={containerRef}>
      <SvgContainer
        ref={svgRef}
        focusWidth={getFocusWidth(width)}
        viewBox={`0, 0, ${width}, ${height}`}
        $contextVisible={false}
      >
        {xAxis}
        {yAxis}
        {lineItems}
        {areaItems}
        <g key="focus" className="focus">
          <rect
            transform={`translate(${MARGIN_FOCUS.left}, ${MARGIN_FOCUS.top})`}
            width={getFocusWidth(width)}
            height={getFocusHeight(height)}
            fill="transparent"
          />
        </g>
        {dotItems}
      </SvgContainer>
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

export default LineChart;
