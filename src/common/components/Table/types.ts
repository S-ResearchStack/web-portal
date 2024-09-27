import React, { ReactElement } from 'react';
import { PropsWithProcessing } from 'src/common/components/Table/RowRenderer';
import { PaginationProps } from 'src/common/components/Pagination';

export type ColumnsSizes = number[];
export type ColumnLabel = string | number;
export type SortDirectionOptions = 'asc' | 'desc';
export type AlignOptions = 'left' | 'center' | 'right';
export type TextEllipsis = boolean;
export type ColumnWidthInPercentsCallback = (columnsCount: number) => number;

export type SortParams<T> = {
  direction: SortDirectionOptions;
  column: keyof T;
};

export type SortCallback<T> = (sortings: SortParams<T>[]) => void;

export interface SortOptions<T> {
  sortings: SortParams<T>[];
  isProcessing?: boolean;
  onSortChange: SortCallback<T>;
  multiSort?: boolean;
}

export interface ColumnOptions<T> {
  dataKey: keyof T;
  label?: ColumnLabel;
  $width?: number | ColumnWidthInPercentsCallback;
  align?: AlignOptions;
  ellipsis?: TextEllipsis;
  isEmpty?: boolean;
  disableSort?: boolean;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
}

export type RowKeyExtractor<T> = (row: T) => React.Key;

export interface BaseTableProps<T> {
  columns: ColumnOptions<T>[];
  virtual?: boolean;
  stickyHeader?: boolean;
  stickyFooter?: boolean;
  resizableColumns?: boolean;
  pagination?: PaginationProps;
  sort?: SortOptions<T>;
  onSelectRow?: (row: T) => void;
  getRowKey: RowKeyExtractor<T>;
  children?: (props: {
    sort?: SortOptions<T>;
    styles: React.CSSProperties;
  }) => ReactElement | ReactElement[];
  bodyHeight?: number;
  disableActions?: boolean;
  isLoading?: boolean;
  rows: PropsWithProcessing<T>[];
  renderOnHoverRowAction?: (r: T) => React.ReactNode;
  disableHeader?: boolean;
  disableFooter?: boolean;
}

export interface TableProps<T> extends Omit<BaseTableProps<T>, 'children'> {
  withRipple?: boolean;
}
