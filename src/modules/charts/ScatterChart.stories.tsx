import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import _range from 'lodash/range';

import { SpecColorType } from 'src/styles/theme';
import { TooltipProvider, TooltipsList } from 'src/common/components/Tooltip';
import ResponsiveContainer from '../../common/components/ResponsiveContainer';
import ScatterChart from './ScatterChart';

const randomDate = (start: Date, end: Date) =>
  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

const mockDotsData = _range(300).map(() => {
  const name = Math.random() < 0.5 ? 'male' : 'female';
  return {
    name,
    age: Math.floor(Math.random() * 80) + 20,
    value: Math.floor(Math.random() * 40) + 50,
    lastSync: randomDate(new Date(2022, 6, 1), new Date()).valueOf(),
    color: name === 'female' ? 'secondaryViolet' : ('secondarySkyBlue' as SpecColorType),
  };
});

const mockLinesData = [
  {
    name: 'male',
    age: 20,
    value: 65,
    color: 'secondarySkyBlue' as SpecColorType,
  },
  {
    name: 'male',
    age: 100,
    value: 80,
    color: 'secondarySkyBlue' as SpecColorType,
  },
  {
    name: 'female',
    age: 20,
    value: 69,
    color: 'secondaryViolet' as SpecColorType,
  },
  {
    name: 'female',
    age: 100,
    value: 75,
    color: 'secondaryViolet' as SpecColorType,
  },
];

export default {
  showTrendLine: true,
} as ComponentMeta<typeof ScatterChart>;

const Template: ComponentStory<typeof ScatterChart> = (args) => (
  <TooltipProvider>
    <ScatterChart {...args} />
    <TooltipsList />
  </TooltipProvider>
);

const TemplateWithResponsiveContainer: ComponentStory<typeof ScatterChart> = (args) => (
  <ResponsiveContainer>
    <Template {...args} />
  </ResponsiveContainer>
);

export const BasicChart = Template.bind({});
BasicChart.args = {
  showTrendLine: true,
  dots: mockDotsData,
  lines: mockLinesData,
  width: 900,
  height: 300,
};

export const WithResponsiveContainer = TemplateWithResponsiveContainer.bind({});
WithResponsiveContainer.args = {
  showTrendLine: false,
  dots: mockDotsData,
  lines: mockLinesData,
  height: 300,
};
