import React, { useEffect, useRef } from 'react';
import styled, { css } from 'styled-components';
import * as d3 from 'd3';

import { colors, typography } from 'src/styles';

const BAR_CLASS_NAME = 'bar';

const StyledRect = styled.rect`
  fill: ${colors.secondarySkyBlue};
`;

const StyledText = styled.text<{ $isHorizontal: boolean; isSmall?: boolean }>`
  ${({ isSmall }) => (isSmall ? typography.bodyXSmallSemibold : typography.headingXSmall)};

  &.small-color {
    ${typography.bodyXSmallSemibold};
  }

  value {
    fill: ${colors.background};
    ${({ $isHorizontal }) =>
      !$isHorizontal &&
      css`
        dominant-baseline: middle;
        text-anchor: middle;
      `}
  }
`;

interface RectProps {
  x: number;
  y: number;
  height: number;
  width: number;
}

interface TextProps {
  x: number;
  y: number;
  dy?: string;
  text: string;
  fill: string;
}

type Props = {
  id: string;
  rectProps: RectProps;
  textProps: TextProps;
  isHorizontal?: boolean;
  maxHeight?: number;
  maxY?: number;
  maxWidth?: number;
  maxX?: number;
  isSmallText?: boolean;
  onMouseEnter?: (event: React.MouseEvent<SVGPathElement, MouseEvent>) => void;
  onMouseLeave?: (event: React.MouseEvent<SVGPathElement, MouseEvent>) => void;
  setIsSmallText?: (isSmall: boolean) => void;
};

const Bar: React.FC<Props> = ({
  id,
  rectProps,
  textProps,
  isHorizontal,
  maxHeight,
  maxY,
  maxWidth,
  maxX,
  isSmallText,
  onMouseEnter,
  onMouseLeave,
  setIsSmallText,
}) => {
  const barRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const textNode = d3.select(barRef.current).select('text').node() as HTMLElement;
    const textRect = textNode?.getBoundingClientRect();

    if (textRect.width > rectProps.width && !isSmallText && setIsSmallText) {
      setIsSmallText(true);
    }

    if (textRect) {
      d3.select(barRef.current)
        .select('text')
        .attr('transform', `translate(${-textRect.width / 2})`);
    }
  });

  return (
    <g ref={barRef} className={BAR_CLASS_NAME} data-testid={id}>
      <g id={id}>
        <StyledRect
          x={rectProps.x}
          y={rectProps.y}
          width={rectProps.width}
          height={rectProps.height}
        />
        <StyledText
          $isHorizontal={!!isHorizontal}
          x={textProps.x}
          y={textProps.y}
          dy={textProps.dy}
          fill={textProps.fill}
          isSmall={isSmallText}
        >
          {textProps.text}
        </StyledText>
      </g>
      {!isHorizontal && maxHeight && maxY && (
        <rect
          x={rectProps.x}
          y={maxY}
          width={rectProps.width}
          height={maxHeight}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          fill="transparent"
        />
      )}
      {isHorizontal && maxWidth && maxX && (
        <rect
          id={id}
          data-testid={id}
          x={maxX}
          y={rectProps.y}
          width={maxWidth}
          height={rectProps.x}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          fill="transparent"
        />
      )}
    </g>
  );
};

export default Bar;
