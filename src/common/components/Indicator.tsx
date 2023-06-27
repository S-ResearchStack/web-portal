import React from 'react';

import styled from 'styled-components';

import { colors, px } from 'src/styles';

type IndicatorColor = 'success' | 'warning' | 'error' | 'info';

export type IndicatorProps = {
  color?: IndicatorColor;
  size?: 's' | 'm';
} & React.HTMLAttributes<HTMLDivElement>;

const getSize = (size: 's' | 'm' | undefined): number => (size === 'm' ? 12 : 8);

const colorMap = {
  success: colors.statusSuccess,
  warning: colors.statusWarning,
  error: colors.statusError,
  info: colors.primary,
};

const StyledIndicator = styled.div<IndicatorProps>`
  background-color: ${({ color }) => colorMap[color ?? 'info']};
  border: none;
  border-radius: 50%;
  height: ${({ size }) => px(getSize(size))};
  width: ${({ size }) => px(getSize(size))};
  min-width: ${({ size }) => px(getSize(size))};
  min-height: ${({ size }) => px(getSize(size))};
`;

const Indicator = (props: IndicatorProps) => <StyledIndicator {...props} />;

export default Indicator;
