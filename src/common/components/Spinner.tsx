import React from 'react';

import styled, { keyframes, css } from 'styled-components';

import SpinnerIconXS from 'src/assets/icons/spinner_xs.svg';
import SpinnerIconM from 'src/assets/icons/spinner_m.svg';
import SpinnerIconL from 'src/assets/icons/spinner_l.svg';
import { colors, animation } from 'src/styles';

const spinnerAnimation = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

type Size = 'xs' | 'm' | 'l';

type Props = {
  size: Size;
  $light?: boolean;
};

const spinnerStyles = ($light = false) => css`
  fill: ${$light ? colors.surface : colors.primary};
  animation: 1.1s infinite ${spinnerAnimation} ${animation.defaultTiming};
`;

const SpinnerIconXSStyled = styled(SpinnerIconXS)<{ $light?: boolean }>`
  ${({ $light }) => spinnerStyles($light)}
`;

const SpinnerIconMStyled = styled(SpinnerIconM)<{ $light?: boolean }>`
  ${({ $light }) => spinnerStyles($light)}
`;

const SpinnerIconLStyled = styled(SpinnerIconL)<{ $light?: boolean }>`
  ${({ $light }) => spinnerStyles($light)}
`;

const getSpinnerWithSize = (s: Size, $light = false) => {
  let icon = <SpinnerIconXSStyled $light={$light} data-testid="spinner" />;
  switch (s) {
    case 'm':
      icon = <SpinnerIconMStyled $light={$light} data-testid="spinner" />;
      break;
    case 'l':
      icon = <SpinnerIconLStyled $light={$light} data-testid="spinner" />;
      break;
    default:
      break;
  }
  return icon;
};

const Spinner = ({ size, $light }: Props) => getSpinnerWithSize(size, $light);

export default Spinner;
