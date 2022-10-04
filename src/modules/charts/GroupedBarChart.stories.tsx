import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import ResponsiveContainer from '../../common/components/ResponsiveContainer';
import GroupedBarChart from './GroupedBarChart';

const mockData1 = [
  {
    name: 'male',
    dataKey: 'mon',
    value: 2000,
  },
  {
    name: 'male',
    dataKey: 'tue',
    value: 3000,
  },
  {
    name: 'male',
    dataKey: 'wed',
    value: 4000,
  },
  {
    name: 'male',
    dataKey: 'thu',
    value: 3500,
  },
  {
    name: 'male',
    dataKey: 'fri',
    value: 2500,
  },
  {
    name: 'male',
    dataKey: 'sat',
    value: 5000,
  },
  {
    name: 'male',
    dataKey: 'sun',
    value: 7000,
  },
  {
    name: 'female',
    dataKey: 'mon',
    value: 4000,
  },
  {
    name: 'female',
    dataKey: 'tue',
    value: 3200,
  },
  {
    name: 'female',
    dataKey: 'wed',
    value: 5500,
  },
  {
    name: 'female',
    dataKey: 'thu',
    value: 4000,
  },
  {
    name: 'female',
    dataKey: 'fri',
    value: 6000,
  },
  {
    name: 'female',
    dataKey: 'sat',
    value: 8000,
  },
  {
    name: 'female',
    dataKey: 'sun',
    value: 4600,
  },
];

const mockData2 = [
  {
    name: 'key1',
    dataKey: 'dKey1',
    value: 3500,
  },
  {
    name: 'key1',
    dataKey: 'dKey2',
    value: 6600,
  },
  {
    name: 'key2',
    dataKey: 'dKey1',
    value: 6000,
  },
  {
    name: 'key2',
    dataKey: 'dKey2',
    value: 5200,
  },
  {
    name: 'key3',
    dataKey: 'dKey1',
    value: 3700,
  },
  {
    name: 'key3',
    dataKey: 'dKey2',
    value: 4400,
  },
  {
    name: 'key4',
    dataKey: 'dKey1',
    value: 7700,
  },
  {
    name: 'key4',
    dataKey: 'dKey2',
    value: 5400,
  },
];

export default {
  component: GroupedBarChart,
} as ComponentMeta<typeof GroupedBarChart>;

const Template: ComponentStory<typeof GroupedBarChart> = (args) => <GroupedBarChart {...args} />;

const TemplateWithResponsiveContainer: ComponentStory<typeof GroupedBarChart> = (args) => (
  <ResponsiveContainer>
    <GroupedBarChart {...args} />
  </ResponsiveContainer>
);

export const Horizontal = Template.bind({});
Horizontal.args = {
  data: mockData1,
  width: 700,
  height: 300,
  barColors: ['secondaryTurquoise', 'secondaryPurple'],
  numberOfKeys: 2,
  isHorizontal: true,
  maxValue: 8000,
  formatXAxisTick: (d) => (d ? `${+d / 1000}k` : '0'),
};

export const VerticalWithResponsiveContainer = TemplateWithResponsiveContainer.bind({});
VerticalWithResponsiveContainer.args = {
  data: mockData2,
  height: 400,
  barColors: ['secondaryTurquoise', 'secondaryBlue', 'secondaryPurple', 'secondaryGreen'],
  numberOfKeys: 4,
  maxValue: 10000,
};
