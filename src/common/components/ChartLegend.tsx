import React, { FC } from 'react';
import styled from 'styled-components';
import _capitalize from 'lodash/capitalize';

import { SpecColorType } from 'src/styles/theme';
import { px, colors, typography } from 'src/styles';
import Radio from './Radio';

const Container = styled.div<{ mode: ChartLegendMode }>`
  display: flex;
  justify-content: ${({ mode }) => (mode === 'left' ? 'start' : 'space-between')};
`;

const ItemWrapper = styled.div<{ $isLast?: boolean; $opacity?: number; mode: ChartLegendMode }>`
  margin-right: ${({ mode }) => (mode === 'left' ? px(10) : 0)};

  circle {
    opacity: ${({ $opacity }) => $opacity || 1};
  }
`;

const RadioLabel = styled.div<{ $canToggle: boolean; $reverse: boolean }>`
  ${typography.bodySmallRegular};
  color: ${colors.onSurface};
  display: flex;
  align-items: center;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  width: 100%;
  -webkit-line-clamp: 2; /* number of lines to show */
  line-clamp: 2;
  -webkit-box-orient: vertical;
  white-space: pre-line;
`;

export type ChartLegendItem = {
  name: string;
  color: SpecColorType;
  checked: boolean;
  ignoreAsLast?: boolean;
  opacity?: number;
};

export type ChartLegendMode = 'left' | 'space-between';

export type ChartLegendProps = {
  items: ChartLegendItem[];
  canToggle: boolean;
  mode?: ChartLegendMode;
  onChange?: (index: number) => void;
};

const ChartLegend: FC<ChartLegendProps> = ({
  items,
  canToggle,
  mode = 'left',
  onChange,
  ...restProps
}) => {
  const isOneItemChecked = items
    ? items.filter(({ ignoreAsLast, checked }) => !ignoreAsLast && checked).length === 1
    : false;

  return (
    <Container mode={mode} {...restProps}>
      {items?.map((item: ChartLegendItem, index: number) => {
        const reverse = mode === 'space-between' && index !== 0;

        return (
          <ItemWrapper
            $isLast={index === items.length - 1}
            key={item.name}
            $opacity={item.opacity}
            mode={mode}
          >
            <Radio
              data-testid={item.name}
              key={item.name}
              kind={canToggle ? 'radio' : 'filled'}
              color={item.color}
              checked={!canToggle || item.checked}
              onChange={() => canToggle && onChange && onChange(index)}
              disabled={canToggle && isOneItemChecked && item.checked && !item.ignoreAsLast}
              reverse={reverse}
              readOnly={!canToggle}
              isLegend
            >
              <RadioLabel $canToggle={canToggle} $reverse={reverse}>
                {_capitalize(item.name)}
              </RadioLabel>
            </Radio>
          </ItemWrapper>
        );
      })}
    </Container>
  );
};

export default ChartLegend;
