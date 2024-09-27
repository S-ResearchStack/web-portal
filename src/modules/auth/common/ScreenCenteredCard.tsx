import React, { ReactElement } from 'react';
import styled, { css } from 'styled-components';
import { boxShadow, colors, px } from 'src/styles';


type ScreenCenteredCardProps = {
  minWidth?: number;
  width?: number;
  ratio?: number;
  children: ReactElement | ReactElement[];
  onMainButtonClick?: () => void;
};

const ScreenCenteredCard = ({ children, onMainButtonClick, ...rest }: ScreenCenteredCardProps) => (
  <>{children}</>
);

export default ScreenCenteredCard;
