import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import _range from 'lodash/range';
import { DateTime } from 'luxon';

import { SpecColorType } from 'src/styles/theme';
import { TooltipProvider, TooltipsList } from 'src/common/components/Tooltip';
import Random from 'src/common/Random';
import ResponsiveContainer from '../../common/components/ResponsiveContainer';
import LineChart from './LineChart';

const startTime = DateTime.utc()
  .minus({ days: 1 })
  .set({ hour: 6, minute: 0, second: 0, millisecond: 0 });
const endTime = startTime.plus({ days: 1 });

const mockData = _range(200).map(() => {
  const value = Random.shared.int(10, 70);
  const name = Random.shared.arrayElement(['male', 'female']);

  return {
    name,
    ts: Random.shared.int(startTime.valueOf(), endTime.valueOf()),
    value,
    min: Random.shared.int(value - 10, value),
    max: Random.shared.int(value, value + 10),
    highlighted: Random.shared.num() < 0.1,
    lastSync: Random.shared.date(new Date(2022, 6, 1), Date.now()).valueOf(),
    color: name === 'female' ? 'secondaryViolet' : ('secondarySkyBlue' as SpecColorType),
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
