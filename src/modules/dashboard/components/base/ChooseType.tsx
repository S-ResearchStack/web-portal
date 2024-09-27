import React from 'react';
import styled from 'styled-components';

import { px } from 'src/styles';
import Label, { LabelProps } from './Label';
import type { ChartType } from 'src/modules/api';

import PieChartIcon from 'src/assets/icons/dashboard/pie-chart.svg';
import DonutChartIcon from 'src/assets/icons/dashboard/donut-chart.svg';
import BarChartIcon from 'src/assets/icons/dashboard/bar-chart.svg';
import LineChartIcon from 'src/assets/icons/dashboard/line-chart.svg';
import TableChartIcon from 'src/assets/icons/dashboard/table-chart.svg';
import PieChartSelectedIcon from 'src/assets/icons/dashboard/pie-chart_selected.svg';
import DonutChartSelectedIcon from 'src/assets/icons/dashboard/donut-chart_selected.svg';
import BarChartSelectedIcon from 'src/assets/icons/dashboard/bar-chart_selected.svg';
import LineChartSelectedIcon from 'src/assets/icons/dashboard/line-chart_selected.svg';
import TableChartSelectedIcon from 'src/assets/icons/dashboard/table-chart_selected.svg';

interface ChooseTypeProps extends LabelProps {
  value?: ChartType;
  onChange: (value: ChartType) => void;
}
const ChooseType = ({ value, onChange, ...props }: ChooseTypeProps) => {
  return (
    <Container>
      <Label required {...props}>Choose chart type</Label>
      <List>
        {
          TYPES.map((c) => (
            <Item
              data-testid={`${c}-chart-item`}
              key={c}
              active={c === value}
              onClick={() => onChange(c)}
            >
              {c !== value ? ICONS[c] : SELECTED_ICONS[c]}
            </Item>
          ))
        }
      </List>
    </Container>
  );
};

export default ChooseType;

const TYPES: ChartType[] = [
  'PIE', 'DONUT', 'BAR', 'LINE', 'TABLE',
];

const SELECTED_ICONS: Record<ChartType, React.ReactNode> = {
  'PIE': <PieChartIcon />,
  'DONUT': <DonutChartIcon />,
  'BAR': <BarChartIcon />,
  'LINE': <LineChartIcon />,
  'TABLE': <TableChartIcon />
};
const ICONS = {
  'PIE': <PieChartSelectedIcon />,
  'DONUT': <DonutChartSelectedIcon />,
  'BAR': <BarChartSelectedIcon />,
  'LINE': <LineChartSelectedIcon />,
  'TABLE': <TableChartSelectedIcon />
};

const Container = styled.div`
  margin-bottom: ${px(12)};
`;
const List = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;
const Item = styled.div<{ active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: calc(33% - 6px);
  background: #F7F8FA;
  border: 1px solid;
  height: ${px(56)};
  min-width: ${px(56)};
  border-radius: ${px(8)};
  cursor: ${({ active }) => active ? 'default' : 'pointer'};
  border-color: ${({ active }) => active ? '#9999' : '#eeee'};
`;
