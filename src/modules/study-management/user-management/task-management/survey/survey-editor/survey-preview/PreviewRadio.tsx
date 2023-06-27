import React from 'react';

import styled from 'styled-components';

import Radio, { RadioProps } from 'src/common/components/Radio';
import { px } from 'src/styles';

const StyledRadio = styled(Radio)`
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

const PreviewRadio = (props: RadioProps) => <StyledRadio {...props} kind="mobile" />;

export default PreviewRadio;
