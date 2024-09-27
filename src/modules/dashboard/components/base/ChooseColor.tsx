import React, { useMemo } from 'react';
import styled from 'styled-components';

import { px } from 'src/styles';
import { getColorType } from '../chart.utils';
import Label from './Label';
import Dropdown from 'src/common/components/Dropdown';

interface ChooseColorProps {
  value?: string;
  onChange: (value: string) => void;
}
const ChooseColor = ({ value = '', onChange }: ChooseColorProps) => {
  const items = useMemo(() => {
    const colors = getColorType();
    const noset = { key: '', label: 'default' };
    const list = colors.map(c => ({
      key: c,
      label: c,
    }));
    return [noset, ...list];
  }, [getColorType]);

  return (
    <Container>
      <Label>Color</Label>
      <Dropdown
        data-testid='choose-color-dropdown'
        items={items}
        activeKey={value}
        onChange={onChange}
      />
    </Container>
  );
};

export default ChooseColor;

const Container = styled.div`
  margin-bottom: ${px(12)};
`;
