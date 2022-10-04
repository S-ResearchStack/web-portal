import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import _sumBy from 'lodash/sumBy';

import { SpecColorType } from 'src/styles/theme';
import DonutChart from './DonutChart';

export default {
  component: DonutChart,
} as ComponentMeta<typeof DonutChart>;

const Template: ComponentStory<typeof DonutChart> = (args) => <DonutChart {...args} />;

const data = [
  {
    value: 33,
    color: 'secondaryTurquoise' as SpecColorType,
    name: 'male',
    count: 20,
    total: 120,
  },
  {
    value: 27,
    color: 'secondaryBlue' as SpecColorType,
    name: 'female',
    count: 50,
    total: 120,
  },
];

export const Default = Template.bind({});
Default.args = {
  data,
  totalPercents: _sumBy(data, (d) => d.value),
  width: 260,
  height: 260,
};

function fillRemainingData(d: typeof data) {
  const total = _sumBy(d, (v) => v.value);
  const remaining = 100 - total;

  return [
    ...d,
    ...(remaining > 0
      ? [
          {
            value: remaining,
            color: 'disabled' as SpecColorType,
            name: 'disabled',
            count: 0,
            total: 0,
          },
        ]
      : []),
  ];
}

export const FillRemaining = Template.bind({});
FillRemaining.args = {
  data: fillRemainingData(data),
  totalPercents: _sumBy(data, (d) => d.value),
  width: 260,
  height: 260,
};
