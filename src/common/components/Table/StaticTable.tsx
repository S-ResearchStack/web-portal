import React, { ReactElement } from 'react';

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
  renderOnHoverRowAction,
  disableHeader,
  disableFooter,
  ...props
}: TableProps<T>): ReactElement => (
  <BaseTable {...{ columns, getRowKey, disableActions, bodyHeight, rows, disableHeader, disableFooter, ...props }}>
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
          linesCount={row.linesCount}
          getOnHoverRowAction={renderOnHoverRowAction}
          vertical={disableHeader}
        />
      ))
    }
  </BaseTable>
);

export default StaticTable;
