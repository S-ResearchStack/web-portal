import React from 'react';
import styled from 'styled-components';

import { px } from 'src/styles';
import useCurrentBreakpoint from 'src/common/useCurrentBreakpoint';

type CardSizeDefinition = 'fullsize' | 'halfsize';

type Props = {
  items: { element: JSX.Element; key: string; columns?: number; size?: CardSizeDefinition }[];
};

type ContainerProps = { $gutter: number; $numColumns: number };

const Container = styled.div.attrs<ContainerProps>(({ $gutter, $numColumns }) => ({
  style: {
    gridTemplateColumns: `repeat(${$numColumns}, 1fr)`,
    gap: px($gutter),
  },
}))<ContainerProps>`
  width: 100%;
  display: grid;
`;

type ItemProps = { $columnSpan: number };

const Item = styled.div.attrs<ItemProps>(({ $columnSpan }) => ({
  style: {
    gridColumn: `span ${$columnSpan}`,
  },
}))<ItemProps>``;

const getCardColumnSpan = (
  breakpointWidth: number,
  totalColumns: number,
  { columns, size }: Props['items'][number]
) => {
  if (columns) {
    return columns;
  }

  if (size === 'halfsize') {
    return breakpointWidth <= 840 ? totalColumns : totalColumns / 2;
  }

  return totalColumns;
};

const DashboardGridLayout: React.FC<Props> = ({ items }) => {
  const { gutter, totalColumns, width: breakpointWidth } = useCurrentBreakpoint();

  return (
    <Container $gutter={gutter} $numColumns={totalColumns}>
      {items.map((item) => (
        <Item key={item.key} $columnSpan={getCardColumnSpan(breakpointWidth, totalColumns, item)}>
          {item.element}
        </Item>
      ))}
    </Container>
  );
};
export default DashboardGridLayout;
