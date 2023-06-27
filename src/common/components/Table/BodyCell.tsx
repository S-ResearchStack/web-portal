import React, { useRef } from 'react';
import styled from 'styled-components';

import Tooltip, { TooltipControls } from 'src/common/components/Tooltip';
import { animation, colors, px, typography } from 'src/styles';

import { CELL_LINE_HEIGHT, CELL_VERTICAL_PADDING } from './constants';
import { useCellTooltip } from './hooks';
import { ColumnOptions } from './types';

interface TableCellProps<T> {
  column: ColumnOptions<T>;
  children: React.ReactNode;
  linesCount?: number;
}

type BodyCellContainerProps = Pick<ColumnOptions<object>, 'align' | '$width'> & {
  linesCount?: number;
};

export const BodyCellContainer = styled.div<BodyCellContainerProps>`
  position: relative;
  box-sizing: border-box;
  height: ${({ linesCount }) => px(CELL_VERTICAL_PADDING + CELL_LINE_HEIGHT * (linesCount || 1))};
  display: flex;
  align-items: center;
  padding: ${px(7)} ${px(8)};
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
    white-space: ${({ linesCount }) => (linesCount ? 'pre' : 'nowrap')};
    text-overflow: ellipsis;
    overflow: hidden;
    min-width: 100%;
  }
`;

const BodyCell = <T,>({ column, children, linesCount }: TableCellProps<T>): JSX.Element => {
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
      linesCount={linesCount}
    >
      {column.ellipsis !== false ? (
        <Tooltip
          ref={tooltipRef}
          show={isShowTooltip}
          content={children}
          styles={{
            transform: `translateY(${px(shift)})`,
            fontWeight: 400,
            maxWidth: 300,
            wordBreak: 'break-all',
            whiteSpace: 'pre-wrap',
            ...tooltipStyles,
          }}
        >
          {children}
        </Tooltip>
      ) : (
        children
      )}
    </BodyCellContainer>
  );
};

export default BodyCell;
