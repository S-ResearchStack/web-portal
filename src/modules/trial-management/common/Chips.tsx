import React, { FC } from 'react';
import styled, { FlattenSimpleInterpolation } from 'styled-components';

import { PropsWithTheme } from 'src/styles/themeHelpers';
import { colors, px, typography } from 'src/styles';

interface ChipsProps extends React.PropsWithChildren<unknown> {
  type: 'disabled' | 'success';
}

const getChipsBgColorByType = (
  props: ChipsProps
): ((props: PropsWithTheme) => FlattenSimpleInterpolation) | undefined => {
  switch (props.type) {
    case 'success':
      return colors.updStatusSuccess10;
    case 'disabled':
      return colors.updDisabled20;
    default:
      return undefined;
  }
};
const getChipsFontColorByType = (
  props: ChipsProps
): ((props: PropsWithTheme) => FlattenSimpleInterpolation) | undefined => {
  switch (props.type) {
    case 'success':
      return colors.updStatusSuccessText;
    case 'disabled':
      return colors.updTextPrimary;
    default:
      return undefined;
  }
};

const Chips: FC<ChipsProps> = styled.div`
  ${typography.bodyXSmallRegular};
  color: ${getChipsFontColorByType};
  background-color: ${getChipsBgColorByType};
  border-radius: ${px(4)};
  padding: ${px(7)} ${px(8)};
  height: ${px(32)};
`;

export default Chips;
