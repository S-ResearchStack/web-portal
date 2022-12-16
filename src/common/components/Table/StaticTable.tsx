import React from 'react';

import BaseTable from './BaseTable';
import RowRenderer from './RowRenderer';
import { TableProps } from './types';

const StaticTable = <T,>({
  columns,
  rows,
  getRowKey,
  onSelectRow,
  disableActions,
  bodyHeight,
  withRipple = true,
  ...props
}: TableProps<T>): JSX.Element => (
  <BaseTable {...{ columns, getRowKey, disableActions, bodyHeight, rows, ...props }}>
    {({ sort, styles }) =>
      (rows ?? []).map((row) => (
        <RowRenderer
          sort={sort}
          key={getRowKey(row)}
          columns={columns}
          data={row}
          onSelectRow={onSelectRow}
          disabled={disableActions}
          withRipple={withRipple}
          style={styles}
        />
      ))
    }
  </BaseTable>
);

export default StaticTable;
