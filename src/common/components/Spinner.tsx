import React from 'react';
import styled, { keyframes, css } from 'styled-components';

import { colors, animation } from 'src/styles';
import SpinnerIconL from 'src/assets/icons/spinner.svg';
import SpinnerIconXS from 'src/assets/icons/spinner_xs.svg';

const spinnerAnimation = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

type Size = 'l' | 'xs';

type Props = {
  spin?: boolean;
  size: Size;
};

const spinnerStyles = css`
  fill: ${colors.updPrimary};
  animation: 1.1s infinite ${spinnerAnimation} ${animation.defaultTiming};
`;

const SpinnerIconLStyled = styled(SpinnerIconL)`
  ${spinnerStyles}
`;

const SpinnerIconXSStyled = styled(SpinnerIconXS)`
  ${spinnerStyles}
`;

const getSpinnerWithSize = (s: Size) => {
  let icon = SpinnerIconLStyled;
  if (s === 'l') {
    icon = SpinnerIconLStyled;
  } else if (s === 'xs') {
    icon = SpinnerIconXSStyled;
  }

  return icon;
};

const Spinner = ({ size, spin }: Props) => {
  if (!spin) {
    return null;
  }

  const Icon = getSpinnerWithSize(size);

  return spin ? <Icon /> : null;
};

export default Spinner;
