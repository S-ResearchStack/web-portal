import React, { FC } from 'react';

import styled, { FlattenSimpleInterpolation } from 'styled-components';

import { PropsWithTheme } from 'src/styles/themeHelpers';
import { colors, px, typography } from 'src/styles';

interface RoundChipsProps extends React.PropsWithChildren {
  type: 'disabled' | 'default';
}

const getChipsBgColorByType = (
  props: RoundChipsProps
): ((props: PropsWithTheme) => FlattenSimpleInterpolation) | undefined => {
  switch (props.type) {
    case 'default':
      return colors.primary05;
    case 'disabled':
      return colors.disabled20;
    default:
      return undefined;
  }
};
const getChipsFontColorByType = (
  props: RoundChipsProps
): ((props: PropsWithTheme) => FlattenSimpleInterpolation) | undefined => {
  switch (props.type) {
    case 'default':
      return colors.primary;
    case 'disabled':
      return colors.primaryDisabled;
    default:
      return undefined;
  }
};

const Chips: FC<RoundChipsProps> = styled.div`
  width: ${px(24)};
  height: ${px(24)};
  ${typography.labelSemibold};
  color: ${getChipsFontColorByType};
  background-color: ${getChipsBgColorByType};
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export default Chips;
