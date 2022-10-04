import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import { useUpdateEffect } from 'react-use';
import styled, { useTheme, css } from 'styled-components';
import * as d3 from 'd3';
import _upperFirst from 'lodash/upperFirst';

import { colors, typography } from 'src/styles';
import { SpecColorType } from 'src/styles/theme';
import { XAxis, YAxis } from './common-components';

const axisCommon = css`
  stroke-opacity: 1;
  stroke: ${colors.updBackgoundLight};
`;

const StyledSvg = styled.svg<{ isHorizontal: boolean }>`
  .xAxis {
    .tick {
      line {
        ${axisCommon}
      }
      ${({ isHorizontal }) =>
        isHorizontal
          ? css`
              &:first-child,
              &:last-child {
                line {
                  ${axisCommon}
                }
              }
              line {
                stroke-opacity: 0;
              }
            `
          : css`
              &:last-child {
                line {
                  stroke-dasharray: 1;
                }
              }
              line {
                stroke-dasharray: 2;
              }
            `}
      text {
        ${typography.axisRegular10};
        color: ${colors.updTextPrimary};
      }
    }
  }

  .yAxis {
    .tick {
      line {
        ${axisCommon}
      }
      ${({ isHorizontal }) =>
        !isHorizontal &&
        css`
          &:first-child,
          &:last-child {
            line {
              stroke-dasharray: 1;
            }
          }
          line {
            stroke-dasharray: 2;
          }
        `}
      text {
        ${typography.axisRegular10};
        color: ${colors.updTextPrimary};
      }
    }
  }
`;

type DataItem = {
  name: string;
  dataKey: string;
  value: number;
};

export type GroupedBarChartProps = {
  data: DataItem[];
  width: number;
  height: number;
  barColors: SpecColorType[];
  numberOfKeys: number;
  maxValue: number;
  isHorizontal?: boolean;
  formatXAxisTick?: (d: d3.NumberValue) => string;
  showYNegativeArea?: boolean;
  yTickValues?: Iterable<d3.NumberValue>;
  chartMargin?: { top: number; right: number; bottom: number; left: number };
};

const MARGIN = { top: 0, right: 12, bottom: 36, left: 53 };

const GroupedBarChart = ({
  width,
  height,
  data,
  barColors,
  numberOfKeys,
  maxValue,
  formatXAxisTick,
  isHorizontal,
  showYNegativeArea,
  yTickValues,
  chartMargin = MARGIN,
}: GroupedBarChartProps) => {
  const svgRef = useRef(null);
  const theme = useTheme();

  const x = useMemo(
    () => d3.map(data, (d) => (isHorizontal ? +d.value : d.dataKey)),
    [data, isHorizontal]
  );
  const y = useMemo(
    () => d3.map(data, (d) => (isHorizontal ? d.dataKey : +d.value)),
    [data, isHorizontal]
  );
  const z = useMemo(() => d3.map(data, (d) => d.name), [data]);

  const xRange = useMemo(() => [chartMargin.left, width - chartMargin.right], [chartMargin, width]);
  const yRange = useMemo(
    () => [height - chartMargin.bottom, chartMargin.top],
    [chartMargin, height]
  );

  const xScale = useMemo(
    () => (isHorizontal ? d3.scaleLinear([0, maxValue], xRange).nice() : d3.scaleBand(x, xRange)),
    [isHorizontal, maxValue, x, xRange]
  );
  const yScale = useMemo(
    () =>
      isHorizontal
        ? d3.scaleBand(y, yRange)
        : d3.scaleLinear([showYNegativeArea ? -maxValue : 0, maxValue], yRange).nice(),
    [isHorizontal, maxValue, showYNegativeArea, y, yRange]
  );
  const zScale = useMemo(
    () =>
      d3.scaleOrdinal(
        z,
        barColors.map((color) => theme.colors[color])
      ),
    [barColors, theme.colors, z]
  );
  const crossScale = useMemo(
    () =>
      d3
        .scaleBand(z, [0, ((isHorizontal ? yScale : xScale) as d3.ScaleBand<string>).bandwidth()])
        .padding((2 / numberOfKeys) * 0.56),
    [isHorizontal, numberOfKeys, xScale, yScale, z]
  );

  const updateAxis = useCallback(() => {
    d3.select(svgRef.current).select('.upperChartBorder').remove();
    d3.select(svgRef.current).select('.rightChartBorder').remove();

    if (isHorizontal) {
      /* upper chart border */
      d3.select(svgRef.current)
        .append('line')
        .attr('class', 'upperChartBorder')
        .style('stroke', theme.colors.onSurface)
        .style('stroke-width', 1)
        .style('stroke-opacity', 0.2)
        .attr('x1', chartMargin.left)
        .attr('y1', 0)
        .attr('x2', width - chartMargin.right)
        .attr('y2', 0);
    } else {
      /* right chart border */
      d3.select(svgRef.current)
        .append('line')
        .attr('class', 'rightChartBorder')
        .style('stroke', theme.colors.onSurface)
        .style('stroke-width', 1)
        .style('stroke-dasharray', 1)
        .style('stroke-opacity', 0.2)
        .attr('x1', width - chartMargin.right)
        .attr('y1', 0)
        .attr('x2', width - chartMargin.right)
        .attr('y2', height - chartMargin.bottom);
    }
  }, [height, isHorizontal, theme.colors.onSurface, width, chartMargin]);

  const updateChart = useCallback(() => {
    updateAxis();

    d3.select(svgRef.current).select('.bars').selectAll('rect').remove();

    const xCoord = (i: number) =>
      isHorizontal
        ? (xScale as d3.ScaleLinear<number, number, never>)(0)
        : (xScale(x[i] as d3.NumberValue & (string | number)) as number) +
          (crossScale(z[i] as string) as number);

    const yCoord = (i: number) =>
      isHorizontal
        ? (yScale(y[i] as d3.NumberValue & (string | number)) as number) +
          (crossScale(z[i] as string) as number)
        : (yScale as d3.ScaleLinear<number, number, never>)(y[i] < 0 ? 0 : (y[i] as number));

    const barWidth = (i: number) =>
      isHorizontal
        ? (xScale(x[i] as d3.NumberValue & (string | number)) as number) -
          (xScale as d3.ScaleLinear<number, number, never>)(0)
        : crossScale.bandwidth();

    const barHeight = (i: number) =>
      isHorizontal
        ? crossScale.bandwidth()
        : Math.abs(
            (yScale as d3.ScaleLinear<number, number, never>)(0) -
              (yScale(y[i] as d3.NumberValue & (string | number)) as number)
          );

    d3.select(svgRef.current)
      .select('.bars')
      .selectAll('rect')
      .data(d3.range(y.length))
      .join('rect')
      .attr('x', xCoord)
      .attr('y', yCoord)
      .attr('width', barWidth)
      .attr('height', barHeight)
      .attr('fill', (i) => zScale(z[i]));
  }, [updateAxis, y, isHorizontal, xScale, x, crossScale, z, yScale, zScale]);

  useEffect(() => {
    updateChart();
  });

  useUpdateEffect(() => {
    updateChart();
  }, [data, width, height]);

  return (
    <StyledSvg ref={svgRef} width={width} height={height} isHorizontal={!!isHorizontal}>
      <XAxis
        xScale={xScale}
        removeDomain
        yOffset={height - chartMargin.bottom}
        yTickOffset={isHorizontal ? 31 : 24}
        ticks={4}
        tickSize={height - chartMargin.top - chartMargin.bottom}
        tickFormatFn={(d) => (formatXAxisTick ? formatXAxisTick(d) : `${d}`)}
        customCall={(el: d3.Selection<SVGGElement, unknown, HTMLElement, unknown>) => {
          el.selectAll('.tick text')
            .attr(
              'transform',
              (!isHorizontal &&
                `translate(-${(xScale as d3.ScaleBand<string>).bandwidth() / 2}, 0)`) ||
                null
            )
            .style('text-anchor', isHorizontal ? '' : 'start');
          el.selectAll('.tick line').attr(
            'transform',
            !isHorizontal
              ? `translate(-${(xScale as d3.ScaleBand<string>).bandwidth() / 2}, 0)`
              : null
          );
        }}
      />
      <YAxis
        yScale={yScale}
        xOffset={chartMargin.left}
        removeDomain
        tickSize={width - chartMargin.left - chartMargin.right}
        tickFormatFn={(d) => _upperFirst(`${d}`)}
        tickValues={yTickValues}
        customCall={(el: d3.Selection<SVGGElement, unknown, HTMLElement, unknown>) => {
          const textItems = el.selectAll('.tick text');
          const textWidth = textItems
            .nodes()
            .map((item: d3.BaseType) => (item as Element).getBoundingClientRect().width);

          textItems.attr('x', (d, i) => (isHorizontal ? -45 : -textWidth[i] - 8)).attr('y', 1);

          el.selectAll('.tick line').attr(
            'transform',
            isHorizontal
              ? `translate(0, ${(yScale as d3.ScaleBand<string>).bandwidth() / 2})`
              : null
          );
        }}
      />
      <g className="bars" />
    </StyledSvg>
  );
};

export default GroupedBarChart;
