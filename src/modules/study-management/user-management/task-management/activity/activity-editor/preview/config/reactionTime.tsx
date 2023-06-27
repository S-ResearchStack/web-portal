import React from 'react';

import styled from 'styled-components';
import _last from 'lodash/last';

import { colors, px, typography } from 'src/styles';
import ReactionTimeDotIcon from 'src/assets/activity-task/preview/reaction_time_dot.svg';
import ReactionTimeStartIcon from 'src/assets/activity-task/preview/reaction_time_start.svg';
import { ActivityPreviewConfig, commonStep, Content, doneStep, Icon } from './common';

const ShakeText = styled.div`
  margin-top: ${px(24)};
  ${typography.sdkBodyMediumSemibold};
  color: ${colors.textPrimary};
`;

export default (({ itemValues }) => ({
  steps: [
    commonStep({
      icon: <ReactionTimeStartIcon />,
      title: 'Reaction Time',
      list: [
        'Hold phone in your right hand.',
        'As soon as you see a “square” appear, shake phone.',
      ],
      nextLabel: 'Begin',
    }),
    {
      content: (
        <Content>
          <ShakeText>Shake phone when a square appears.</ShakeText>
          <Icon margin={198}>
            <ReactionTimeDotIcon />
          </Icon>
        </Content>
      ),
      nextLabel: 'Continue',
    },
    doneStep({ value: _last(itemValues) }),
  ],
})) as ActivityPreviewConfig;
