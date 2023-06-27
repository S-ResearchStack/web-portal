import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import _range from 'lodash/range';
import { DateTime } from 'luxon';

import { TooltipProvider, TooltipsList } from 'src/common/components/Tooltip';
import Random from 'src/common/Random';
import ResponsiveContainer from '../../common/components/ResponsiveContainer';
import LineChartWithDynamicAxis from './LineChartWithDynamicAxis';

const startTime = DateTime.utc().startOf('day');

const startTs = startTime.valueOf();
const endTs = (key: string, value: number) => startTime.plus({ [key]: value }).valueOf();

const mockTs = (endTsKey: string, endTsValue: number, numberOfDots: number) =>
  _range(numberOfDots)
    .map((i) => startTs + ((endTs(endTsKey, endTsValue) - startTs) / numberOfDots) * i)
    .sort((a, b) => a - b);

const mockData = (endTsKey: string, endTsValue: number, numberOfDots: number) =>
  _range(numberOfDots).map((i) => ({
    value: Random.shared.int(10, 500),
    ts: mockTs(endTsKey, endTsValue, numberOfDots)[i],
  }));

export default {
  component: LineChartWithDynamicAxis,
} as ComponentMeta<typeof LineChartWithDynamicAxis>;

const Template: ComponentStory<typeof LineChartWithDynamicAxis> = (args) => (
  <TooltipProvider>
    <LineChartWithDynamicAxis {...args} />
    <TooltipsList />
  </TooltipProvider>
);

const TemplateWithResponsiveContainer: ComponentStory<typeof LineChartWithDynamicAxis> = (args) => (
  <ResponsiveContainer>
    <Template {...args} />
  </ResponsiveContainer>
);

export const Hour = Template.bind({});
Hour.args = {
  data: mockData('hours', 12, 12),
  width: 500,
  height: 300,
};

export const Day = Template.bind({});
Day.args = {
  data: mockData('days', 6, 6),
  width: 500,
  height: 300,
};

export const Month = Template.bind({});
Month.args = {
  data: mockData('months', 6, 6),
  width: 500,
  height: 300,
};

export const Years = Template.bind({});
Years.args = {
  data: mockData('years', 5, 5),
  width: 500,
  height: 300,
};

export const WithResponsiveContainer = TemplateWithResponsiveContainer.bind({});
WithResponsiveContainer.args = {
  data: mockData('hours', 24, 12),
  height: 300,
};
