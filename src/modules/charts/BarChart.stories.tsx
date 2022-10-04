import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import { TooltipProvider, TooltipsList } from 'src/common/components/Tooltip';
import BarChart from './BarChart';

export default {
  isHorizontal: false,
} as ComponentMeta<typeof BarChart>;

const Template: ComponentStory<typeof BarChart> = (args) => (
  <TooltipProvider>
    <BarChart {...args} />
    <TooltipsList />
  </TooltipProvider>
);
const data = [
  { name: 'Q1', value: 23, totalValue: 100 },
  { name: 'Q2', value: 38, totalValue: 100 },
  { name: 'Q3', value: 16, totalValue: 100 },
  { name: 'Q4', value: 56, totalValue: 100 },
  { name: 'Q5', value: 84, totalValue: 100 },
];

export const BasicChart = Template.bind({});
BasicChart.args = {
  isHorizontal: false,
  data,
  width: 500,
  height: 500,
};
