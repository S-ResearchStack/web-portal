import React from 'react';

import RangeOfMotionLeftIcon from 'src/assets/activity-task/preview/range_of_motion_left.svg';
import RangeOfMotionRightIcon from 'src/assets/activity-task/preview/range_of_motion_right.svg';
import RangeOfMotionTimerIcon from 'src/assets/activity-task/preview/range_of_motion_timer.svg';
import { ActivityPreviewConfig, commonStep, doneStep } from './common';

export default (({ itemValues }) => ({
  steps: [
    commonStep({
      icon: <RangeOfMotionRightIcon />,
      title: 'Range of Motion',
      list: [
        'Place phone in your right hand.',
        'Straighten your right arm and move it in a full circle for 20 sec.',
        'Then, place phone in your left hand.',
        'Straighten your left arm and move it in a full circle for 20 sec.',
      ],
      nextLabel: 'Begin',
    }),

    commonStep({
      icon: <RangeOfMotionRightIcon />,
      title: 'Right Arm Circumduction',
      list: [
        'Place phone in your right hand.',
        'Straighten your right arm and move it in a full circle for 20 sec.',
      ],
      nextLabel: 'Start Exercise',
    }),
    commonStep({
      icon: <RangeOfMotionTimerIcon />,
      title: 'Right Arm Circumduction',
      list: [
        'Place phone in your right hand.',
        'Straighten your right arm and move it in a full circle for 20 sec.',
      ],
      nextLabel: 'Start Exercise',
    }),

    commonStep({
      icon: <RangeOfMotionLeftIcon />,
      title: 'Left Arm Circumduction',
      list: [
        'Place phone in your left hand.',
        'Straighten your left arm and move it in a full circle for 20 sec.',
      ],
      nextLabel: 'Start Exercise',
    }),
    commonStep({
      icon: <RangeOfMotionTimerIcon />,
      title: 'Left Arm Circumduction',
      list: [
        'Place phone in your left hand.',
        'Straighten your left arm and move it in a full circle for 20 sec.',
      ],
      nextLabel: 'Start Exercise',
    }),
    doneStep({
      value: itemValues[5],
    }),
  ],
})) as ActivityPreviewConfig;
