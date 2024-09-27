import React, { useEffect, useState } from 'react';

import styled from 'styled-components';

import CollapseSectionButton from 'src/common/components/CollapseSectionButton';
import { ExtendProps } from 'src/common/utils/types';
import { px } from 'src/styles';

const Container = styled.div`
  margin-top: ${px(30)};
  &[data-collapsed] + & {
    margin-top: 0;
  }
  margin-bottom: ${px(12)};
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: ${px(24)};
`;

const Body = styled.div<{ $isCollapsed: boolean }>`
  margin-top: ${px(16)};
  display: ${({ $isCollapsed }) => ($isCollapsed ? 'none' : undefined)};
`;

type Props = ExtendProps<
  React.HTMLAttributes<HTMLDivElement>,
  React.PropsWithChildren<{
    title: string;
    disabled?: boolean;
    headerExtra?: React.ReactNode;
    onCollapsedChange?: (isCollapsed: boolean) => void;
    defaultCollapsed?: boolean;
  }>
>;

const CollapseSection: React.FC<Props> = ({
  title,
  disabled,
  headerExtra,
  onCollapsedChange,
  children,
  defaultCollapsed,
  ...rest
}) => {
  const [isCollapsed, setCollapsed] = useState(!!defaultCollapsed);

  useEffect(() => {
    setCollapsed(!!defaultCollapsed);
  }, [defaultCollapsed]);

  const handleClick = () => {
    const newState = !isCollapsed;
    setCollapsed(newState);
    onCollapsedChange?.(newState);
  };

  return (
    <Container {...rest} data-collapsed={isCollapsed || undefined}>
      <Header>
        <CollapseSectionButton onClick={handleClick} disabled={disabled} title={title} />
        {headerExtra}
      </Header>
      <Body data-testid="collapse-body" $isCollapsed={isCollapsed}>
        {children}
      </Body>
    </Container>
  );
};

export default CollapseSection;
