import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import _range from 'lodash/range';
import { DateTime } from 'luxon';

import { SpecColorType } from 'src/styles/theme';
import { TooltipProvider, TooltipsList } from 'src/common/components/Tooltip';
import ResponsiveContainer from '../../common/components/ResponsiveContainer';
import LineChart from './LineChart';

const randomDate = (start: Date, end: Date) =>
  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

const startTime = DateTime.utc()
  .minus({ days: 1 })
  .set({ hour: 6, minute: 0, second: 0, millisecond: 0 });
const endTime = startTime.plus({ days: 1 });

const mockData = _range(200).map(() => {
  const value = Math.floor(Math.random() * 10) + 70;
  const name = Math.random() < 0.5 ? 'male' : 'female';

  return {
    name,
    ts: Math.floor(
      Math.random() * (endTime.valueOf() - startTime.valueOf() + 1) + startTime.valueOf()
    ),
    value: Math.floor(Math.random() * 10) + 70,
    min: value - Math.floor(Math.random() * 10 + 1),
    max: value + Math.floor(Math.random() * 10 + 1),
    highlighted: Math.random() < 0.1,
    lastSync: randomDate(new Date(2022, 6, 1), new Date()).valueOf(),
    color: name === 'female' ? 'secondaryTurquoise' : ('secondaryBlue' as SpecColorType),
  };
});

export default {
  showArea: true,
} as ComponentMeta<typeof LineChart>;

const Template: ComponentStory<typeof LineChart> = (args) => (
  <TooltipProvider>
    <LineChart {...args} />
    <TooltipsList />
  </TooltipProvider>
);

const TemplateWithResponsiveContainer: ComponentStory<typeof LineChart> = (args) => (
  <ResponsiveContainer>
    <Template {...args} />
  </ResponsiveContainer>
);

export const BasicChart = Template.bind({});
BasicChart.args = {
  showTrendLines: true,
  data: mockData,
  width: 900,
  height: 300,
  xDomain: [startTime.valueOf(), endTime.valueOf()],
};

export const WithResponsiveContainer = TemplateWithResponsiveContainer.bind({});
WithResponsiveContainer.args = {
  showTrendLines: false,
  data: mockData,
  height: 300,
  xDomain: [startTime.valueOf(), endTime.valueOf()],
};
