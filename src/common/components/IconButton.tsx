import React, { FunctionComponent, SVGProps } from 'react';
import { SpecColorType } from 'src/styles/theme';

import styled, { css } from 'styled-components';

import { colors, px } from 'src/styles';
import { isDevShowFocus } from 'src/common/utils/dev';

const sizeSpec = {
  s: 16,
  m: 24,
  l: 40,
};

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  color?: SpecColorType;
  $size?: 's' | 'm' | 'l';
  selected?: boolean;
  icon?: FunctionComponent<SVGProps<SVGSVGElement>>;
}

const StyledIconButton = styled.button<Omit<IconButtonProps, 'icon'>>`
  background: none;
  border: none;
  padding: 0;
  height: ${({ $size }) => px(sizeSpec[$size ?? 'm'])};
  width: ${({ $size }) => px(sizeSpec[$size ?? 'm'])};
  svg {
    fill: ${({ color, theme }) => theme.colors[color || 'black']};
  }
  &:active,
  &:enabled:hover {
    cursor: pointer;
    svg {
      fill: ${({ color, theme }) => theme.colors[color || 'black']};
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

  return <StyledIconButton {...rest}>{Icon && <Icon data-testid="icon" />}</StyledIconButton>;
};

export default IconButton;
