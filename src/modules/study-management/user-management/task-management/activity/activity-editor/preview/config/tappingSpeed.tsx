import React from 'react';

import TappingSpeedRightIcon from 'src/assets/activity-task/preview/tapping_speed_right.svg';
import TappingSpeedLeftIcon from 'src/assets/activity-task/preview/tapping_speed_left.svg';
import TappingSpeedButtonsIcon from 'src/assets/activity-task/preview/tapping_speed_buttons.svg';
import { ActivityPreviewConfig, Content, Icon, Title, Text, doneStep, commonStep } from './common';

export default (({ itemValues }) => ({
  steps: [
    commonStep({
      icon: <TappingSpeedRightIcon />,
      title: 'Tapping Speed',
      list: [
        'Place your phone on a flat surface.',
        'Use two fingers on right hand to alternatively tap the buttons on the screen for 10 seconds.',
        'Then, use two fingers on left hand to alternatively tap the buttons on the screen for 10 seconds.',
      ],
      nextLabel: 'Begin',
    }),
    commonStep({
      icon: <TappingSpeedRightIcon />,
      title: 'Tapping Speed- Right',
      list: [
        'Place your phone on a flat surface.',
        'Use two fingers on right hand to alternatively tap the buttons on the screen.',
        'Keep tapping for 10 seconds',
      ],
      nextLabel: 'Begin',
    }),
    {
      content: (
        <Content>
          <Title margin={32}>00:10</Title>
          <Text margin={16}>Tap the buttons with your right hand.</Text>
          <Icon margin={166}>
            <TappingSpeedButtonsIcon />
          </Icon>
        </Content>
      ),
      nextLabel: 'Continue',
    },
    commonStep({
      icon: <TappingSpeedLeftIcon />,
      title: 'Tapping Speed- Left',
      list: [
        'Place your phone on a flat surface.',
        'Use two fingers on left hand to alternatively tap the buttons on the screen.',
        'Keep tapping for 10 seconds',
      ],
      nextLabel: 'Begin',
    }),
    {
      content: (
        <Content>
          <Title margin={32}>00:10</Title>
          <Text margin={16}>Tap the buttons with your left hand.</Text>
          <Icon margin={166}>
            <TappingSpeedButtonsIcon />
          </Icon>
        </Content>
      ),
      nextLabel: 'Continue',
    },
    doneStep({ value: itemValues[5] }),
  ],
})) as ActivityPreviewConfig;
