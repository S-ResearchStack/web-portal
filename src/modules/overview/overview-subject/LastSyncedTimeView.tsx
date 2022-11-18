import React from 'react';

import styled from 'styled-components';

import { getAbsoluteTimeByTs, getRelativeTimeByTs } from 'src/common/utils/datetime';
import { getIndicatorTypeByTs } from 'src/modules/overview/ParticipantListCard';
import Indicator from 'src/common/components/Indicator';
import { px, typography } from 'src/styles';

const TimeWrapper = styled.div`
  ${typography.bodySmallRegular};
  display: flex;
  align-items: center;
  line-height: ${px(26)};
`;

const StyledIndicator = styled(Indicator)`
  margin-right: ${px(9)};
`;

const Divider = styled.div`
  margin: 0 ${px(4)};
  ${typography.bodyMediumRegular};
`;

type LastSyncedTimeViewProps = {
  time: number;
};

const LastSyncedTimeView = ({ time }: LastSyncedTimeViewProps) => (
  <TimeWrapper>
    <StyledIndicator size="m" color={getIndicatorTypeByTs(time)} />
    {`${getRelativeTimeByTs(time)} ago`}
    <Divider>|</Divider>
    {`${getAbsoluteTimeByTs(time).join(' ')}`}
  </TimeWrapper>
);

export default LastSyncedTimeView;
