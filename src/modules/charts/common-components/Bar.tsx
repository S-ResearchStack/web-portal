import React from 'react';
import styled, { css } from 'styled-components';

import { colors, typography } from 'src/styles';

export const BAR_CLASS_NAME = 'bar';

const StyledRect = styled.rect`
  fill: ${colors.secondarySkyBlue};
`;

const StyledText = styled.text<{ $isHorizontal: boolean }>`
  ${typography.headingXSmall};

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
  onMouseEnter?: (event: React.MouseEvent<SVGPathElement, MouseEvent>) => void;
  onMouseLeave?: (event: React.MouseEvent<SVGPathElement, MouseEvent>) => void;
};

const Bar: React.FC<Props> = ({
  id,
  rectProps,
  textProps,
  isHorizontal,
  onMouseEnter,
  onMouseLeave,
}) => (
  <g className={BAR_CLASS_NAME} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
    <StyledRect
      id={id}
      data-testid={id}
      x={rectProps.x}
      y={rectProps.y}
      width={rectProps.width}
      height={rectProps.height}
    />
    <StyledText $isHorizontal={!!isHorizontal} x={textProps.x} y={textProps.y} dy={textProps.dy} />
  </g>
);

export default Bar;
