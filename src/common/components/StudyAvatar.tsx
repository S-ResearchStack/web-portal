import React from 'react';

import styled, { css, useTheme } from 'styled-components';

import StudyAvatarS from 'src/assets/icons/study_avatar_s.svg';
import StudyAvatarM from 'src/assets/icons/study_avatar_m.svg';
import StudyAvatarXXL from 'src/assets/icons/study_avatar_xxl.svg';
import SelectedStudyAvatarM from 'src/assets/icons/study_avatar_selected_m.svg';
import SelectedStudyAvatarXXL from 'src/assets/icons/study_avatar_selected_xxl.svg';
import { SpecColorType } from 'src/styles/theme';
import { animation, boxShadow, px } from 'src/styles';

export type AvatarSize = 's' | 'm' | 'xxl';

const adjustSizes = ($selected: boolean | undefined) => ({
  s: 36,
  m: $selected ? 69 : 62,
  xxl: $selected ? 147 : 142,
});

export type AvatarProps = {
  size?: AvatarSize;
  color: SpecColorType;
  faded?: boolean;
  $selected?: boolean;
} & React.HTMLAttributes<HTMLDivElement>;

const hoveredStyle = css`
  opacity: 1;
  box-shadow: ${boxShadow.studyAvatar};
  cursor: pointer;
`;

const pressedStyle = css`
  ${hoveredStyle};
  filter: drop-shadow(0 ${px(15)} ${px(20)} rgba(180, 180, 180, 0.3));
`;

const StyledAvatar = styled.div<AvatarProps>`
  border-radius: ${({ size }) => (size === 'xxl' ? px(66) : px(25))};
  height: ${({ size, $selected }) => size && px(adjustSizes($selected)[size])};
  transition: opacity 300ms ${animation.defaultTiming};
  position: relative;
  background-color: transparent !important;
  opacity: ${({ $selected }) => ($selected === false ? 0.5 : 1)};
  ${({ faded }) =>
    faded &&
    css`
      ${hoveredStyle}
    `};
  ${({ $selected, size }) =>
    $selected &&
    css`
      ${pressedStyle};
      height: ${px(adjustSizes($selected)[size || 'm'])};
    `};
  &:hover {
    ${hoveredStyle};
    &:active {
      ${pressedStyle};
    }
  }
`;

const AvatarIcon = (color: string, $selected: boolean | undefined) => ({
  s: <StudyAvatarS fill={color} data-testid="avatar-icon" />,
  m: $selected ? (
    <SelectedStudyAvatarM fill={color} data-testid="avatar-icon" />
  ) : (
    <StudyAvatarM fill={color} data-testid="avatar-icon" />
  ),
  xxl: $selected ? (
    <SelectedStudyAvatarXXL fill={color} data-testid="avatar-icon" />
  ) : (
    <StudyAvatarXXL fill={color} data-testid="avatar-icon" />
  ),
});

const StudyAvatar: React.FC<AvatarProps> = ({ color, size = 's', $selected, ...props }) => {
  const theme = useTheme();

  return (
    <StyledAvatar {...props} size={size} color={color} $selected={$selected}>
      {AvatarIcon(theme.colors[color], $selected)[size]}
    </StyledAvatar>
  );
};

export default StudyAvatar;
