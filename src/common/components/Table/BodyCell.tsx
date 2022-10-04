import React, { useRef } from 'react';

import styled from 'styled-components';

import Tooltip, { TooltipControls } from 'src/common/components/Tooltip';
import { animation, colors, px, typography } from 'src/styles';
import { ROW_HEIGHT } from './constants';
import { useCellTooltip } from './hooks';
import { ColumnOptions, SortOptions } from './types';

export interface TableCellProps<T> {
  column: ColumnOptions<T>;
  children: React.ReactNode;
  sort?: SortOptions<T>;
}

export type BodyCellContainerProps = Pick<ColumnOptions<object>, 'align' | '$width'>;

export const BodyCellContainer = styled.div<
  BodyCellContainerProps & { isSortedColumnCell?: boolean }
>`
  position: relative;
  box-sizing: border-box;
  height: ${px(ROW_HEIGHT)};
  display: flex;
  align-items: center;
  padding: ${px(7)} ${px(8)};
  background-color: ${({ isSortedColumnCell, theme }) =>
    isSortedColumnCell ? theme.colors.updTableCellActive : 'transparent'};
  color: ${colors.onSurface};
  overflow: hidden;
  transition: background-color 0.3s ${animation.defaultTiming};
  justify-content: ${({ align = 'left' }) =>
    ({
      left: 'flex-start',
      right: 'flex-end',
      center: 'center',
    }[align])};

  > span {
    ${typography.bodyXSmallRegular};
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    min-width: 100%;
  }
`;

const BodyCell = <T,>({ column, sort, children }: TableCellProps<T>): JSX.Element => {
  const tooltipRef = useRef<TooltipControls>(null);
  const { isShowTooltip, handleMouseEnter, handleMouseLeave, currentPos, tooltipStyles } =
    useCellTooltip(tooltipRef);
  const shift = currentPos.includes('t') ? 13 : -13;

  return (
    <BodyCellContainer
      $width={column.$width}
      align={column.align}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-id={column.dataKey}
      isSortedColumnCell={
        !!sort?.sortings.find((s) => s?.column === column.dataKey) && sort?.isProcessing
      }
    >
      <Tooltip
        ref={tooltipRef}
        show={isShowTooltip}
        content={children}
        styles={{
          transform: `translateY(${px(shift)})`,
          fontWeight: 400,
          maxWidth: 300,
          wordBreak: 'break-all',
          ...tooltipStyles,
        }}
      >
        {children}
      </Tooltip>
    </BodyCellContainer>
  );
};

export default BodyCell;
