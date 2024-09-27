import React, { ReactElement, useMemo } from 'react';
import uniqueId from 'lodash/uniqueId';
import styled from 'styled-components';

import { px } from 'src/styles';
import { QueryResponse } from 'src/modules/api';
import Table, { ColumnOptions } from 'src/common/components/Table';
import ServiceScreen from 'src/common/components/ServiceScreen';

type TableQueryResultProps = {
  queryResponse: QueryResponse;
  isLoading: boolean;
};

const TableQueryResult = ({ queryResponse, isLoading }: TableQueryResultProps): ReactElement => {
  const tableColumns = useMemo(
    () =>
      (queryResponse.columns || []).map((column) => {
        switch (column.type) {
          case 'boolean':
            return {
              dataKey: column.name,
              label: column.name,
              render: (value: boolean) => (value ? 'True' : 'False'),
              $width: 160
            };
          default:
            return {
              dataKey: column.name,
              label: column.name,
              $width: 160
            };
        }
      }) as ColumnOptions<any>[],
    [queryResponse.data]
  );

  const computedData = useMemo(() => {
    return (queryResponse.data ?? []).map((obj) => ({
      ...obj,
      id: uniqueId(),
    }));
  }, [queryResponse]);

  return queryResponse.data ? (
    <ResultTable
      disableFooter
      columns={tableColumns}
      rows={computedData}
      getRowKey={(i) => i.id}
      isLoading={isLoading}
    />
  ) : (
    <ServiceScreen type="empty" title="No data" style={{ height: '100%' }} />
  );
};

export default TableQueryResult;

const ResultTable = styled(Table)`
  margin-top: ${px(10)};
  height: 100% !important;
` as typeof Table;
