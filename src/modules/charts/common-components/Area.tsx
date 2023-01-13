import React from 'react';
import * as d3 from 'd3';
import _isNil from 'lodash/isNil';

export interface AreaDataItem {
  x: number;
  y0: number;
  y1: number;
}

export const AREA_CLASS_NAME = 'area';

const DEFAULT_OPACITY = 0.1;

type Props = {
  id: string;
  data: AreaDataItem[];
  color: string;
  xScale: d3.ScaleTime<number, number, never> | d3.ScaleLinear<number, number, never>;
  yScale: d3.ScaleLinear<number, number, never>;
  visible?: boolean;
  fillOpacity?: number;
  onMouseEnter?: (event: React.MouseEvent<SVGPathElement, MouseEvent>) => void;
  onMouseLeave?: (event: React.MouseEvent<SVGPathElement, MouseEvent>) => void;
};

const Area: React.FC<Props> = ({
  id,
  data,
  color,
  xScale,
  yScale,
  visible,
  fillOpacity,
  onMouseEnter,
  onMouseLeave,
}) => {
  const drawArea = () =>
    d3
      .area<AreaDataItem>()
      .curve(d3.curveCatmullRom)
      .x((dataItem) => xScale(dataItem.x))
      .y0((dataItem) => yScale(dataItem.y0))
      .y1((dataItem) => yScale(dataItem.y1))(data);

  if (!data || !data.length || data.some((d) => _isNil(d.x) || _isNil(d.y0) || _isNil(d.y1))) {
    return null;
  }

  return (
    <path
      className={AREA_CLASS_NAME}
      id={id}
      data-testid={id}
      d={drawArea() || ''}
      fill={color}
      fillOpacity={visible ? fillOpacity || DEFAULT_OPACITY : 0}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    />
  );
};

export default Area;
