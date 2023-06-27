import React, { useEffect, useState } from 'react';

import styled from 'styled-components';

import ChevronUpIcon from 'src/assets/icons/chevron_up.svg';
import ChevronDownIcon from 'src/assets/icons/chevron_down.svg';
import { ExtendProps } from 'src/common/utils/types';
import { colors, px, typography } from 'src/styles';

const HeaderIcon = styled.div``;

const HeaderTitle = styled.div``;

const HeaderButton = styled.div<{ $disabled?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${px(8)};

  pointer-events: ${({ $disabled }) => ($disabled ? 'none' : undefined)};

  &:hover {
    cursor: pointer;
  }

  ${HeaderIcon} {
    height: ${px(24)};
    width: ${px(24)};
    border-radius: ${px(2)};

    svg {
      fill: ${colors.textPrimary};
    }
  }
  &:hover:not(:active) ${HeaderIcon} {
    background-color: ${colors.disabled20};
  }

  ${HeaderTitle} {
    ${typography.labelSemibold};
    color: ${({ $disabled, theme }) =>
      $disabled ? theme.colors.onDisabled : theme.colors.textPrimary};
    letter-spacing: 0.03em;
    text-transform: uppercase;
  }
  &:active ${HeaderTitle} {
    color: ${colors.onSurface};
  }
`;

type Props = ExtendProps<
  React.HTMLAttributes<HTMLDivElement>,
  React.PropsWithChildren<{
    title: string | React.ReactElement;
    disabled?: boolean;
    headerExtra?: React.ReactNode;
    onCollapsedChange?: (isCollapsed: boolean) => void;
    defaultCollapsed?: boolean;
    onClick: () => void;
  }>
>;

const CollapseSectionButton: React.FC<Props> = ({
  title,
  disabled,
  onCollapsedChange,
  defaultCollapsed,
  onClick,
}) => {
  const [isCollapsed, setCollapsed] = useState(!!defaultCollapsed);

  useEffect(() => {
    setCollapsed(!!defaultCollapsed);
  }, [defaultCollapsed]);

  const handleClick = () => {
    const newState = !isCollapsed;
    setCollapsed(newState);
    onCollapsedChange?.(newState);
    onClick();
  };

  return (
    <HeaderButton onClick={handleClick} $disabled={disabled} data-testid="collapse-button">
      <HeaderTitle data-testid="collapse-title">{title}</HeaderTitle>
      <HeaderIcon>{isCollapsed ? <ChevronUpIcon /> : <ChevronDownIcon />}</HeaderIcon>
    </HeaderButton>
  );
};

export default CollapseSectionButton;
