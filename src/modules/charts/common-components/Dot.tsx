import React, { useMemo } from 'react';
import * as d3 from 'd3';

export interface DotDataItem {
  x: number;
  y: number;
  name: string;
  lastSync: number;
  id?: string;
}

export const DOT_CLASS_NAME = 'dot';

type Props = {
  id: string;
  data: DotDataItem;
  color: string;
  size?: number;
  xScale: d3.ScaleTime<number, number, never> | d3.ScaleLinear<number, number, never>;
  yScale: d3.ScaleLinear<number, number, never>;
  fillOpacity?: number;
  hoverDisabled?: boolean;
  onClick?: (event: React.MouseEvent<SVGPathElement, MouseEvent>, d: DotDataItem) => void;
  onMouseEnter?: (event: React.MouseEvent<SVGPathElement, MouseEvent>, d: DotDataItem) => void;
};

const Dot: React.FC<Props> = ({
  id,
  data,
  color,
  size = 8,
  xScale,
  yScale,
  fillOpacity,
  hoverDisabled,
  onClick,
  onMouseEnter,
}) => {
  if (!data || !xScale(data.x) || !yScale(data.y)) {
    return null;
  }

  const clickOrMouseEnterEnabled = useMemo(
    () => (!!onClick || !!onMouseEnter) && !hoverDisabled,
    [hoverDisabled, onClick, onMouseEnter]
  );

  return (
    <circle
      className={DOT_CLASS_NAME}
      id={id}
      transform={`translate(${xScale(data.x)},${yScale(data.y)})`}
      r={size / 2}
      fill={color}
      fillOpacity={fillOpacity}
      pointerEvents={clickOrMouseEnterEnabled ? 'all' : 'none'}
      cursor={clickOrMouseEnterEnabled ? 'pointer' : 'default'}
      onClick={(event) => onClick?.(event, data)}
      onMouseEnter={(event) => onMouseEnter?.(event, { ...data, id })}
    />
  );
};

export default Dot;
