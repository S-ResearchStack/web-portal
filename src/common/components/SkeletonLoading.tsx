import React, { Children, cloneElement, FC, useCallback, useMemo } from 'react';
import _uniqueId from 'lodash/uniqueId';
import _max from 'lodash/max';

import { px } from 'src/styles';

type SkeletonRectProps = React.SVGAttributes<SVGRectElement>;

export const SkeletonRect: FC<SkeletonRectProps> = ({ ...props }) => (
  <rect rx={4} fill="#E9E9E9" {...props} />
); // TODO: unknown color

type SkeletonPathProps = React.SVGAttributes<SVGPathElement>;

export const SkeletonPath: FC<SkeletonPathProps> = ({ ...props }) => (
  <path fill="#E9E9E9" {...props} />
); // TODO: unknown color

interface SkeletonLoadingProps
  extends React.PropsWithChildren<React.HTMLAttributes<SVGSVGElement>> {
  duration?: number;
  responsive?: boolean;
}

const SkeletonLoading: FC<SkeletonLoadingProps> = ({
  children,
  duration = 1300,
  responsive,
  ...props
}) => {
  const ids = useMemo(() => {
    const uid = _uniqueId();

    return {
      uid,
      gradient: `grad-${uid}`,
      overlay: `overlay-${uid}`,
      elementsClip: `elements-clip-${uid}`,
      element: `skeleton-rect-${uid}`,
    };
  }, []);

  const createElementId = useCallback((id: string | number) => `${ids.element}-${id}`, [ids]);

  const { width, height } = useMemo(() => {
    const maxXPoints: number[] = [];
    const maxYPoints: number[] = [];

    if (children) {
      Children.forEach(children, (child) => {
        if (!React.isValidElement(child)) return;

        maxXPoints.push(parseFloat(child.props.x) + parseFloat(child.props.width));
        maxYPoints.push(parseFloat(child.props.y) + parseFloat(child.props.height));
      });
    }

    return {
      width: _max(maxXPoints) || 0,
      height: _max(maxYPoints) || 0,
    };
  }, [children]);

  const elements = children
    ? Children.map(children, (child, idx) => <use href={`#${createElementId(idx)}`} />)
    : null;

  const svgProps = useMemo(
    () => ({
      ...props,
      ...(responsive
        ? { width: '100%', height: px(height) }
        : { width: px(width), height: px(height) }),
    }),
    [height, props, responsive, width]
  );

  return (
    <svg viewBox={`0 0 ${width} ${height}`} version="1.1" preserveAspectRatio="none" {...svgProps}>
      <defs>
        <radialGradient
          id={ids.gradient}
          cx="50%"
          cy="50%"
          fx="50%"
          fy="50%"
          r="50%"
          gradientTransform={[
            'translate(0, -0.5)',
            'skewX(-7)',
            'scale(0.5, 2)',
            'translate(0, 0)',
          ].join(',')}
        >
          <stop stopColor="#F3F3F3" offset="0%" /> {/* TODO unknown color */}
          <stop stopColor="#ECECEC" offset="70%" /> {/* TODO unknown color */}
          <stop stopColor="#E5E5E5" stopOpacity="0" offset="100%" /> {/* TODO unknown color */}
          <animateTransform
            attributeName="gradientTransform"
            type="translate"
            from="-1 0"
            to="8.5 0"
            dur={`${duration}ms`}
            repeatCount="indefinite"
            additive="sum"
          />
        </radialGradient>

        {children &&
          Children.map(children, (child, idx) =>
            cloneElement(
              child as unknown as React.ReactElement<SkeletonRectProps | SkeletonPathProps>,
              {
                id: createElementId(idx),
              }
            )
          )}

        <rect
          id={ids.overlay}
          x="0"
          y="0"
          width="100%"
          height="100%"
          stroke="none"
          fill={`url(#${ids.gradient})`}
        />

        <clipPath id={ids.elementsClip}>{elements}</clipPath>
      </defs>
      {elements}
      <use href={`#${ids.overlay}`} clipPath={`url(#${ids.elementsClip})`} />
    </svg>
  );
};

export default SkeletonLoading;
