import React, {
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import useEvent from 'react-use/lib/useEvent';
import { useFirstMountState } from 'react-use/lib/useFirstMountState';

import _isNumber from 'lodash/isNumber';
import _throttle from 'lodash/throttle';
import _isFunction from 'lodash/isFunction';
import _sum from 'lodash/sum';
import styled, { css } from 'styled-components';

import { animation, colors, px, theme } from 'src/styles';
import combineRefs from 'src/common/utils/combineRefs';
import Pagination from 'src/common/components/Pagination';
import useDisableElasticScroll from 'src/common/useDisableElasticScroll';
import { withCustomScrollBar } from 'src/common/components/CustomScrollbar';

import { COLUMN_GAP, MIN_COLUMN_WIDTH, ROW_HEIGHT } from './constants';
import HeadCell from './HeadCell';
import { columnSizesToFr } from './utils';
import { TableRowBase } from './RowRenderer';
import Loader from './Loader';
import { BaseTableProps, ColumnOptions, ColumnsSizes, SortParams } from './types';

export const BASE_TABLE_BODY_HEIGHT = 347;
const BASE_TABLE_CONTAINER_HEIGHT = 439;

const TableContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  height: ${px(BASE_TABLE_CONTAINER_HEIGHT)} !important;
`;

const TableScrollable = withCustomScrollBar(styled.div``)`
  position: relative;
  overflow: auto;
  flex: 1;
  width: 100%;
  height: 100%;
`;

interface TableHeadProps {
  sticky?: boolean;
}

const TableHead = styled(TableRowBase)<TableHeadProps>`
  background-color: ${colors.surface};
  ${({ sticky }) =>
    sticky &&
    css`
      position: sticky;
      top: 0;
      z-index: 3;
    `}
`;

const TableBody = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  width: 100%;
  position: relative;
  min-height: calc(100% - ${px(ROW_HEIGHT)});
`;

const TableFooter = styled.div`
  margin-top: ${px(20)};
  height: ${px(32)};
`;

const TablePagination = styled(Pagination)`
  margin-left: ${px(2)};
`;

const ColumnSelectionContainer = styled.div`
  pointer-events: none;
  position: absolute;
  top: ${px(ROW_HEIGHT)};
  width: 100%;
  display: flex;
  align-items: stretch;
`;

const ColumnSelectionRow = styled.div`
  display: grid;
  column-gap: ${px(COLUMN_GAP)};
`;

const ColumnSelectionColumn = styled.div<{ highlight: boolean }>`
  transition: background-color 0.3s ${animation.defaultTiming};
  background: ${({ highlight }) => (highlight ? theme.colors.primary05 : 'transparent')};
  height: 100%;
`;

const BaseTable = forwardRef(
  <T,>(
    {
      columns = [],
      getRowKey,
      children,
      bodyHeight,
      stickyHeader,
      stickyFooter,
      resizableColumns,
      pagination,
      sort,
      disableActions,
      isLoading,
      rows,
      renderOnHoverRowAction,
      ...props
    }: BaseTableProps<T>,
    ref: React.ForwardedRef<HTMLDivElement>
  ): JSX.Element => {
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollableRef = useRef<HTMLDivElement>(null);
    const headRef = useRef<HTMLDivElement>(null);
    const bodyRef = useRef<HTMLDivElement>(null);

    const bodyStyles = useMemo(() => {
      if (_isNumber(bodyHeight)) {
        const height = px(bodyHeight);
        return {
          minHeight: height,
          maxHeight: height,
        };
      }
      return {};
    }, [bodyHeight]);

    const [rowStyles, setRowStyles] = useState<React.CSSProperties>({});

    const setTableSizes = useCallback((sizes: ColumnsSizes) => {
      const computedSizes = columnSizesToFr(sizes).join(' ');
      const isContentOverflowing = _sum(sizes) > (scrollableRef.current?.offsetWidth ?? 0);

      const styles = {
        gridTemplateColumns: computedSizes,
        width: isContentOverflowing ? 'max-content' : '100%',
      };

      setRowStyles(styles);

      if (headRef.current) {
        Object.assign(headRef.current.style, styles);
      }

      if (bodyRef.current?.children) {
        [].forEach.call(bodyRef.current.children, (element: HTMLDivElement) => {
          Object.assign(element.style, styles);
        });
      }
    }, []);

    const prevContainerWidthRef = useRef(0);

    const calculateColumnSizes = useCallback(() => {
      if (!containerRef.current) {
        return;
      }

      const { offsetWidth } = containerRef.current;

      const scale = offsetWidth / (prevContainerWidthRef.current || offsetWidth);
      prevContainerWidthRef.current = offsetWidth;

      const computedColumns = columns ?? [];
      const sizes: ColumnsSizes = computedColumns.map((column) => {
        if (_isFunction(column.$width)) return column.$width(computedColumns.length);
        if (_isNumber(column.$width)) return column.$width;
        return -1;
      });

      const { autoSizeCount, existedSizesSum } = sizes.reduce(
        (prev, curr) => ({
          autoSizeCount: curr < 0 ? prev.autoSizeCount + 1 : prev.autoSizeCount,
          existedSizesSum:
            curr >= 0
              ? prev.existedSizesSum + Math.max(MIN_COLUMN_WIDTH, curr)
              : prev.existedSizesSum,
        }),
        {
          autoSizeCount: 0,
          existedSizesSum: 0,
        }
      );

      const autoSize = ((offsetWidth - existedSizesSum) / autoSizeCount) * scale;
      const fullSizes: ColumnsSizes = sizes.map((size) => (size < 0 ? autoSize : size));

      setTableSizes(fullSizes);
    }, [columns, setTableSizes]);

    const calculateColumnSizesThrottled = useMemo(
      () => _throttle(calculateColumnSizes, 50),
      [calculateColumnSizes]
    );

    useEffect(() => {
      if (!containerRef.current) {
        return () => {};
      }

      const resizeObserver = new ResizeObserver(
        (entries) => entries[0]?.contentBoxSize && calculateColumnSizes()
      );

      resizeObserver.observe(containerRef.current);

      return () => {
        resizeObserver.disconnect();
      };
    }, [calculateColumnSizes]);

    useLayoutEffect(() => {
      calculateColumnSizes();
      return () => calculateColumnSizesThrottled.cancel();
    }, [columns, calculateColumnSizesThrottled, calculateColumnSizes]); // 'column' needed as trigger

    useEvent('resize', calculateColumnSizesThrottled);

    const isFirstRender = useFirstMountState();

    const handleColumnClick = useCallback(
      (column: ColumnOptions<T>) => {
        if (!disableActions && sort?.onSortChange) {
          let sortingOptions = [...sort.sortings];
          const sortingIdx = sortingOptions.findIndex((s) => s?.column === column.dataKey);
          const sorting = sortingOptions[sortingIdx];
          const newSortOption: SortParams<T> = {
            column: column.dataKey,
            direction: sorting?.direction === 'asc' ? 'desc' : 'asc',
          };

          if (sortingIdx > -1) {
            if (sort.multiSort) {
              if (sorting.direction === 'desc') {
                // reset sorting for this column
                sortingOptions.splice(sortingIdx, 1);
              } else {
                sortingOptions.splice(sortingIdx, 1, newSortOption);
              }
            } else {
              sortingOptions = [newSortOption];
            }
          } else if (sort.multiSort) {
            sortingOptions.push(newSortOption);
          } else {
            sortingOptions = [newSortOption];
          }

          sort.onSortChange(sortingOptions);
        }
      },
      [disableActions, sort]
    );

    useDisableElasticScroll(scrollableRef);

    const computedColumns = columns ?? [];

    return (
      <TableContainer data-testid="table" ref={containerRef} {...props}>
        <TableScrollable
          ref={combineRefs([scrollableRef, ref])}
          scrollbarTrackColor={theme.colors.surface}
        >
          <TableHead ref={headRef} sticky={stickyHeader}>
            {computedColumns.map((column) => {
              const sorting = sort?.sortings?.find((s) => s?.column === column.dataKey);
              const isActive = !!sorting;
              return column.isEmpty ? null : (
                <HeadCell<T>
                  key={String(column.dataKey)}
                  isActive={!!(sort && isActive)}
                  isFirstRender={isFirstRender}
                  column={column}
                  isProcessing={!!(sorting && sort?.isProcessing)}
                  onColumnClick={handleColumnClick}
                  sortParams={sort}
                />
              );
            })}
            {isLoading && <Loader />}
          </TableHead>
          <ColumnSelectionContainer style={{ height: px((rows ?? []).length * ROW_HEIGHT) }}>
            <ColumnSelectionRow style={rowStyles}>
              {computedColumns.map((c) => (
                <ColumnSelectionColumn
                  key={String(c.dataKey)}
                  highlight={
                    !!(sort?.sortings.find((s) => s?.column === c.dataKey) && sort?.isProcessing)
                  }
                />
              ))}
            </ColumnSelectionRow>
          </ColumnSelectionContainer>
          <TableBody
            ref={bodyRef}
            style={{ ...bodyStyles, pointerEvents: sort?.isProcessing ? 'none' : 'auto' }}
          >
            {children && children({ sort, styles: rowStyles })}
          </TableBody>
        </TableScrollable>
        <TableFooter>
          {pagination && <TablePagination {...pagination} disabled={disableActions} />}
        </TableFooter>
      </TableContainer>
    );
  }
) as <T>(
  props: BaseTableProps<T> & { ref?: React.ForwardedRef<HTMLDivElement | undefined> }
) => JSX.Element;

export default BaseTable;
