import * as d3 from 'd3';
import { degreesToRadians } from './utils';

export function drawPieChartShape<
  T extends { value: number; color: string; name: string; count: number; total: number }
>(
  {
    svg,
    outerRadius,
    innerRadius = 0,
    startAngleDegrees,
    data,
  }: {
    svg: SVGElement;
    outerRadius: number;
    innerRadius?: number;
    startAngleDegrees: number;
    data: T[];
  },
  onMouseEnter?: (event: React.MouseEvent<SVGPathElement, MouseEvent>, index: number) => void,
  onMouseLeave?: (event: React.MouseEvent<SVGPathElement, MouseEvent>) => void
) {
  d3.select(svg).selectChild().remove();

  const pieData = d3
    .pie<T>()
    .value((d) => d.value)
    .startAngle(degreesToRadians(startAngleDegrees))
    .endAngle(degreesToRadians(startAngleDegrees + 360))
    .sort(null)(data);

  const arcGenerator = d3
    .arc<d3.PieArcDatum<T>>()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius);

  const container = d3
    .select(svg)
    .append('g')
    .attr('transform', `translate(${outerRadius}, ${outerRadius})`);

  container
    .selectAll(null)
    .data(pieData)
    .enter()
    .append('path')
    .attr('data-testid', (d) => `arc-shape-${d.index}`)
    .attr('d', arcGenerator)
    .attr('fill', (d) => d.data.color)
    .on('mouseenter', (e, d) => onMouseEnter?.(e, d.index))
    .on('mouseleave', (e) => onMouseLeave?.(e));

  return { container, pieData, arcGenerator };
}
