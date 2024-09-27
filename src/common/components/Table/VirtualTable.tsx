import React, { ReactElement, useCallback, useRef } from 'react';
import { useVirtual } from 'react-virtual';
import styled from 'styled-components';

import { px } from 'src/styles';

import { ROW_HEIGHT, ROWS_OVERSCAN } from './constants';
import BaseTable from './BaseTable';
import RowRenderer, { TableRow } from './RowRenderer';
import { TableProps } from './types';

const TableVirtualRow = styled(TableRow)`
  position: absolute !important;
  left: 0;
  right: 0;
  width: 100%;
`;

const VirtualTable = <T,>({
  columns,
  rows,
  getRowKey,
  onSelectRow,
  disableActions,
  renderOnHoverRowAction,
  ...props
}: TableProps<T>): ReactElement => {
  const parentRef = useRef<HTMLDivElement | undefined>();

  const estimateSize = useCallback(() => ROW_HEIGHT, []);

  const keyExtractor = useCallback((idx: number) => getRowKey(rows[idx]), [getRowKey, rows]);

  const { totalSize, virtualItems } = useVirtual({
    size: rows.length,
    overscan: ROWS_OVERSCAN,
    parentRef,
    estimateSize,
    keyExtractor,
  });

  return (
    <BaseTable
      {...{ columns, getRowKey, disableActions, ...props }}
      ref={parentRef}
      bodyHeight={totalSize}
      rows={rows}
    >
      {({ sort, styles }) =>
        virtualItems.map(({ key, start, size, index: rowIdx }) => (
          <RowRenderer
            sort={sort}
            component={TableVirtualRow}
            key={key}
            columns={columns}
            data={rows[rowIdx]}
            disabled={disableActions}
            onSelectRow={onSelectRow}
            getOnHoverRowAction={renderOnHoverRowAction}
            style={{
              ...styles,
              height: px(size),
              transform: `translateY(${px(start)})`,
            }}
          />
        ))
      }
    </BaseTable>
  );
};

export default VirtualTable;
