import React from 'react';

import styled from 'styled-components';
import _last from 'lodash/last';

import StepTestStartIcon from 'src/assets/activity-task/preview/step_test_start.svg';
import StepTestDotsIcon from 'src/assets/activity-task/preview/step_test_dots.svg';
import { colors, px, typography } from 'src/styles';
import { ActivityPreviewConfig, commonStep, Content, doneStep, Icon, Text } from './common';

const TimeTitle = styled.div`
  margin-top: ${px(118)};
  ${typography.sdkHeadingLarge};
  color: ${colors.textPrimaryBlue};
`;

export default (({ itemValues }) => ({
  steps: [
    commonStep({
      icon: <StepTestStartIcon />,
      title: 'Step Test',
      list: [
        'Find stairs to perform this activity.',
        'Step up and down on the stairs continuously for 3 minutes.',
        'Follow the visual animation guidance.',
      ],
      nextLabel: 'Begin',
    }),
    {
      content: (
        <Content>
          <Icon margin={75}>
            <StepTestDotsIcon />
          </Icon>
          <TimeTitle>03:00</TimeTitle>
          <Text margin={16}>
            Keep pace with the beat for
            <br />3 minutes.
          </Text>
        </Content>
      ),
      nextLabel: 'Start Exercise',
    },
    doneStep({ value: _last(itemValues) }),
  ],
})) as ActivityPreviewConfig;
