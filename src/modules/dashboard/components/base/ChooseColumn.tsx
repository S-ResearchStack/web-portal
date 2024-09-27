import React, { useMemo } from 'react';
import styled from 'styled-components';

import { px } from 'src/styles';
import Label, { LabelProps } from './Label';
import Dropdown from 'src/common/components/Dropdown';
import type { QueryResponseColumn, QueryResponseColumnType } from 'src/modules/api';

interface ChooseColumnProps extends LabelProps {
  label: string;
  value?: string;
  placeholder?: string;
  columns?: QueryResponseColumn[];
  filterTypes?: QueryResponseColumnType[];
  onChange: (value: string) => void;
}
const ChooseColumn = ({ label, value, placeholder, columns = [], filterTypes = [], onChange, ...props }: ChooseColumnProps) => {
  const items = useMemo(() => {
    if (!filterTypes.length) {
      return columns.map(c => ({ key: c.name, label: c.name }));
    };

    return columns.filter(c => filterTypes.includes(c.type)).map(c => ({ key: c.name, label: c.name }))
  }, [columns]);

  return (
    <Container>
      <Label {...props}>{label}</Label>
      <Dropdown
        items={items}
        activeKey={value}
        placeholder={placeholder}
        onChange={onChange}
      />
    </Container>
  );
};

export default ChooseColumn;

const Container = styled.div`
  margin-bottom: ${px(12)};
`;
