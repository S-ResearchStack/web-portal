import React from 'react';

import _last from 'lodash/last';

import SpirometryStartIcon from 'src/assets/activity-task/preview/spirometry_start.svg';
import SpirometryAudioIcon from 'src/assets/activity-task/preview/spirometry_audio.svg';
import {
  ActivityPreviewConfig,
  commonStep,
  Content,
  doneStep,
  Icon,
  List,
  ListItem,
  Title,
} from './common';

const secondStepList = [
  'Hold phone 6 inches from mouth.',
  'Take a deep breath and blow out fast, forcefully and as long as you can.',
  'Repeat 3 times in one recording.',
];

export default (({ itemValues }) => ({
  steps: [
    commonStep({
      icon: <SpirometryStartIcon />,
      title: 'Mobile Spirometry',
      list: [
        'Hold phone 6 inches from mouth.',
        'Take a deep breath and blow out fast, forcefully and as long as you can.',
        'Repeat 3 times in one recording.',
      ],
      nextLabel: 'Start Recording',
    }),
    {
      content: (
        <Content>
          <Icon margin={138}>
            <SpirometryAudioIcon />
          </Icon>
          <Title margin={54}>Breathe Forcefully 3 Times</Title>
          <List margin={32}>
            {secondStepList.map((item) => (
              <ListItem key={item}>{item}</ListItem>
            ))}
          </List>
        </Content>
      ),
      nextLabel: 'Stop Recording',
    },
    doneStep({ value: _last(itemValues) }),
  ],
})) as ActivityPreviewConfig;
