import React from 'react';
import styled from 'styled-components';

import { px, colors, typography } from 'src/styles';
import DropdownArrowSmallIcon from 'src/assets/icons/dropdown_arrow_small.svg';
import CheckmarkSmallIcon from 'src/assets/icons/checkmark_small.svg';
import Dropdown, { DropdownProps, MenuItem } from './Dropdown';

const StyledDropdown = styled.div`
  width: ${px(120)};
  height: ${px(24)};

  div > div {
    ${typography.labelSemibold};
    white-space: nowrap;
    color: ${colors.primary};
    padding: 0 ${px(8)};
    display: flex;
    justify-content: space-between;
    div {
      padding: 0;
    }
  }
`;

const MenuItemComponent = styled(MenuItem)`
  background-color: ${({ selected }) =>
    selected ? colors.primaryLight : colors.backgroundSurface};
  width: ${px(118)};
  padding: 0 ${px(8)};
  display: flex;
  justify-content: space-between;

  div {
    ${typography.labelSemibold};
    white-space: nowrap;
    color: ${colors.primary};
  }
`;

const PeriodDropdown = <T extends string | number>(props: DropdownProps<T>): JSX.Element => (
  <StyledDropdown>
    <Dropdown
      {...props}
      menuItemHeight={24}
      maxVisibleMenuItems={4}
      menuItemComponent={MenuItemComponent}
      arrowIcon={<DropdownArrowSmallIcon />}
      checkIcon={<CheckmarkSmallIcon />}
    />
  </StyledDropdown>
);

export default PeriodDropdown;
