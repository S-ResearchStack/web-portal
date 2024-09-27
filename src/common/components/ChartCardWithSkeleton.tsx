import React from 'react';
import { Skeleton } from '@mui/material';
import _range from 'lodash/range';
import styled from 'styled-components';

import { colors, px } from 'src/styles';
import { MIN_CARD_HEIGHT } from 'src/modules/dashboard/components/ChartCard';

const SkeletonLoadingStyled = styled.div`
  background-color: ${colors.primaryWhite};
  height: 100%;
  width: 100%;
  min-height: ${px(MIN_CARD_HEIGHT)};
  border-radius: ${px(4)};
  padding: ${px(24)} ${px(24)} ${px(16)} ${px(24)};
`;

type Props = {
  cardNumber: number;
};

const ChartCardWithSkeleton: React.FC<Props> = ({ cardNumber }) => (
  <>
    {_range(cardNumber).map((i) => (
      <SkeletonLoadingStyled key={i} role='skeleton'>
        <Skeleton variant="rounded" height={30} width={312} animation="wave" />
        <Skeleton
          variant="circular"
          height={200}
          width={200}
          animation="wave"
          style={{ margin: '50px auto' }}
        />
      </SkeletonLoadingStyled>
    ))}
  </>
);

export default ChartCardWithSkeleton;
