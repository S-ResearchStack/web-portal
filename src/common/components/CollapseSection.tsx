import React, { useState } from 'react';
import styled from 'styled-components';
import ChevronDownIcon from 'src/assets/icons/section_chevron_down.svg';
import ChevronUpIcon from 'src/assets/icons/section_chevron_up.svg';
import { colors, px, typography } from 'src/styles';
import { ExtendProps } from 'src/common/utils/types';

const Container = styled.div`
  margin-top: ${px(60)};
  &[data-collapsed] + & {
    margin-top: 0;
  }
  margin-bottom: ${px(12)};
`;

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

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: ${px(24)};
`;

const Body = styled.div<{ $isCollapsed: boolean }>`
  margin-top: ${px(32)};
  display: ${({ $isCollapsed }) => ($isCollapsed ? 'none' : undefined)};
`;

type Props = ExtendProps<
  React.HTMLAttributes<HTMLDivElement>,
  React.PropsWithChildren<{
    title: string;
    disabled?: boolean;
    headerExtra?: React.ReactNode;
    onCollapsedChange?: (isCollapsed: boolean) => void;
  }>
>;

const CollapseSection: React.FC<Props> = ({
  title,
  disabled,
  headerExtra,
  onCollapsedChange,
  children,
  ...rest
}) => {
  const [isCollapsed, setCollapsed] = useState(false);

  const handleClick = () => {
    const newState = !isCollapsed;
    setCollapsed(newState);
    onCollapsedChange?.(newState);
  };

  return (
    <Container {...rest} data-collapsed={isCollapsed || undefined}>
      <Header>
        <HeaderButton onClick={handleClick} $disabled={disabled} data-testid="collapse-button">
          <HeaderTitle data-testid="collapse-title">{title}</HeaderTitle>
          <HeaderIcon>{isCollapsed ? <ChevronUpIcon /> : <ChevronDownIcon />}</HeaderIcon>
        </HeaderButton>
        {headerExtra}
      </Header>
      <Body data-testid="collapse-body" $isCollapsed={isCollapsed}>
        {children}
      </Body>
    </Container>
  );
};

export default CollapseSection;
