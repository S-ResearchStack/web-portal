import React, { ReactElement } from 'react';

import StaticTable from './StaticTable';
import VirtualTable from './VirtualTable';
import { TableProps } from './types';

const Table = <T,>({ virtual, ...props }: TableProps<T>): ReactElement => {
  const TableComponent = virtual ? VirtualTable : StaticTable;

  return <TableComponent {...props} />;
};

export default Table;
