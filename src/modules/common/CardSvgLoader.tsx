import React from 'react';

import styled from 'styled-components';

import SkeletonLoading, { SkeletonRect } from 'src/common/components/SkeletonLoading';
import { px } from 'src/styles';

const Container = styled.div<{ $height: number }>`
  width: 100%;
  padding: ${px(24)};
  height: ${({ $height }) => px($height)};
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: space-between;
`;

const CardSvgLoader = ({
  minHeight,
  titleLoaderWidth,
}: {
  minHeight: number;
  titleLoaderWidth: number;
}) => (
  <Container $height={minHeight}>
    <SkeletonLoading>
      <SkeletonRect x={0} y={0} width={titleLoaderWidth} height={24} />
    </SkeletonLoading>
    <SkeletonLoading responsive>
      <SkeletonRect x={0} y={0} width={1000} height={24} />
    </SkeletonLoading>
  </Container>
);

export default CardSvgLoader;
