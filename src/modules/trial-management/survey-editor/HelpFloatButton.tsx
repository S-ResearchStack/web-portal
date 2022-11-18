import React from 'react';
import styled from 'styled-components';

import { animation, colors, px } from 'src/styles';
import HelpIcon from 'src/assets/icons/help.svg';
import Tooltip from 'src/common/components/Tooltip/Tooltip';

const Container = styled.div`
  position: fixed;
  top: calc(100vh * 2 - ${px(56)} - ${px(40)});
  right: ${px(48)};
  z-index: 100;
`;

const FloatButtonTooltip = styled(Tooltip)`
  max-width: ${px(280)};
  transform: translate(${px(-15)}, 0);
`;

export const FloatButton = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${colors.textSecondaryGray};
  border-radius: 50%;
  border: none;
  width: ${px(56)};
  height: ${px(56)};
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
    fill: ${colors.textSecondaryGray};
    transition: fill 300ms ${animation.defaultTiming};
  }

  &:hover {
    background-color: ${colors.textPrimary};
    cursor: pointer;
    svg {
      fill: ${colors.textPrimary};
    }
  }
`;

const DOCUMENTATION_URL = 'https://s-healthstack.io/creating-a-survey.html';

const HelpFloatButton = () => (
  <Container>
    <FloatButtonTooltip
      arrow
      position="atr"
      content="Here you can find the documentation for survey creation!"
      trigger="hover"
    >
      <FloatButton href={DOCUMENTATION_URL} target="_blank" rel="noreferrer">
        <HelpIcon />
      </FloatButton>
    </FloatButtonTooltip>
  </Container>
);

export default HelpFloatButton;
