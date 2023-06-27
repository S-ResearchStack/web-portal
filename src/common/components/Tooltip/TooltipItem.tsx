import React, { FC, useCallback, useLayoutEffect, useState } from 'react';
import styled from 'styled-components';
import _omit from 'lodash/omit';
import { useFloating, useDismiss, useInteractions } from '@floating-ui/react-dom-interactions';
import { autoUpdate } from '@floating-ui/react-dom';

import { colors, px, typography } from 'src/styles';
import { TooltipHorizontalPaddings, TooltipPosition, TooltipProps } from './types';

const ARROW_H = 6;
const ARROW_W = ARROW_H * 2;
const GRID_SIZE = 8;

const DEFAULT_POSITION: TooltipPosition = 't';

type RectProperties = 'left' | 'top' | 'width' | 'height';

const getTooltipArrowPositionStyles = (
  position?: TooltipPosition,
  gs = GRID_SIZE
): React.CSSProperties => {
  switch (position || DEFAULT_POSITION) {
    case 'atr':
    case 'tl':
      return {
        left: `calc(100% - ${px(ARROW_W + gs)})`,
        top: '100%',
      };

    case 't':
      return {
        left: `calc(50% - ${px(ARROW_H)})`,
        top: '100%',
      };

    case 'atl':
    case 'tr':
      return {
        left: px(8),
        top: '100%',
      };

    case 'abr':
    case 'bl':
      return {
        left: `calc(100% - ${px(ARROW_W + gs)})`,
        top: px(-ARROW_H),
        transform: `rotate(180deg)`,
      };

    case 'b':
      return {
        left: `calc(50% - ${px(ARROW_H)})`,
        top: px(-ARROW_H),
        transform: `rotate(180deg)`,
      };

    case 'abl':
    case 'br':
      return {
        left: px(gs),
        top: px(-ARROW_H),
        transform: `rotate(180deg)`,
      };

    case 'rt':
      return {
        left: px(-ARROW_H * 1.5),
        top: `calc(100% - ${px(ARROW_H + gs)})`,
        transform: `rotate(90deg)`,
      };

    case 'r':
      return {
        left: px(-ARROW_H * 1.5),
        top: `calc(50% - ${px(ARROW_H / 2)})`,
        transform: `rotate(90deg)`,
      };

    case 'rb':
      return {
        left: px(-ARROW_H * 1.5),
        top: px(gs),
        transform: `rotate(90deg)`,
      };

    case 'lt':
      return {
        left: `calc(100% - ${px(ARROW_H / 2)})`,
        top: `calc(100% - ${px(ARROW_H + gs)})`,
        transform: `rotate(-90deg)`,
      };

    case 'l':
      return {
        left: `calc(100% - ${px(ARROW_H / 2)})`,
        top: `calc(50% - ${px(ARROW_H * 0.5)})`,
        transform: `rotate(-90deg)`,
      };

    case 'lb':
      return {
        left: `calc(100% - ${px(ARROW_H / 2)})`,
        top: px(gs),
        transform: `rotate(-90deg)`,
      };

    default:
      return {};
  }
};

interface TooltipArrowProps {
  $position?: TooltipPosition;
  $gs?: number;
}

const TooltipArrow = styled.div.attrs<TooltipArrowProps>(({ $position, $gs }) => ({
  style: getTooltipArrowPositionStyles($position, $gs),
  'data-testid': 'tooltip-arrow',
}))<TooltipArrowProps>`
  position: absolute;
  width: 0;
  height: 0;
  border-left: ${px(ARROW_H)} solid transparent;
  border-right: ${px(ARROW_H)} solid transparent;
  border-top: ${px(ARROW_H)} solid ${colors.onSurface};
`;

const getPadding = (padding?: TooltipHorizontalPaddings) => {
  switch (padding) {
    case 'm':
      return 12;
    case 'l':
      return 16;
    default:
      return 8;
  }
};

const TooltipContainer = styled.div<{ $show?: boolean; $padding?: TooltipHorizontalPaddings }>`
  ${typography.bodyXSmallSemibold};
  pointer-events: none;
  visibility: ${({ $show }) => ($show ? 'visible' : 'hidden')};
  padding: ${px(8)} ${({ $padding }) => px(getPadding($padding))};
  background-color: ${colors.onSurface};
  color: ${colors.surface} !important;
  border-radius: ${px(4)};
  z-index: 1002;
  width: max-content;
  word-wrap: break-word;

  * {
    color: ${colors.surface} !important;
  }
`;

const TooltipItem: FC<TooltipProps & React.HTMLAttributes<HTMLDivElement>> = ({
  id,
  show,
  content,
  container,
  point,
  position,
  arrow,
  trigger,
  styles,
  horizontalPaddings,
  centered,
  ...props
}) => {
  const [isMounted, setMounted] = useState<boolean>(false);

  const coords = [0, 0];

  const floating = useFloating<HTMLElement>({
    placement: 'top-start',
    open: show,
    strategy: props.static ? 'absolute' : 'fixed',
    whileElementsMounted:
      show && !props.static
        ? (reference, fltng, update) =>
            autoUpdate(reference, fltng, update, {
              animationFrame: true,
            })
        : undefined,
  });

  const interactions = useInteractions([useDismiss(floating.context)]);

  let isReadyToRender = false;
  if (isMounted && floating.refs.floating.current && (point || container)) {
    isReadyToRender = true;
    const ah = ARROW_H;
    const gs = centered ? 0 : GRID_SIZE;

    let pointsRect: Pick<DOMRect, RectProperties>;
    const floatingRect = floating.refs.floating.current.getBoundingClientRect();

    // There are some edge cases when element position cannot be calculated yet.
    // To avoid rendering tooltip at incorrect position, we will hide tooltip.
    // However element still should be rendered so that its layout can be calculated.
    if (
      floatingRect.width === 0 &&
      floatingRect.height === 0 &&
      floatingRect.x === 0 &&
      floatingRect.y === 0 &&
      floatingRect.bottom === 0 &&
      floatingRect.top === 0 &&
      floatingRect.left === 0 &&
      floatingRect.right === 0
    ) {
      isReadyToRender = false;
    }
    if (floating.x === null || floating.y === null) {
      isReadyToRender = false;
    }

    const { width: tW, height: tH } = floatingRect;

    if (point) {
      pointsRect = { left: point[0], top: point[1], width: 0, height: 0 };
    } else if (container) {
      const contRect = container.getBoundingClientRect();
      pointsRect = {
        width: contRect.width,
        height: contRect.height,
        left: floating.x ? floating.x : 0,
        top: floating.y ? floating.y + tH : 0,
      };
    } else {
      pointsRect = { left: 0, top: 0, width: 0, height: 0 };
    }

    const { left: cX, top: cY, width: cW, height: cH } = pointsRect;

    switch (position || DEFAULT_POSITION) {
      case 'tl':
        coords[0] = cX + cW / 2 - tW + ah + gs;
        coords[1] = cY - tH - ah - gs;
        break;

      case 't':
        coords[0] = cX + (cW - tW) / 2;
        coords[1] = cY - tH - ah - gs;
        break;

      case 'tr':
        coords[0] = cX + cW / 2 - ah - gs;
        coords[1] = cY - tH - ah - gs;
        break;

      case 'bl':
        coords[0] = cX + cW / 2 - tW + ah + gs;
        coords[1] = cY + cH + ah + gs;
        break;

      case 'b':
        coords[0] = cX + (cW - tW) / 2;
        coords[1] = cY + cH + ah + gs;
        break;

      case 'br':
        coords[0] = cX + cW / 2 - ah - gs;
        coords[1] = cY + cH + ah + gs;
        break;

      case 'rt':
        coords[0] = cX + cW + ah + gs;
        coords[1] = cY + cH - tH;
        break;

      case 'r':
        coords[0] = cX + cW + ah + gs;
        coords[1] = cY + (cH - tH) / 2;
        break;

      case 'rb':
        coords[0] = cX + cW + ah + gs;
        coords[1] = cY;
        break;

      case 'lt':
        coords[0] = cX - tW - gs - ah;
        coords[1] = cY + cH - tH;
        break;

      case 'l':
        coords[0] = cX - tW - gs - ah;
        coords[1] = cY + (cH - tH) / 2;
        break;

      case 'lb':
        coords[0] = cX - tW - gs - ah;
        coords[1] = cY;
        break;

      case 'abl':
        coords[0] = cX;
        coords[1] = cY + cH + ah + gs;
        break;

      case 'abr':
        coords[0] = cX + cW - tW;
        coords[1] = cY + cH + ah + gs;
        break;

      case 'atl':
        coords[0] = cX;
        coords[1] = cY - tH - ah - gs;
        break;

      case 'atr':
        coords[0] = cX + cW - tW;
        coords[1] = cY - tH - ah - gs;
        break;

      default:
        break;
    }
  }

  const setRefAndSetMounted = useCallback(
    (ref: HTMLDivElement | null) => {
      setMounted(true);
      floating.floating(ref);
    },
    [floating]
  );

  useLayoutEffect(() => {
    floating.reference(container || null);
  }, [container, floating]);

  // Due to some reason (probably context + floating library + portals + something else),
  // this component can get extra render when parent is already unmounted and container is not in the DOM,
  // causing a tooltip to blink at incorrect position
  if (container && !container.isConnected) {
    isReadyToRender = false;
  }

  return (
    <TooltipContainer
      data-testid="tooltip-item"
      {..._omit(props, ['onShow', 'onHide'])}
      id={id}
      $show={isReadyToRender && show}
      $padding={horizontalPaddings}
      {...interactions.getFloatingProps({
        ref: setRefAndSetMounted,
        style: {
          ...(styles || {}),
          position: floating.strategy,
          left: px(coords[0]),
          top: px(coords[1]),
        },
      })}
    >
      {arrow && <TooltipArrow $position={position} $gs={centered ? 0 : GRID_SIZE} />}
      {content}
    </TooltipContainer>
  );
};

export default TooltipItem;
