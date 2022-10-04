import React from 'react';
import styled from 'styled-components';

import { px, animation } from 'src/styles';

const TabsContainer = styled.div`
  display: flex;
  height: ${px(38)};
`;

const Tab = styled.div<{ $active: boolean }>`
  position: relative;
  ${({ theme, $active }) =>
    $active ? theme.typography.bodyXSmallSemibold : theme.typography.bodyXSmallRegular};
  color: ${({ theme }) => theme.colors.updPrimary};
  margin: ${px(8)} ${px(10)} 0 ${px(8)};
  cursor: pointer;

  :after {
    position: absolute;
    left: 0;
    bottom: 0;
    height: ${px(4)};
    width: 100%;
    content: '';
    background-color: ${({ theme }) => theme.colors.updPrimary};
    display: flex;
    border-radius: ${px(2)};
    opacity: ${({ $active }) => ($active ? 1 : 0)};
    transition: opacity 300ms ${animation.defaultTiming};
  }

  &:hover {
    color: ${({ theme }) => theme.colors.updPrimaryBlueHovered};

    :after {
      background-color: ${({ theme }) => theme.colors.updPrimaryBlueHovered};
    }
  }

  :active {
    color: ${({ theme }) => theme.colors.updPrimaryBluePressed};

    :after {
      background-color: ${({ theme }) => theme.colors.updPrimaryBluePressed};
    }
  }
`;

type Props = {
  items: string[];
  activeItemIdx: number;
  onTabChange: (index: number) => void;
};

const Tabs = ({ items, activeItemIdx, onTabChange }: Props) => (
  <TabsContainer>
    {items.map((item, index) => (
      <Tab key={item} $active={activeItemIdx === index} onClick={() => onTabChange(index)}>
        {item}
      </Tab>
    ))}
  </TabsContainer>
);

export default Tabs;
