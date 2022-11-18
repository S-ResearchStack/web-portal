import React from 'react';
import styled from 'styled-components';
import ZoomInIcon from 'src/assets/icons/zoom_in_chart.svg';
import ZoomOutIcon from 'src/assets/icons/zoom_out_chart.svg';

import { typography, colors, px } from 'src/styles';
import Tooltip from 'src/common/components/Tooltip';

const ZoomControlsContainer = styled.div`
  position: absolute;
  top: ${px(-74)};
  right: 0;
  display: inline-grid;
  grid-template-columns: ${px(24)} ${px(24)};
  grid-gap: ${px(8)};
  z-index: 100;
  height: ${px(24)};
`;

const getIconColor = (disabled: boolean, active: boolean) => {
  if (disabled) {
    return 'disabled';
  }

  if (active) {
    return 'primary';
  }

  return 'textPrimaryDark';
};

const IconWrapper = styled.div<{ disabled: boolean; active: boolean }>`
  cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};

  svg {
    fill: ${({ disabled, active }) => colors[getIconColor(disabled, active)]};

    &:active {
      fill: ${({ disabled }) => !disabled && colors.primary};
    }
  }
`;

const ZoomHint = styled.div`
  ${typography.bodyXSmallSemibold};
  color: ${colors.primaryWhite};
`;

type Props = {
  zoomInDisabled: boolean;
  zoomOutDisabled: boolean;
  zoomInActive: boolean;
  zoomOutActive: boolean;
  zoomIn: () => void;
  zoomOut: () => void;
};

const ZoomControls = ({
  zoomInDisabled,
  zoomOutDisabled,
  zoomInActive,
  zoomOutActive,
  zoomIn,
  zoomOut,
}: Props) => (
  <ZoomControlsContainer>
    <IconWrapper
      key="zoomOut"
      disabled={zoomOutDisabled}
      active={zoomOutActive}
      onClick={() => !zoomOutDisabled && zoomOut()}
    >
      <ZoomOutIcon />
    </IconWrapper>
    <Tooltip
      content={<ZoomHint>Draw a rectangle for a marquee zoom</ZoomHint>}
      position="l"
      horizontalPaddings="l"
      trigger="hover"
    >
      <IconWrapper
        key="zoomIn"
        disabled={zoomInDisabled}
        active={zoomInActive}
        onClick={() => !zoomInDisabled && zoomIn()}
      >
        <ZoomInIcon />
      </IconWrapper>
    </Tooltip>
  </ZoomControlsContainer>
);

export default ZoomControls;
