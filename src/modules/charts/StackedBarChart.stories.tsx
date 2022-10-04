import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import { TooltipProvider, TooltipsList } from 'src/common/components/Tooltip';
import StackedBarChart from './StackedBarChart';

export default {
  component: StackedBarChart,
} as ComponentMeta<typeof StackedBarChart>;

const Template: ComponentStory<typeof StackedBarChart> = (args) => (
  <TooltipProvider>
    <StackedBarChart {...args} />
    <TooltipsList />
  </TooltipProvider>
);

const data = [
  {
    percentage: 7,
    scaleValue: 0,
  },
  {
    percentage: 11,
    scaleValue: 1,
  },
  {
    percentage: 9,
    scaleValue: 2,
  },
  {
    percentage: 5,
    scaleValue: 3,
  },
  {
    percentage: 18,
    scaleValue: 4,
  },
  {
    percentage: 12,
    scaleValue: 5,
  },
  {
    percentage: 6,
    scaleValue: 6,
  },
  {
    percentage: 7,
    scaleValue: 7,
  },
  {
    percentage: 10,
    scaleValue: 8,
  },
  {
    percentage: 7,
    scaleValue: 9,
  },
  {
    percentage: 8,
    scaleValue: 10,
  },
];

export const ScaleFrom0to10 = Template.bind({});
ScaleFrom0to10.args = {
  data,
  width: 600,
  height: 300,
  minScale: 0,
  maxScale: 10,
};

export const ScaleFrom1to5 = Template.bind({});
ScaleFrom1to5.args = {
  data: [
    { percentage: 24.33, scaleValue: 1 },
    { percentage: 14.33, scaleValue: 2 },
    { percentage: 9.33, scaleValue: 3 },
    { percentage: 30.5, scaleValue: 4 },
    { percentage: 20.5, scaleValue: 5 },
  ],
  width: 600,
  height: 300,
  minScale: 1,
  maxScale: 5,
  color: '#82CCB6',
};
