import React from 'react';
import styled from 'styled-components';
import _xor from 'lodash/xor';
import _noop from 'lodash/noop';

import { SpecColorType } from 'src/styles/theme';
import ChartLegend, { ChartLegendItem, ChartLegendMode } from 'src/common/components/ChartLegend';

export const ADD_TREND_LABEL = 'Add trend line(s)';
export const AVERAGE_LINE_LABEL = 'Add range(s)';
export const isTrendLinesHidden = (names: string[], trendItemName: string) =>
  names.includes(trendItemName);

const addTrendItem = (name: string) => ({
  id: '$trend',
  name,
  color: 'onSurface' as SpecColorType,
  ignoreAsLast: true,
});

const CardContent = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

type Props = {
  children: JSX.Element;
  lines: Omit<ChartLegendItem, 'checked'>[];
  hiddenDataLines?: string[];
  onDataChange?: (hiddenDataLines: string[]) => void;
  canToggle?: boolean;
  addTrendItemName?: string;
  mode?: ChartLegendMode;
};

const OverviewLegendWrapper: React.FC<Props> = ({
  lines,
  children,
  onDataChange = _noop,
  hiddenDataLines = [],
  canToggle,
  addTrendItemName,
  mode,
}) => {
  const resultLines = [...lines, ...(addTrendItemName ? [addTrendItem(addTrendItemName)] : [])];

  return (
    <CardContent>
      {children}
      <ChartLegend
        canToggle={!!canToggle}
        items={resultLines.map((l) => ({
          ...l,
          checked: !hiddenDataLines.includes(l.name),
        }))}
        mode={mode}
        onChange={(idx: number) => onDataChange(_xor(hiddenDataLines, [resultLines[idx].name]))}
      />
    </CardContent>
  );
};

export default OverviewLegendWrapper;
