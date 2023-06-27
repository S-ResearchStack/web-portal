import React from 'react';

import styled from 'styled-components';
import _last from 'lodash/last';

import { colors, px, typography } from 'src/styles';
import StroopTestStartIcon from 'src/assets/activity-task/preview/color_challenge_start.svg';
import StroopTestDotsIcon from 'src/assets/activity-task/preview/color_challenge_dots.svg';
import { ActivityPreviewConfig, Text, commonStep, Content, doneStep, Icon } from './common';

const ColorText = styled.div`
  margin-top: ${px(164)};
  ${typography.sdkBodyXXLSemibold};
  color: ${colors.secondaryViolet};
`;

export default (({ itemValues }) => ({
  steps: [
    commonStep({
      icon: <StroopTestStartIcon />,
      title: 'Color Word Challenge',
      list: [
        'See words presented in different colors.',
        'Indicate the color in which each word is printed as quickly as you can.',
      ],
      nextLabel: 'Begin',
    }),
    {
      content: (
        <Content>
          <Text margin={24}>Pick the color of the word</Text>
          <ColorText>ORANGE</ColorText>
          <Icon margin={190}>
            <StroopTestDotsIcon />
          </Icon>
        </Content>
      ),
      nextLabel: 'Continue',
    },
    doneStep({ value: _last(itemValues) }),
  ],
})) as ActivityPreviewConfig;
