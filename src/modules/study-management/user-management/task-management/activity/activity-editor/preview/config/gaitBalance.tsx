import React from 'react';

import _last from 'lodash/last';

import GaitBalanceTimerIcon from 'src/assets/activity-task/preview/gait_balance_timer.svg';
import GaitBalanceWalkIcon from 'src/assets/activity-task/preview/gait_balance_walk.svg';
import GaitBalanceWalkBackIcon from 'src/assets/activity-task/preview/gait_balance_walk_back.svg';
import { ActivityPreviewConfig, commonStep, doneStep } from './common';

export default (({ itemValues }) => ({
  steps: [
    commonStep({
      icon: <GaitBalanceWalkIcon />,
      title: 'Gait & Balance',
      list: [
        'Walk unassisted for 20 steps in a straight line.',
        'Turn around and walk back to your starting point.',
        'Stand still for 20 seconds.',
      ],
      nextLabel: 'Begin',
    }),
    commonStep({
      icon: <GaitBalanceWalkIcon />,
      title: 'Walk in a straight line unassisted for 20 steps',
      nextLabel: 'Done',
    }),
    commonStep({
      icon: <GaitBalanceWalkBackIcon />,
      title: 'Turn around and walk back to your starting point',
      nextLabel: 'Done',
    }),
    commonStep({
      icon: <GaitBalanceTimerIcon />,
      title: 'Stand still for 20 seconds',
      nextLabel: 'Continue',
    }),
    doneStep({ value: _last(itemValues) }),
  ],
})) as ActivityPreviewConfig;
