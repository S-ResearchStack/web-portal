import styled, { css } from 'styled-components';

import { colors, typography, px, animation } from 'src/styles';
import { LINE_CLASS_NAME } from '../common-components/Line';
import { AREA_CLASS_NAME } from '../common-components/Area';
import { DOT_CLASS_NAME } from '../common-components/Dot';

interface ContainerProps {
  width: number;
  height: number;
}

export const DOTS_CONTAINER_CLASS_NAME = 'dots';
export const X_AXIS_CLASS_NAME = 'xAxis';
export const Y_AXIS_CLASS_NAME = 'yAxis';
export const ZOOM_CLASS_NAME = 'zoom';

export const Container = styled.div.attrs<ContainerProps>(({ width, height }) => ({
  style: {
    width: px(width),
    height: px(height),
    position: 'relative',
  },
}))<ContainerProps>``;

export const TooltipContent = styled.div`
  display: flex;
  align-items: center;
`;

export const TooltipNameBlock = styled.div`
  display: flex;
  margin-right: ${px(8)};

  p {
    ${typography.labelSemibold};
    color: ${colors.surface};
    margin: 0;
  }
`;

export const TooltipDataBlock = styled.div`
  display: flex;
  flex-direction: column;

  p {
    ${typography.labelRegular};
    color: ${colors.surface};
    margin: 0;
  }
`;

export const TooltipColorPoint = styled.div<{ color: string }>`
  width: ${px(12)};
  height: ${px(12)};
  background-color: ${({ color }) => color};
  border-radius: 50%;
  margin-right: ${px(8)};
`;

export const brushOverlayStyles = css`
  fill: ${colors.primary};
  fill-opacity: 0.1;
  pointer-events: none;
`;

export const brushSelectionStyles = css`
  fill: ${colors.primary};
  fill-opacity: 1;
`;

export const brushHandleCommonStyles = css`
  stroke-width: ${px(1)};
  stroke: ${colors.primary};
  stroke-opacity: 0.3;
  fill: ${colors.onPrimary};
`;

export const StyledSvg = styled.svg<{
  focusWidth: number;
  $contextVisible: boolean;
}>`
  .${X_AXIS_CLASS_NAME} {
    .tick line {
      opacity: 0;
    }

    .tick {
      :first-child text {
        text-anchor: start;
      }
      :last-child text {
        text-anchor: end;
      }
    }
  }

  .${Y_AXIS_CLASS_NAME} {
    .tick line {
      stroke: ${colors.updBackgoundLight};
    }
  }

  .context {
    opacity: ${({ $contextVisible }) => ($contextVisible ? 1 : 0)};
    transition: opacity 0.3s ${animation.defaultTiming};
    .brushX {
      .overlay {
        ${brushOverlayStyles};
        height: ${px(4)};
      }
      .selection {
        ${brushSelectionStyles};
        height: ${px(22)};
        fill: url(#horizontalGradient);
      }
      .handle {
        ${brushHandleCommonStyles};
        height: ${px(22)};
        width: ${px(6)};
      }
    }
    .brushY {
      .overlay {
        ${brushOverlayStyles};
        width: ${px(4)};
      }
      .selection {
        ${brushSelectionStyles};
        width: ${px(22)};
        fill: url(#verticalGradient);
      }
      .handle {
        ${brushHandleCommonStyles};
        height: ${px(6)};
        width: ${px(22)};
      }
    }
  }

  .focus {
    cursor: move;
  }

  .${LINE_CLASS_NAME} {
    clip-path: url(#clip);
    transition: stroke-opacity 0.3s ${animation.defaultTiming};
  }

  .${AREA_CLASS_NAME} {
    clip-path: url(#clip);
    transition: fill-opacity 0.3s ${animation.defaultTiming};
  }

  .${DOTS_CONTAINER_CLASS_NAME} {
    clip-path: url(#clip);
    .${DOT_CLASS_NAME} {
      transition: fill-opacity 0.3s ${animation.defaultTiming};
    }
  }

  .zoom {
    fill: none;
    pointer-events: all;
  }
`;
