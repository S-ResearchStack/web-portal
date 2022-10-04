import React from 'react';
import styled from 'styled-components';

import { animation, colors, px } from 'src/styles';
import HelpIcon from 'src/assets/icons/help.svg';
import Tooltip from 'src/common/components/Tooltip/Tooltip';

const Container = styled.div`
  position: absolute;
  right: ${px(48)};
  bottom: 0;
`;

export const FloatButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${colors.updTextSecondaryGray};
  border-radius: 50%;
  border: none;
  width: ${px(56)};
  height: ${px(56)};
  z-index: 10;
  padding: 0;
  overflow: hidden;
  box-shadow: 0 0 ${px(2)} rgba(0, 0, 0, 0.15);
  transition: background-color 300ms ${animation.defaultTiming};

  &:before {
    content: '';
    width: ${px(32)};
    height: ${px(32)};
    border-radius: 50%;
    background-color: ${colors.surface};
    position: absolute;
    top: ${px(12)};
    left: ${px(12)};
  }

  svg {
    position: relative;
    z-index: 1;
    fill: ${colors.updTextSecondaryGray};
    transition: fill 300ms ${animation.defaultTiming};
  }

  &:hover {
    background-color: ${colors.updTextPrimary};
    svg {
      fill: ${colors.updTextPrimary};
    }
  }
`;

const HelpFloatButton = () => (
  <Container>
    <Tooltip
      arrow
      position="atr"
      content="Here you can find the documentation for survey creation!"
      trigger="hover"
      styles={{
        maxWidth: px(280),
        transform: `translate(${px(-15)}, 0)`,
      }}
    >
      <FloatButton>
        <HelpIcon />
      </FloatButton>
    </Tooltip>
  </Container>
);

export default HelpFloatButton;
