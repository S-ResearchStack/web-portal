import React from 'react';
import * as d3 from 'd3';
import { DateTime } from 'luxon';

import { TooltipPosition } from 'src/common/components/Tooltip';

import {
  MARGIN_CONTEXT_X,
  AXIS_X_HEIGHT,
  MARGIN_CONTEXT_Y,
  AXIS_Y_WIDTH,
  MARGIN_FOCUS,
  TOOLTIP_BOUNDARIES_THRESHOLD,
  CONTEXT_X_HEIGHT,
  SLIDER_SIZE,
  CONTEXT_Y_WIDTH,
} from './constants';

export const getRangeFromSelection = (v: [number, number]): number => v[1] - v[0];

export const calcNextSelectionByMovement = (
  currentSelection: [number, number],
  originalSelectionRange: [number, number],
  movement: number
): [number, number] | null => {
  const currentRange = getRangeFromSelection(currentSelection);
  const originalRange = getRangeFromSelection(originalSelectionRange);
  const k = currentRange / originalRange;
  const nextSelection = currentSelection.map((v) => v - movement * k);
  if (
    nextSelection[0] < originalSelectionRange[0] ||
    nextSelection[1] > originalSelectionRange[1]
  ) {
    return currentSelection;
  }
  return nextSelection as [number, number];
};

export const getMarginContextX = (fHeight: number) => ({
  ...MARGIN_CONTEXT_X,
  bottom: AXIS_X_HEIGHT + fHeight,
});

export const getMarginContextY = (fWidth: number) => ({
  ...MARGIN_CONTEXT_Y,
  left: AXIS_Y_WIDTH + fWidth,
});

export const getFocusWidth = (width: number) => width - MARGIN_FOCUS.left - MARGIN_FOCUS.right;

export const getFocusHeight = (height: number) => height - MARGIN_FOCUS.top - MARGIN_FOCUS.bottom;

export const getDefaultXRange = (width: number) => [MARGIN_FOCUS.left, width - MARGIN_FOCUS.right];

export const getDefaultYRange = (height: number) => [
  height - MARGIN_FOCUS.bottom,
  MARGIN_FOCUS.top,
];

export const isResetButtonShown = (xSel: number[], ySel: number[]) =>
  xSel[0] !== 0 || xSel[1] !== 1 || ySel[0] !== 0 || ySel[1] !== 1;

export const getTooltipPosition = (pointX: number, pointY: number, svgRect?: DOMRect) => {
  if (!svgRect) {
    return 't';
  }

  const pY = (pointY - svgRect.bottom) / (svgRect.top - svgRect.bottom);
  const isLeftPosition = svgRect.right - pointX - MARGIN_FOCUS.right < TOOLTIP_BOUNDARIES_THRESHOLD;
  const isRightPosition = pointX - svgRect.left - MARGIN_FOCUS.left < TOOLTIP_BOUNDARIES_THRESHOLD;
  const isBottomPosition = pY > 0.66;

  if (isLeftPosition) {
    return 'l';
  }

  if (isRightPosition) {
    return 'r';
  }

  return isBottomPosition ? 'b' : 't';
};

/* prevent chart from going out of focus borders */

export const appendClipPath = (
  svgRef: React.RefObject<SVGSVGElement>,
  focusWidth: number,
  focusHeight: number
) => {
  d3.select(svgRef.current).select('#clip').remove();
  d3.select(svgRef.current)
    .append('defs')
    .append('clipPath')
    .attr('transform', `translate(${MARGIN_FOCUS.left}, ${MARGIN_FOCUS.top})`)
    .attr('id', 'clip')
    .append('rect')
    .attr('width', focusWidth)
    .attr('height', focusHeight);
};

/* dragging the chart area */

export const brushXSelection = (svgRef: React.RefObject<SVGSVGElement>) => {
  const brushNode = d3
    .select(svgRef.current)
    .select('.context')
    .select<SVGGElement>('.brushX')
    .node();
  return brushNode && ((d3.brushSelection(brushNode) as [number, number]) || null);
};

export const brushYSelection = (svgRef: React.RefObject<SVGSVGElement>) => {
  const brushNode = d3
    .select(svgRef.current)
    .select('.context')
    .select<SVGGElement>('.brushY')
    .node();
  return brushNode && ((d3.brushSelection(brushNode) as [number, number]) || null);
};

/* zoom */

export const appendZoom = (
  svgRef: React.RefObject<SVGSVGElement>,
  focusWidth: number,
  focusHeight: number,
  zoom: d3.ZoomBehavior<SVGGElement, unknown>,
  mouseDown: (event: MouseEvent) => void
) => {
  d3.select(svgRef.current).select('.focus').select('.zoom').remove();
  d3.select(svgRef.current)
    .select('.focus')
    .append('rect')
    .attr('transform', `translate(${MARGIN_FOCUS.left}, ${MARGIN_FOCUS.top})`)
    .attr('class', 'zoom')
    .attr('width', focusWidth)
    .attr('height', focusHeight)
    .on('mousedown', mouseDown)
    .raise();
  d3.select(svgRef.current).select<SVGGElement>('.focus').call(zoom);
};

export const getZoomBehavior = (
  width: number,
  height: number,
  zoomed: (event: d3.D3ZoomEvent<SVGGElement, unknown>) => void
) =>
  d3
    .zoom<SVGGElement, unknown>()
    .filter((e) => e.type !== 'wheel')
    .translateExtent([
      [MARGIN_FOCUS.left, MARGIN_FOCUS.top],
      [width - MARGIN_FOCUS.right, height - MARGIN_FOCUS.top],
    ])
    .extent([
      [MARGIN_FOCUS.left, MARGIN_FOCUS.top],
      [width - MARGIN_FOCUS.right, height - MARGIN_FOCUS.top],
    ])
    .on('zoom', zoomed);

export const initBrushX = (
  focusHeight: number,
  focusWidth: number,
  brushedX: (event: d3.D3BrushEvent<unknown>) => void
) =>
  d3
    .brushX()
    .extent([
      [getMarginContextX(focusHeight).left, CONTEXT_X_HEIGHT / 2 - SLIDER_SIZE / 2],
      [getMarginContextX(focusHeight).left + focusWidth, CONTEXT_X_HEIGHT / 2 + SLIDER_SIZE / 2],
    ])
    .on('brush end', brushedX);

export const initBrushY = (
  focusWidth: number,
  height: number,
  brushedY: (event: d3.D3BrushEvent<unknown>) => void
) =>
  d3
    .brushY()
    .extent([
      [
        getMarginContextY(focusWidth).left + CONTEXT_Y_WIDTH / 2 - SLIDER_SIZE / 2,
        getMarginContextY(focusWidth).bottom,
      ],
      [
        getMarginContextY(focusWidth).left + CONTEXT_Y_WIDTH / 2 + SLIDER_SIZE / 2,
        height - getMarginContextY(focusWidth).top,
      ],
    ])
    .on('brush end', brushedY);

export const appendLines = <T extends { name: string }>(
  svgRef: React.RefObject<SVGSVGElement>,
  values: T[][],
  drawLine: (d: T[]) => string | null,
  colorScale: d3.ScaleOrdinal<string, string, never>
) => {
  d3.select(svgRef.current).select('.focus').selectAll('path').remove();

  const focus = d3.select(svgRef.current).select('.focus');

  focus
    .selectAll('.line')
    .data(values)
    .enter()
    .append('path')
    .attr('class', 'line')
    .attr('id', (d) => `line-${d[0].name}`)
    .attr('fill', 'none')
    .attr('stroke', (d) => colorScale(d[0].name))
    .attr('stroke-width', 3)
    .attr('d', drawLine);
};

export const updateContext = (
  svgRef: React.RefObject<SVGSVGElement>,
  xRange: number[],
  yRange: number[],
  lastXRelativeSelection: number[],
  lastYRelativeSelection: number[],
  brushX: d3.BrushBehavior<unknown>,
  brushY: d3.BrushBehavior<unknown>,
  moveBrushX: (newS: number[], updateSelection?: boolean) => void,
  moveBrushY: (newS: number[], updateSelection?: boolean) => void,
  moveLastSelection?: boolean
) => {
  d3.select(svgRef.current).select('.context').remove();

  const context = d3.select(svgRef.current).append('g').attr('class', 'context');

  const bX = context.append('g').attr('class', 'brushX').call(brushX);

  bX.selectAll('.handle').attr('transform', 'translate(0, -7)').attr('rx', 1);
  bX.selectAll('.selection').attr('transform', 'translate(0, -10)');
  bX.selectAll('.overlay').attr('transform', 'translate(0, -1)');

  moveBrushX(
    moveLastSelection
      ? [
          xRange[0] + lastXRelativeSelection[0] * (xRange[1] - xRange[0]),
          xRange[0] + lastXRelativeSelection[1] * (xRange[1] - xRange[0]),
        ]
      : xRange,
    moveLastSelection
  );

  const bY = context.append('g').attr('class', 'brushY').call(brushY);

  bY.selectAll('.handle').attr('transform', 'translate(-4)').attr('rx', 1);
  bY.selectAll('.selection').attr('transform', 'translate(-7)');
  bY.selectAll('.overlay').attr('transform', 'translate(2)');

  moveBrushY(
    moveLastSelection
      ? [
          yRange[0] + lastYRelativeSelection[0] * (yRange[1] - yRange[0]),
          yRange[0] + lastYRelativeSelection[1] * (yRange[1] - yRange[0]),
        ]
      : yRange,
    moveLastSelection
  );
};

export const gradientPoints = [
  { offset: '0%' },
  { offset: '41%' },
  { offset: '41%', isColored: true },
  { offset: '50%', isColored: true },
  { offset: '59%', isColored: true },
  { offset: '59%' },
  { offset: '100%' },
];

export const formatTimeAxisTick = (d: d3.NumberValue) => {
  const utcD = DateTime.fromMillis(d.valueOf()).toUTC();
  const minutes = utcD.toFormat('m');
  const format = +minutes > 0 ? 'h:m a' : 'h a';

  return utcD.toFormat(format).toLowerCase();
};

export const formatTimeAxisWithNames = (d: d3.NumberValue) => {
  const utcD = DateTime.fromMillis(d.valueOf()).toUTC();
  const format = 'h a';
  const time = utcD.toFormat(format);

  if (time.includes('3') || time.includes('9')) {
    return ' ';
  }

  if (time === '12 PM') {
    return 'NOON';
  }

  if (time === '12 AM') {
    return 'MIDNIGHT';
  }

  return time;
};

export type TooltipProps = {
  content: React.ReactNode;
  point: [number, number];
  position: TooltipPosition;
} | null;
