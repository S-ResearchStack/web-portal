import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled, { css, keyframes } from 'styled-components';
import _uniqueId from 'lodash/uniqueId';
import _isEqual from 'lodash/isEqual';

import { px } from 'src/styles';
import { SpecColorType } from 'src/styles/theme';
import combineRefs from 'src/common/utils/combineRefs';

export const DEFAULT_RIPPLE_ANIMATION_DURATION = 600;

export interface RipplePos {
  left: number;
  top: number;
}

export interface RippleProps extends React.HTMLAttributes<HTMLDivElement> {
  ref: React.RefObject<HTMLDivElement>;
  key: React.Key;
  isRippling: boolean;
  size: number;
  position: RipplePos;
  color?: SpecColorType;
  opacity: [number, number];
  duration?: number;
  scale: number;
  isEntered: boolean;
  isExited: boolean;
}

export interface UseRippleArgs {
  duration?: number;
  opacity?: number | [number, number];
  color?: SpecColorType;
}

export interface RippleTriggerProps<T> extends React.PropsWithChildren<object> {
  ref: React.RefObject<T> | ((commonRef: T | null) => void);
  style: Pick<React.CSSProperties, 'position' | 'overflow'>;
  onMouseDown: (evt: React.MouseEvent<T>) => void;
  onMouseUp: (evt: React.MouseEvent<T>) => void;
  onMouseLeave: (evt: React.MouseEvent<T>) => void;
}

type HandleRippleInOpts = { force?: boolean };
type HandleRippleOutOpts = { force?: boolean };

export interface UseRippleReturn<
  T,
  P extends Partial<RippleTriggerProps<T>> | undefined = undefined
> {
  rippleTriggerProps: RippleTriggerProps<T>;
  addRippleTriggerProps: (props?: P) => P;
  rippleProps: RippleProps;
  handleRippleIn: (evt?: React.MouseEvent<T>, opts?: HandleRippleInOpts) => void;
  handleRippleOut: (evt?: React.MouseEvent<T>, opts?: HandleRippleOutOpts) => void;
}

const rippleOpacity = (opacity?: [number, number]): [number, number] =>
  typeof opacity !== 'undefined' ? opacity : [1, 1];

const rippleInAnimation = (opacity: [number, number], scale: number) => keyframes`
  0% {
    transform: scale(0);
    opacity: ${rippleOpacity(opacity)[0]};
  }
  100% {
    transform: scale(${scale});
    opacity: ${rippleOpacity(opacity)[1]};
  }
`;

const rippleOutAnimation = (opacity: [number, number], scale: number) => keyframes`
  0% {
    opacity: ${rippleOpacity(opacity)[1]};
    transform: scale(${scale});
  }
  100% { 
    opacity: 0;
    transform: scale(${scale});
  }
`;

const rippleDuration = (duration?: number) =>
  typeof duration !== 'undefined' ? duration : DEFAULT_RIPPLE_ANIMATION_DURATION;

// TODO: add the ability to fire multiple ripples
export const useRipple = <T extends HTMLElement, P extends Partial<RippleTriggerProps<T>> = object>(
  args: UseRippleArgs
): UseRippleReturn<T, P> => {
  const rippleRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<T>(null);

  const [isMouseHold, setMouseHold] = useState<boolean>(false);
  const [isEnterAnimationEnd, setEnterAnimationEnd] = useState<boolean>(false);
  const [isExitAnimationEnd, setExitAnimationEnd] = useState<boolean>(false);
  const [isRippling, setRippling] = useState<boolean>(false);
  const [position, setPosition] = useState<RipplePos>({ left: 0, top: 0 });
  const [scale, setScale] = useState<number>(0);
  const [size, setSize] = useState<number>(0);
  const [key, setKey] = useState<string>('');
  const [duration, setDuration] = useState<number>(rippleDuration(args.duration));

  const handleRippleAnimationEnd = useCallback(() => {
    !isEnterAnimationEnd ? setEnterAnimationEnd(true) : setExitAnimationEnd(true);
  }, [isEnterAnimationEnd]);

  const handleRippleIn = useCallback(
    (evt?: React.MouseEvent<T>, opts?: HandleRippleInOpts) => {
      const currentTarget = evt ? (evt.currentTarget as T) : targetRef.current;

      if (!currentTarget) {
        throw new Error(
          `You are probably using ripple without 'React.MouseEvent'.` +
            `Set the 'ref' returned from 'useRipple().rippleTriggerProps.ref' to the target component.`
        );
      }

      const elementRect = currentTarget.getBoundingClientRect();

      // set relative position of cursor in element or calculate averages if evt doesn't exist
      const cursorRelativePositionX = evt
        ? evt.pageX - elementRect.x
        : currentTarget.clientWidth / 2;
      const cursorRelativePositionY = evt
        ? evt.pageY - elementRect.y
        : currentTarget.clientHeight / 2;

      // length of segments
      const leftX = cursorRelativePositionX;
      const rightX = currentTarget.clientWidth - cursorRelativePositionX;
      const topY = cursorRelativePositionY;
      const bottomY = currentTarget.clientHeight - cursorRelativePositionY;

      // circle radius: sqrt(pow(x2 - x1) + pow(y2 - y1))
      const circleRadius = Math.sqrt(
        (currentTarget.clientWidth - Math.min(leftX, rightX)) ** 2 +
          (currentTarget.clientHeight - Math.min(topY, bottomY)) ** 2
      );

      // max scale and size
      const newSize = Math.min(currentTarget.clientHeight, currentTarget.clientWidth);
      const maxScale = (circleRadius / newSize) * 2;

      setEnterAnimationEnd(false);
      setExitAnimationEnd(false);
      setMouseHold(true);
      setScale(maxScale);
      setSize(newSize);
      setKey(_uniqueId());
      setRippling(true);
      setDuration(opts?.force ? 0 : rippleDuration(args.duration));
      setPosition({
        left: cursorRelativePositionX - newSize / 2,
        top: cursorRelativePositionY - newSize / 2,
      });
    },
    [args.duration]
  );

  const handleRippleOut = useCallback((_?: React.MouseEvent<T>, opts?: HandleRippleOutOpts) => {
    setMouseHold(false);
    if (opts?.force) {
      setEnterAnimationEnd(false);
      setExitAnimationEnd(false);
      setRippling(false);
    }
  }, []);

  useEffect(() => {
    if (!isMouseHold && isEnterAnimationEnd && isExitAnimationEnd) {
      setRippling(false);
    }
  }, [isMouseHold, isEnterAnimationEnd, isExitAnimationEnd]);

  const opacity: [number, number] = useMemo(() => {
    if (typeof args.opacity !== 'undefined') {
      return Array.isArray(args.opacity) ? args.opacity : [args.opacity, args.opacity];
    }
    return [1, 1];
  }, [args.opacity]);

  const rippleTriggerProps: RippleTriggerProps<T> = {
    ref: targetRef,
    onMouseDown: handleRippleIn,
    onMouseUp: handleRippleOut,
    onMouseLeave: handleRippleOut,
    style: {
      overflow: 'hidden',
      position: 'relative',
    },
  };

  const addRippleTriggerProps = useCallback(
    (props?: P): P => {
      const newProps: P = (props ? { ...props } : {}) as P;

      if (props?.ref) {
        newProps.ref = combineRefs<T>([rippleTriggerProps.ref, props.ref]);
      } else {
        newProps.ref = targetRef;
      }

      newProps.onMouseDown = (evt) => {
        handleRippleIn(evt);
        props?.onMouseDown?.(evt);
      };

      newProps.onMouseUp = (evt) => {
        handleRippleOut();
        props?.onMouseUp?.(evt);
      };

      newProps.onMouseLeave = (evt) => {
        handleRippleOut();
        props?.onMouseLeave?.(evt);
      };

      if (props?.style) {
        newProps.style = {
          ...newProps?.style,
          ...rippleTriggerProps.style,
        };
      } else {
        newProps.style = rippleTriggerProps.style;
      }

      return newProps;
    },
    [handleRippleIn, handleRippleOut, rippleTriggerProps.ref, rippleTriggerProps.style]
  );

  const rippleProps: RippleProps = {
    ref: rippleRef,
    key,
    isRippling,
    size,
    position,
    duration,
    scale,
    color: args.color,
    opacity,
    onAnimationEnd: handleRippleAnimationEnd,
    isEntered: !isEnterAnimationEnd || isMouseHold,
    isExited: !isExitAnimationEnd,
  };

  return {
    handleRippleIn,
    handleRippleOut,
    rippleTriggerProps,
    addRippleTriggerProps,
    rippleProps,
  };
};

const getRippleStyles = ({
  size,
  position,
  isRippling,
}: RippleProps): Partial<CSSStyleDeclaration> => ({
  display: isRippling ? 'block' : 'none',
  width: px(size),
  height: px(size),
  top: px(position.top),
  left: px(position.left),
});

const Ripple = styled.div
  .withConfig({
    shouldForwardProp: (prop, defaultValidatorFn) =>
      defaultValidatorFn(prop) && !['in'].includes(prop),
  })
  .attrs<RippleProps>((props) => ({
    style: getRippleStyles(props),
  }))<RippleProps>`
  position: absolute;
  will-change: opacity, transform;
  border-radius: 50%;
  animation: ${({ isEntered, opacity, scale, duration, theme }) =>
    isEntered
      ? css`
          ${rippleInAnimation(opacity, scale)} ${rippleDuration(duration)}ms ${theme.animation
            .rippleTiming} forwards
        `
      : css`
          ${rippleOutAnimation(opacity, scale)} 300ms ${theme.animation.defaultTiming} forwards
        `};
  z-index: 0;
  background-color: ${({ color, theme }) => theme.colors[color || 'primaryLight']};
  pointer-events: none;
`;

export default React.memo(Ripple, _isEqual);
