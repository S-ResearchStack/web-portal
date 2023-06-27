import React from 'react';
import styled from 'styled-components';
import Tooltip from 'src/common/components/Tooltip';
import { Label } from 'src/common/components/Dropdown';
import InfoIcon from 'src/assets/icons/info.svg';
import { colors, px, typography } from 'src/styles';
import { SkipLogicDropdown } from './common';
import { SkipLogicConditionClause } from './types';

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: ${px(8)};
`;

const InfoIconStyled = styled(InfoIcon)`
  display: block;
`;

const Dropdown = styled(SkipLogicDropdown)`
  width: ${px(92)};
` as typeof SkipLogicDropdown;

const DropdownLabel = styled(Label)`
  ${typography.bodySmallSemibold};
  color: ${colors.textPrimaryBlue};
`;

const SkipLogicConditionClauseEditor = ({
  clause,
  onChange,
}: {
  clause: SkipLogicConditionClause;
  onChange: (c: SkipLogicConditionClause) => void;
}) => (
  <Container>
    <Dropdown
      labelComponent={DropdownLabel}
      items={[
        { key: 'and', label: 'And' },
        { key: 'or', label: 'Or' },
      ]}
      activeKey={clause}
      onChange={onChange}
    />
    <Tooltip
      content="“And” has higher logical precedence than “Or”."
      position="r"
      trigger="hover"
      arrow
    >
      <InfoIconStyled />
    </Tooltip>
  </Container>
);

export default SkipLogicConditionClauseEditor;
