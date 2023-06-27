import React from 'react';

import styled from 'styled-components';

import CheckBox, { CheckboxProps } from 'src/common/components/CheckBox';
import { px } from 'src/styles';

const StyledCheckbox = styled(CheckBox)`
  label {
    gap: ${px(12)};
    grid-template-columns: ${px(24)} 1fr;
    grid-template-rows: ${px(56)};

    div {
      &:first-child {
        width: ${px(24)};
        height: ${px(56)};
      }
      &:last-child {
        margin-top: 0;
        height: ${px(56)};
        display: flex;
        align-items: center;
      }
    }
  }
`;

const PreviewCheckbox = (props: CheckboxProps) => <StyledCheckbox {...props} isMobile />;

export default PreviewCheckbox;
