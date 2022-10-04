import React, { ComponentType, useCallback } from 'react';
import _isFunction from 'lodash/isFunction';

import styled, { DefaultTheme, StyledComponent } from 'styled-components';

import Ripple, { useRipple } from 'src/common/components/Ripple';
import { COLUMN_GAP, ROW_HEIGHT } from 'src/common/components/Table/constants';
import { animation, colors, px } from 'src/styles';
import BodyCell, { BodyCellContainer } from './BodyCell';
import { ColumnOptions, SortOptions, TableProps } from './types';
import Loader from './Loader';

export const TableRowBase = styled.div`
  position: relative;
  display: grid;
  max-height: ${px(ROW_HEIGHT)};
  min-height: ${px(ROW_HEIGHT)};
  column-gap: ${px(COLUMN_GAP)};
  box-shadow: inset 0 ${px(-1)} 0 ${colors.updPrimaryLight};
`;

export type PropsWithProcessing<T = unknown> = T & { isProcessing?: boolean };

export interface RowRendererProps<T> extends React.HTMLAttributes<HTMLElement> {
  component?:
    | ComponentType<React.HTMLAttributes<HTMLElement>>
    | StyledComponent<'div', DefaultTheme, React.HTMLAttributes<HTMLElement>>;
  columns: ColumnOptions<T>[];
  data: PropsWithProcessing<T>;
  onSelectRow?: TableProps<T>['onSelectRow'];
  disabled?: boolean;
  withRipple?: boolean;
  sort?: SortOptions<T>;
}

type TableRowProps = React.PropsWithChildren<
  PropsWithProcessing<React.HTMLAttributes<HTMLDivElement>>
>;

export const TableRow = styled(TableRowBase)<TableRowProps & { withRipple?: boolean }>`
  flex: 1;
  z-index: 0;
  overflow: ${({ withRipple }) => (withRipple ? 'hidden' : 'visible !important')};
  transition: background-color 300ms ${animation.defaultTiming};
  background-color: ${({ isProcessing, theme }) =>
    isProcessing ? `${theme.colors.updBackground} !important` : theme.colors.background};

  ${BodyCellContainer} {
    z-index: 2;
    &:last-child {
      padding-right: ${px(18)};
    }
  }

  &:hover {
    background-color: ${({ isProcessing, theme, withRipple }) =>
      withRipple && !isProcessing && theme.colors.updBackground};
  }
`;

const RowRenderer = <T extends Record<keyof T, T[keyof T]>>({
  component,
  columns,
  data,
  onSelectRow,
  onMouseDown,
  disabled,
  withRipple,
  sort,
  ...props
}: RowRendererProps<T>): JSX.Element => {
  const RowComponent = (component || TableRow) as React.ComponentType<
    TableRowProps & { withRipple?: boolean }
  >;

  const { addRippleTriggerProps, rippleProps } = useRipple<HTMLDivElement, TableRowProps>({
    color: 'updPrimaryLight',
  });

  const getKey = useCallback(
    (column: ColumnOptions<T>, columnIdx: number): string =>
      `${String(column.dataKey)}-${columnIdx}`,
    []
  );

  const handleClick = useCallback(() => {
    !disabled && onSelectRow?.(data);
  }, [disabled, onSelectRow, data]);

  return (
    <RowComponent
      {...addRippleTriggerProps(props)}
      isProcessing={data.isProcessing}
      onClick={handleClick}
      withRipple={withRipple}
    >
      {data.isProcessing && <Loader />}
      {columns.map((column, columnIdx) => (
        <BodyCell key={getKey(column, columnIdx)} column={column} sort={sort}>
          {_isFunction(column.render)
            ? column.render(data[column.dataKey], data)
            : data[column.dataKey]}
        </BodyCell>
      ))}
      {withRipple && <Ripple {...rippleProps} />}
    </RowComponent>
  );
};

export default RowRenderer;
