import React, { useEffect, useMemo, useRef, useState } from 'react';

import styled, { css } from 'styled-components';

import Tooltip, { TooltipControls } from 'src/common/components/Tooltip';
import IconButton from 'src/common/components/IconButton';
import SortDisabledIcon from 'src/assets/icons/sort_disable.svg';
import SortAscIcon from 'src/assets/icons/sort_asc.svg';
import SortDescIcon from 'src/assets/icons/sort_dsc.svg';
import { animation, colors, px, typography } from 'src/styles';

import { useCellTooltip } from './hooks';
import { BodyCellContainer } from './BodyCell';
import { ColumnOptions, SortOptions } from './types';
import Loader from './Loader';
import { ROW_HEIGHT } from './constants';

export interface HeadCellProps<T> {
  isActive: boolean;
  sortParams?: SortOptions<T>;
  column: ColumnOptions<T>;
  onColumnClick: (column: ColumnOptions<T>) => void;
  isProcessing: boolean;
  isFirstRender: boolean;
}

export const HEAD_CELL_MAX_ACTIONS_COUNTER = 1;

export const SortColumnBtnContainer = styled.div`
  width: ${px(24)};
  height: ${px(24)};
  margin-left: ${px(8)};
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

export const HeadCellContainer = styled(BodyCellContainer)<{ sortable: boolean; active: boolean }>`
  user-select: none;
  color: ${colors.primary};
  box-shadow: inset 0 ${px(-1)} 0 ${colors.primaryLight};

  ${({ active, theme, sortable }) => css`
    background-color: ${active ? theme.colors.primary05 : theme.colors.surface};

    > * {
      transition: background 0.3s ${animation.defaultTiming};
    }

    :hover {
      background-color: ${theme.colors[active ? 'primary05' : 'background']};
      cursor: ${sortable && 'pointer'};
    }
  `};

  > span {
    min-width: auto;
    ${typography.bodyXSmallSemibold};
    &:first-letter {
      text-transform: uppercase;
    }
  }
`;

const HeadCell = <T,>({
  isActive,
  sortParams,
  column,
  onColumnClick,
  isProcessing,
  isFirstRender,
}: HeadCellProps<T>): JSX.Element => {
  const tooltipRef = useRef<TooltipControls>(null);

  const isSortedColumnCell = useMemo(
    () => sortParams?.sortings?.find((s) => s.column === column.dataKey)?.direction || undefined,
    [column, sortParams]
  );

  const [actionsCounter, setActionsCounter] = useState(
    isFirstRender ? HEAD_CELL_MAX_ACTIONS_COUNTER : 0
  );

  useEffect(
    () => {
      setActionsCounter(actionsCounter + 1);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isProcessing]
  );

  useEffect(() => {
    if (!isActive) {
      setActionsCounter(0);
    }
  }, [isActive]);

  const { isShowTooltip, handleMouseEnter, handleMouseLeave, tooltipStyles } =
    useCellTooltip(tooltipRef);

  const SortIconButton = useMemo(
    () =>
      (!isActive && SortDisabledIcon) ||
      (isSortedColumnCell === 'desc' ? SortDescIcon : SortAscIcon),
    [isActive, isSortedColumnCell]
  );

  const isSortable = !!sortParams && !!column.label;

  let buttonAriaLabel;

  if (!isActive) {
    buttonAriaLabel = 'Sort disabled';
  } else if (isSortedColumnCell === 'desc') {
    buttonAriaLabel = 'desc';
  } else {
    buttonAriaLabel = 'asc';
  }

  return (
    <HeadCellContainer
      sortable={isSortable}
      active={isProcessing}
      $width={column.$width}
      align={column.align}
      onClick={() => {
        if (column.label) {
          onColumnClick(column);
        }
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-testid="table-head-cell"
    >
      <Tooltip
        ref={tooltipRef}
        show={isShowTooltip}
        position="abl"
        content={column.label || ''}
        styles={{
          height: px(ROW_HEIGHT),
          padding: `${px(9)} ${px(16)}`,
          transform: `translateY(${px(-13)})`,
          fontWeight: 400,
          ...tooltipStyles,
        }}
      >
        {column.label || ''}
      </Tooltip>
      {isSortable && (
        <SortColumnBtnContainer>
          <IconButton
            $size="m"
            icon={SortIconButton}
            color="disabled"
            aria-label={buttonAriaLabel}
          />
        </SortColumnBtnContainer>
      )}
      {isActive && isProcessing && <Loader />}
    </HeadCellContainer>
  );
};

export default HeadCell;
