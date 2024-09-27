import React, { useMemo } from 'react';
import uniqueId from 'lodash/uniqueId';
import styled from 'styled-components';
import Table, { ColumnOptions } from 'src/common/components/Table';
import { TableChartConfig } from 'src/modules/api';

type DataObject = Record<string, string | number | boolean | null | undefined>;

export type Props = {
  rows: DataObject[];
  columns: TableChartConfig;
};


const Chart = ({ rows, columns }: Props) => {

  const tableColumns = useMemo(
    () => (columns.columns || []).map((column) => {
      return {
        dataKey: column.name,
        label: column.name,
        $width: 160
      }
    }) as ColumnOptions<any>[],
    [columns]
  );

  const computedData = useMemo(() => {
    return rows.map((obj) => ({
      ...obj,
      id: uniqueId(),
    }));
  }, [rows])

  return (
    <Container>
      <TableChart disableFooter columns={tableColumns} rows={computedData} getRowKey={(i) => i.id}/>
    </Container>
  );
};

const Container = styled.div``;

export default Chart;

const TableChart = styled(Table)`
  max-height: 332px;
` as typeof Table;
