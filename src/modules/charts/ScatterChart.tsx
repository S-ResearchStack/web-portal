import React, { useRef, useMemo, useState, useCallback, useEffect } from 'react';
import { useTheme } from 'styled-components';
import * as d3 from 'd3';
import _isEqual from 'lodash/isEqual';

import { SpecColorType } from 'src/styles/theme';
import Tooltip from 'src/common/components/Tooltip';
import {
  getFocusHeight,
  getFocusWidth,
  getDefaultXRange,
  getDefaultYRange,
  getTooltipPosition,
  MARGIN_FOCUS,
  Container,
  TooltipContent,
  DOTS_CONTAINER_CLASS_NAME,
  TooltipProps,
  TooltipNameBlock,
  TooltipColorPoint,
  TooltipDataBlock,
} from './common-helpers';
import { Line, Dot, DotDataItem, XAxis, YAxis, Zoom } from './common-components';

export interface DotItem {
  name: string;
  age: number;
  value: number;
  lastSync: number;
  color: SpecColorType;
}

export interface LineItem {
  name: string;
  age: number;
  value: number;
  color: SpecColorType;
}

type Props = {
  dots: DotItem[];
  lines: LineItem[];
  width: number;
  height: number;
  showTrendLine?: boolean;
  hiddenDataLines: string[];
};

const BASIC_DOT_SIZE = 8;

const getDotId = (index: number) => `dot-${index}`;

const ScatterChart = ({ dots, lines, width, height, showTrendLine, hiddenDataLines }: Props) => {
  const svgRef = useRef<SVGSVGElement>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const theme = useTheme();

  const [tooltipProps, setTooltipProps] = useState<TooltipProps>(null);
  const [enteredDotId, setEnteredDotId] = useState<string>('');
  const [tooltipDisabled, setTooltipDisabled] = useState(false);

  const linesData = useMemo(() => {
    const groupedData = d3.group(lines, (d) => d.name);
    const groupNames = d3.map(groupedData, (d) => d[0]);
    const sortedLinesData = d3.map(groupedData, (d) =>
      d[1].sort((item1, item2) => item1.age - item2.age)
    );

    const colorScale = d3.scaleOrdinal(
      groupNames,
      d3.map(groupedData, (d) => theme.colors[d[1][0].color])
    );

    return { sortedLinesData, colorScale };
  }, [lines, theme.colors]);

  const xStartDomain = useMemo(() => {
    const minAge = d3.min(dots, (d) => d.age) || 0;
    const maxAge = d3.max(dots, (d) => d.age) || 0;

    return [Math.floor(minAge / 10) * 10, Math.ceil(maxAge / 10) * 10];
  }, [dots]);
  const yStartDomain = useMemo(() => {
    const minValue = d3.min(dots, (d) => +d.value) || 0;
    const maxValue = d3.max(dots, (d) => +d.value) || 0;

    return [Math.floor(minValue / 10) * 10, Math.ceil(maxValue / 10) * 10];
  }, [dots]);

  const [selectedXDomain, setSelectedXDomain] = useState(xStartDomain);
  const [selectedYDomain, setSelectedYDomain] = useState(yStartDomain);

  const xScale = useMemo(
    () => d3.scaleLinear().domain(xStartDomain).range(getDefaultXRange(width)),
    [xStartDomain, width]
  );

  const xScaleSelected = useMemo(
    () => d3.scaleLinear().domain(selectedXDomain).range(getDefaultXRange(width)),
    [selectedXDomain, width]
  );

  const yScale = useMemo(
    () => d3.scaleLinear().domain(yStartDomain).range(getDefaultYRange(height)),
    [yStartDomain, height]
  );

  const yScaleSelected = useMemo(
    () => d3.scaleLinear().domain(selectedYDomain).range(getDefaultYRange(height)),
    [selectedYDomain, height]
  );

  const updateXDomain = useCallback(
    (newDomain: number[]) => {
      if (!_isEqual(newDomain, selectedXDomain)) {
        setSelectedXDomain(newDomain);
      }
    },
    [selectedXDomain]
  );

  const updateYDomain = useCallback(
    (newDomain: number[]) => {
      if (!_isEqual(newDomain, selectedYDomain)) {
        setSelectedYDomain(newDomain);
      }
    },
    [selectedYDomain]
  );

  const onDotMouseEnter = useCallback(
    (event: React.MouseEvent<SVGPathElement, MouseEvent>, d: DotDataItem) => {
      const svgRect = d3.select(svgRef.current).node()?.getBoundingClientRect();
      const dotNode = d3
        .select(svgRef.current)
        .select<Element>(`#${d.id}`)
        .node()
        ?.getBoundingClientRect();
      const color = linesData.colorScale(d.name);

      const tooltipContent = (
        <TooltipContent>
          <TooltipNameBlock>
            <TooltipColorPoint color={color} />
            <p>{`${d.name}:` /* TODO: replace by pacticipant id */}</p>
          </TooltipNameBlock>
          <TooltipDataBlock>
            <p>{Math.round(d.y)} bpm</p>
          </TooltipDataBlock>
        </TooltipContent>
      );

      setTooltipProps({
        content: tooltipContent,
        point: dotNode
          ? [dotNode.x + dotNode.width / 2, dotNode.y + dotNode.height / 2]
          : [event.pageX, event.pageY],
        position: getTooltipPosition(event.pageX, event.pageY, svgRect),
      });

      if (d.id) {
        setEnteredDotId(d.id);
      }
    },
    [linesData]
  );

  const resetSelectedDot = useCallback(() => {
    setTooltipProps(null);
    setEnteredDotId('');
  }, []);

  const getDotOpacity = useCallback(
    (d: DotItem, dotId: string) => {
      if (hiddenDataLines?.includes(d.name)) {
        return 0;
      }

      if (!tooltipProps || enteredDotId === dotId || tooltipDisabled) {
        return 1;
      }

      return 0.5;
    },
    [enteredDotId, hiddenDataLines, tooltipDisabled, tooltipProps]
  );

  const xAxis = useMemo(
    () => (
      <XAxis
        key="x-axis"
        xScale={xScaleSelected}
        tickFormatFn={(d: d3.NumberValue) => `${d} yrs`}
        yTickOffset={20}
        yOffset={height - MARGIN_FOCUS.bottom}
        tickSize={getFocusHeight(height)}
        ticks={6}
        removeDomain
      />
    ),
    [height, xScaleSelected]
  );

  const yAxis = useMemo(
    () => (
      <YAxis
        key="y-axis"
        yScale={yScaleSelected}
        tickSize={getFocusWidth(width)}
        xOffset={MARGIN_FOCUS.left}
        xTickOffset={-20}
        ticks={5}
        removeDomain
      />
    ),
    [width, yScaleSelected]
  );

  const lineItems = useMemo(
    () =>
      linesData.sortedLinesData.map((lineItem) => {
        const id = `line-${lineItem[0].name}`;
        return (
          <Line
            key={id}
            id={id}
            xScale={xScaleSelected}
            yScale={yScaleSelected}
            data={lineItem.map((d) => ({ x: d.age, y: d.value }))}
            color={linesData.colorScale(lineItem[0].name)}
            width={4}
            strokeOpacity={
              // eslint-disable-next-line no-nested-ternary
              !hiddenDataLines?.includes(lineItem[0].name) && showTrendLine
                ? tooltipProps
                  ? 0.5
                  : 1
                : 0
            }
          />
        );
      }),
    [hiddenDataLines, linesData, showTrendLine, tooltipProps, xScaleSelected, yScaleSelected]
  );

  const k = useMemo(() => {
    const kX =
      (xScale.domain()[1] - xScale.domain()[0]) /
      (xScaleSelected.domain()[1] - xScaleSelected.domain()[0]);
    const kY =
      (yScale.domain()[0] - yScale.domain()[1]) /
      (yScaleSelected.domain()[0] - yScaleSelected.domain()[1]);

    return Math.max(kX, kY);
  }, [xScale, xScaleSelected, yScale, yScaleSelected]);

  const dotItems = useMemo(
    () => (
      <g className={DOTS_CONTAINER_CLASS_NAME} key={Math.random()}>
        {dots.map((d, index) => (
          <Dot
            key={getDotId(index)}
            id={getDotId(index)}
            xScale={xScaleSelected}
            yScale={yScaleSelected}
            size={BASIC_DOT_SIZE * k}
            color={theme.colors[d.color]}
            fillOpacity={getDotOpacity(d, `dot-${index}`)}
            data={{ x: d.age, y: d.value, lastSync: d.lastSync, name: d.name }}
            hoverDisabled={tooltipDisabled}
            onMouseEnter={onDotMouseEnter}
          />
        ))}
      </g>
    ),
    [
      dots,
      getDotOpacity,
      k,
      onDotMouseEnter,
      theme.colors,
      tooltipDisabled,
      xScaleSelected,
      yScaleSelected,
    ]
  );

  useEffect(() => {
    d3.select(svgRef.current)
      .select<SVGGElement>('.focus')
      .on('mouseenter', () => tooltipProps && resetSelectedDot());
  });

  if (!width || !height || !dots.length || !lines.length) {
    return null;
  }

  return (
    <Container width={width} height={height} ref={containerRef}>
      <Zoom
        svgRef={svgRef}
        width={width}
        height={height}
        marginFocus={MARGIN_FOCUS}
        showZoomControls={false}
        x={xScaleSelected}
        y={yScaleSelected}
        xContext={xScale}
        yContext={yScale}
        transformK={k}
        childrenBefore={[xAxis, yAxis, lineItems]}
        childrenAfter={[dotItems]}
        updateXDomain={updateXDomain}
        updateYDomain={updateYDomain}
        setChartTooltipDisabled={setTooltipDisabled}
      />
      <Tooltip
        content={tooltipProps?.content}
        point={tooltipProps?.point}
        show={!!tooltipProps && !tooltipDisabled}
        position={tooltipProps?.position}
        dynamic
        arrow
      />
    </Container>
  );
};

export default ScatterChart;
