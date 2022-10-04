import React, { FunctionComponent, SVGProps } from 'react';
import { SpecColorType } from 'src/styles/theme';

import styled, { css } from 'styled-components';

import { colors, px } from 'src/styles';
import { isDevShowFocus } from 'src/common/utils/dev';

export const sizeSpec = {
  s: 16,
  m: 24,
  l: 40,
};

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  color: SpecColorType;
  $size: 's' | 'm' | 'l';
  selected?: boolean;
  icon: FunctionComponent<SVGProps<SVGSVGElement>>;
}

const StyledIconButton = styled.button<Omit<IconButtonProps, 'icon'>>`
  background: none;
  border: none;
  padding: 0;
  height: ${({ $size }) => px(sizeSpec[$size])};
  width: ${({ $size }) => px(sizeSpec[$size])};
  svg {
    fill: ${({ color, theme }) => theme.colors[color]};
  }
  &:active,
  &:hover {
    svg {
      fill: ${({ color, theme }) => theme.colors[color]};
    }
  }
  &:disabled {
    svg {
      fill: ${colors.disabled};
    }
  }

  // TODO: for dev only
  ${isDevShowFocus &&
  css`
    &:focus-visible {
      outline: 2px solid ${colors.primary30} !important;
    }
  `}
`;

const IconButton = (props: IconButtonProps) => {
  const { icon, ...rest } = props;
  const Icon = icon;

  return (
    <StyledIconButton {...rest}>
      <Icon />
    </StyledIconButton>
  );
};

export default IconButton;
