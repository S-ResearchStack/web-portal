import React, { ReactElement } from 'react';
import styled from 'styled-components';

import { colors, px } from 'src/styles';
import SkeletonLoading from 'src/common/components/SkeletonLoading';

const SkeletonLoadingStyled = styled.div`
  background-color: ${colors.primaryWhite};
  width: 100%;
  height: 100%;
  border-radius: ${px(4)};
  padding: ${px(24)};
`;

const SkeletonsWrapper = styled(SkeletonLoading)`
  width: 100%;
`;

type Props = {
  isLoading?: boolean;
  children: ReactElement;
  skeletons: ReactElement[];
};

const OverviewCardWrapperWithSkeleton: React.FC<Props> = ({ isLoading, children, skeletons }) =>
  isLoading ? (
    <SkeletonLoadingStyled>
      <SkeletonsWrapper>{skeletons}</SkeletonsWrapper>
    </SkeletonLoadingStyled>
  ) : (
    children
  );

export default OverviewCardWrapperWithSkeleton;
