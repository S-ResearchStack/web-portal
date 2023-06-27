import React from 'react';

import _last from 'lodash/last';

import SitToStandStartIcon from 'src/assets/activity-task/preview/sit_to_stand_start.svg';
import SitToStandTimerIcon from 'src/assets/activity-task/preview/sit_to_stand_timer.svg';
import { ActivityPreviewConfig, commonStep, doneStep } from './common';

export default (({ itemValues }) => ({
  steps: [
    commonStep({
      icon: <SitToStandStartIcon />,
      title: 'Sit to Stand',
      list: [
        'Sit in a chair with one foot slightly in front of the other.',
        'Cross your arms at the wrists and hold them against the chest.',
        'Fully stand up and sit back down as many times as possible for 30 seconds.',
      ],
      nextLabel: 'Begin',
    }),
    commonStep({
      icon: <SitToStandTimerIcon />,
      title: 'Sit to Stand',
      list: [
        'Sit in a chair with one foot slightly in front of the other.',
        'Cross your arms at the wrists and hold them against the chest.',
        'Fully stand up and sit back down as many times as possible for 30 seconds.',
      ],
      nextLabel: 'Continue',
    }),
    doneStep({ value: _last(itemValues) }),
  ],
})) as ActivityPreviewConfig;
