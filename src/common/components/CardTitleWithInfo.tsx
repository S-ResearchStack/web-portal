import React from 'react';
import styled from 'styled-components';

import { typography, colors, px } from 'src/styles';
import Tooltip, { TooltipPosition } from 'src/common/components/Tooltip';
import InfoIcon from 'src/assets/icons/info.svg';

const Container = styled.div`
  ${typography.bodyMediumRegular};
  color: ${colors.textSecondaryGray};
  display: flex;
  align-items: center;

  > span {
    display: flex;
  }
`;

const InfoIconStyled = styled(InfoIcon)`
  margin-left: ${px(3)};
  cursor: pointer;

  path {
    fill: ${colors.disabled};
  }
`;

type Props = {
  title: string;
  infoContent?: JSX.Element;
  tooltipPosition?: TooltipPosition;
};

const CardTitleWithInfo: React.FC<Props> = ({ title, infoContent, tooltipPosition = 'r' }) => (
  <Container>
    {title}
    {infoContent && (
      <Tooltip content={infoContent} position={tooltipPosition} trigger="hover" arrow>
        <InfoIconStyled />
      </Tooltip>
    )}
  </Container>
);

export default CardTitleWithInfo;
