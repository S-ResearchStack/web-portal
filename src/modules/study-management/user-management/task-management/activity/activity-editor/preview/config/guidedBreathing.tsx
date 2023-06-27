import React from 'react';

import styled from 'styled-components';
import _last from 'lodash/last';

import { colors, px, typography } from 'src/styles';
import GuidedBreathingExhaleIcon from 'src/assets/activity-task/preview/guided_breathing_exhale.svg';
import GuidedBreathingStartIcon from 'src/assets/activity-task/preview/guided_breathing_start.svg';
import { ActivityPreviewConfig, commonStep, Content, doneStep, Icon } from './common';

const InhaleExhaleContainer = styled.div`
  margin-top: ${px(54)};
  display: flex;
  gap: ${px(24)};

  > :first-child {
    ${typography.sdkBodyLargeRegular};
    color: rgba(0, 0, 0, 0.6);
  }

  > :last-child {
    ${typography.sdkBodyLargeSemibold};
    color: ${colors.textPrimaryBlue};
  }
`;

const CyclesContainer = styled.div`
  margin-top: ${px(24)};
  display: flex;
  gap: ${px(8)};
  align-items: baseline;
  color: ${colors.textPrimary};

  > :first-child {
    ${typography.headingLargeSemibold};
  }

  > :last-child {
    ${typography.headingSmall};
  }
`;

export default (({ itemValues }) => ({
  steps: [
    commonStep({
      icon: <GuidedBreathingStartIcon />,
      title: 'Guided Breathing',
      list: [
        'Sit upright and take 10 deep breaths in and out as loudly as you can.',
        'Do not hold your breath between inhale & exhale.',
        'Try your best to follow the breathing guidance.',
      ],
      nextLabel: 'Begin',
    }),
    {
      content: (
        <Content>
          <Icon margin={24}>
            <GuidedBreathingExhaleIcon />
          </Icon>
          <InhaleExhaleContainer>
            <div>You’re inhaling</div>
            <div>You’re exhaling</div>
          </InhaleExhaleContainer>
          <CyclesContainer>
            <div>10/10</div>
            <div>cycles</div>
          </CyclesContainer>
        </Content>
      ),
      nextLabel: 'Continue',
    },
    doneStep({ value: _last(itemValues) }),
  ],
})) as ActivityPreviewConfig;
