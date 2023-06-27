import React from 'react';

import _last from 'lodash/last';

import WalkTestStartIcon from 'src/assets/activity-task/preview/walk_test_start.svg';
import WalkTestTimerIcon from 'src/assets/activity-task/preview/walk_test_timer.svg';
import { ActivityPreviewConfig, commonStep, doneStep } from './common';

export default (({ itemValues }) => ({
  steps: [
    commonStep({
      icon: <WalkTestStartIcon />,
      title: '6-Minute Walk Test',
      list: [
        'Find yourself outdoors in a long open field without obstacles in your way.',
        'Walk for 6 minutes while turning around at every 1 minute and 30 seconds mark.',
        'Pace yourself as you walk.',
      ],
      nextLabel: 'Begin',
    }),
    commonStep({
      icon: <WalkTestTimerIcon />,
      title: 'Turn around and continue walking in a straight line',
      nextLabel: 'Continue',
    }),
    doneStep({ value: _last(itemValues) }),
  ],
})) as ActivityPreviewConfig;
