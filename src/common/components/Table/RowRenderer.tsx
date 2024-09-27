import React, { ComponentType, ReactElement, useCallback } from 'react';
import _isFunction from 'lodash/isFunction';

import styled, { DefaultTheme, StyledComponent } from 'styled-components';

import Ripple, { useRipple } from 'src/common/components/Ripple';
import {
  CELL_LINE_HEIGHT,
  CELL_VERTICAL_PADDING,
  COLUMN_GAP,
} from 'src/common/components/Table/constants';
import { animation, colors, px } from 'src/styles';
import BodyCell, { BodyCellContainer } from './BodyCell';
import { ColumnOptions, SortOptions, TableProps } from './types';
import Loader from './Loader';

export const TableRowBase = styled.div<{ linesCount?: number }>`
  position: relative;
  display: grid;
  max-height: ${({ linesCount }) =>
    px(CELL_VERTICAL_PADDING + CELL_LINE_HEIGHT * (linesCount || 1))};
  min-height: ${({ linesCount }) =>
    px(CELL_VERTICAL_PADDING + CELL_LINE_HEIGHT * (linesCount || 1))};
  column-gap: ${px(COLUMN_GAP)};
  box-shadow: inset 0 ${px(-1)} 0 ${colors.primaryLight};
`;

export type PropsWithProcessing<T = unknown> = T & { isProcessing?: boolean; linesCount?: number; key?: string; value?:string}

interface RowRendererProps<T> extends React.HTMLAttributes<HTMLElement> {
  component?:
    | ComponentType<React.HTMLAttributes<HTMLElement>>
    | StyledComponent<'div', DefaultTheme, React.HTMLAttributes<HTMLElement>>;
  columns: ColumnOptions<T>[];
  data: PropsWithProcessing<T>;
  onSelectRow?: TableProps<T>['onSelectRow'];
  disabled?: boolean;
  withRipple?: boolean;
  sort?: SortOptions<T>;
  linesCount?: number;
  getOnHoverRowAction?: (r: T) => React.ReactNode;
  vertical?: boolean;
}

type TableRowProps = React.PropsWithChildren<
  PropsWithProcessing<React.HTMLAttributes<HTMLDivElement>>
>;

const TableRowHoverActionContainer = styled.div`
  height: ${px(24)};
  width: ${px(24)};
  position: absolute;
  right: 0;
  background-color: ${colors.background} !important;
  opacity: 0;
  z-index: 2;
  top: ${px(5)};
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const TableRow = styled(TableRowBase)<
  TableRowProps & { selectable: boolean; withRipple?: boolean; linesCount?: number }
>`
  flex: 1;
  overflow: ${({ withRipple }) => (withRipple ? 'hidden' : 'visible !important')};
  transition: background-color 300ms ${animation.defaultTiming};
  background-color: ${({ isProcessing, theme }) =>
    isProcessing ? `${theme.colors.background} !important` : 'transparent'};

  ${BodyCellContainer} {
    z-index: 2;
    &:last-child {
      padding-right: ${px(18)};
    }
  }

  &:hover {
    background-color: ${({ isProcessing, theme, withRipple }) =>
      withRipple && !isProcessing && theme.colors.background};
    cursor: ${({ selectable }) => selectable && 'pointer'};

    ${TableRowHoverActionContainer} {
      transition: opacity 300ms ${animation.defaultTiming};
      opacity: 1;
    }
  }
`;
const VerticalTableHeader = styled.div`
  display: flex;
  align-items: center;
  font-size: 13px;
  width: max-content;
  height: 30px;
  font-weight: 600;
`
const RowRenderer = <T extends Record<keyof T, T[keyof T]>>({
  component,
  columns,
  data,
  onSelectRow,
  onMouseDown,
  disabled,
  withRipple,
  sort,
  linesCount,
  getOnHoverRowAction,
  vertical,
  ...props
}: RowRendererProps<T>): ReactElement => {
  const RowComponent = (component || TableRow) as React.ComponentType<
    TableRowProps & { selectable: boolean; withRipple?: boolean }
  >;

  const { addRippleTriggerProps, rippleProps } = useRipple<HTMLDivElement, TableRowProps>({
    color: 'primaryLight',
  });

  const getKey = useCallback(
    (column: ColumnOptions<T>, columnIdx: number): string =>
      `${String(column.dataKey)}-${columnIdx}`,
    []
  );

  const handleClick = useCallback(() => {
    !disabled && onSelectRow?.(data);
  }, [disabled, onSelectRow, data]);

  const { isProcessing, ...rawData } = data;

  return (
    <RowComponent
      {...addRippleTriggerProps(props)}
      isProcessing={isProcessing}
      onClick={handleClick}
      withRipple={withRipple}
      selectable={!!onSelectRow}
      data-testid="table-row"
      linesCount={linesCount}
    >
      {isProcessing && <Loader />}
      {
        vertical
        ? (
          <>
            <VerticalTableHeader>
              <>{data?.key}</>
            </VerticalTableHeader>
            <BodyCell column={{dataKey: data.key || ""}} linesCount={data?.linesCount || 1}>
              {data?.value}
            </BodyCell>
          </>
        )
        : columns.map((column, columnIdx) => (
          <BodyCell key={getKey(column, columnIdx)} column={column} linesCount={linesCount} >
            {_isFunction(column.render)
              ? column.render(data[column.dataKey], data)
              : data[column.dataKey]}
          </BodyCell>
        ))
      }
      {withRipple && <Ripple {...rippleProps} />}
      {getOnHoverRowAction && (
        <TableRowHoverActionContainer>
          {getOnHoverRowAction(rawData as T)}
        </TableRowHoverActionContainer>
      )}
    </RowComponent>
  );
};

export default RowRenderer;
