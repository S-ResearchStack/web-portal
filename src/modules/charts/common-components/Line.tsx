import React from 'react';
import * as d3 from 'd3';

export interface LineDataItem {
  x: number;
  y: number;
}

export const LINE_CLASS_NAME = 'line';

type Props = {
  id: string;
  data: LineDataItem[];
  color: string;
  width?: number;
  xScale: d3.ScaleLinear<number, number, never> | d3.ScaleTime<number, number, never>;
  yScale: d3.ScaleLinear<number, number, never>;
  strokeOpacity: number;
};

const Line: React.FC<Props> = ({ id, data, color, xScale, yScale, strokeOpacity, width }) => {
  const drawLine = () =>
    d3
      .line<LineDataItem>()
      .curve(d3.curveCatmullRom)
      .x((dataItem) => xScale(dataItem.x))
      .y((dataItem) => yScale(dataItem.y))(data);

  if (!data || !data.length || data.some((d) => !xScale(d.x) || !yScale(d.y))) {
    return null;
  }

  return (
    <path
      className={LINE_CLASS_NAME}
      id={id}
      d={drawLine() || ''}
      fill="none"
      stroke={color}
      strokeWidth={(width || 1) / 2}
      strokeOpacity={strokeOpacity}
    />
  );
};

export default Line;
