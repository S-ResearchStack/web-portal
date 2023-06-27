import React from 'react';

import _last from 'lodash/last';

import SustainedPhonationAudioIcon from 'src/assets/activity-task/preview/sustained_phonation_audio.svg';
import SustainedPhonationExhaleIcon from 'src/assets/activity-task/preview/sustained_phonation_exhale.svg';
import SustainedPhonationStartIcon from 'src/assets/activity-task/preview/sustained_phonation_start.svg';
import { ActivityPreviewConfig, commonStep, Content, doneStep, Icon, Text } from './common';

export default (({ itemValues }) => ({
  steps: [
    commonStep({
      icon: <SustainedPhonationStartIcon />,
      title: 'Sustained Phonation',
      list: [
        'Find yourself in a quiet environment without background noise.',
        'Hold phone 6 inches from mouth.',
        'Inhale, then exhale with a loud “ahh.”',
      ],
      nextLabel: 'Begin',
    }),
    {
      content: (
        <Content>
          <Text margin={24}>inhale, then exhale with a loud “ahh.”</Text>
          <Icon margin={17}>
            <SustainedPhonationExhaleIcon />
          </Icon>
          <Icon margin={25}>
            <SustainedPhonationAudioIcon />
          </Icon>
        </Content>
      ),
      nextLabel: 'Continue',
    },
    doneStep({ value: _last(itemValues) }),
  ],
})) as ActivityPreviewConfig;
