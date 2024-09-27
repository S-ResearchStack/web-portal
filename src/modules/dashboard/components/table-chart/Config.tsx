import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import ChooseColumn from '../base/ChooseColumn';
import { TableChartConfig, QueryResponseColumn } from 'src/modules/api';
import { px } from 'src/styles';
import Button from 'src/common/components/Button';
import Checkbox from 'src/common/components/CheckBox';
import Label from '../base/Label';

const Config = ({
  columns = [],
  config,
  onChange,
}: {
  columns?: QueryResponseColumn[];
  config?: TableChartConfig;
  onChange: (config: Partial<TableChartConfig>) => void;
}) => {
  const onChangeColumn = (name: string) => {
    let newSelectedColumns;
    if ((config?.columns || []).some((c) => c.name === name)) {
      newSelectedColumns = config?.columns.filter((c) => c.name !== name);
    } else {
      newSelectedColumns = [...(config?.columns || []), { name, alias: name }];
    }
    onChange({ columns: newSelectedColumns });
  };

  return (
    <Container>
      <Label>Choose columns</Label>
      {columns.map((column) => (
        <div key={column.name}>
          <Checkbox
            checked={(config?.columns || []).some((c) => c.name === column.name)}
            onChange={() => onChangeColumn(column.name)}
          >
            {column.name}
          </Checkbox>
        </div>
      ))}
    </Container>
  );
};

export default Config;

const Container = styled.div``;

const AddColumnButton = styled(Button)`
  width: 100%;
  justify-content: left;
  padding-left: ${px(8)};
`;
