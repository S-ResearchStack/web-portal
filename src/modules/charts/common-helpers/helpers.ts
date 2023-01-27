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
  NO_RESPONSES_LABEL,
} from './constants';

export const getRangeFromSelection = (v: [number, number]): number => v[1] - v[0];

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
  moveLastSelection = false
) => {
  d3.select(svgRef.current).select('.context').remove();

  const context = d3
    .select(svgRef.current)
    .append('g')
    .attr('class', 'context')
    .attr('display', 'none');

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

export const getEmptyStateData = (color: string) => ({
  value: 1,
  color,
  total: 1,
  count: 1,
  name: NO_RESPONSES_LABEL,
});
