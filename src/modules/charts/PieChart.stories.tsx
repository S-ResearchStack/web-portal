import React, { ComponentProps } from 'react';
import { ComponentMeta, Story } from '@storybook/react';

import { SpecColorType } from 'src/styles/theme';
import { TooltipProvider, TooltipsList } from 'src/common/components/Tooltip';
import PieChart from './PieChart';

export default {
  component: PieChart,
} as ComponentMeta<typeof PieChart>;

const Template: Story<ComponentProps<typeof PieChart> & { size?: number }> = ({
  size,
  width,
  height,
  ...props
}) => (
  <TooltipProvider>
    <PieChart width={size || width} height={size || height} {...props} />
    <TooltipsList />
  </TooltipProvider>
);

const dataTwoItems = [
  {
    value: 33,
    color: 'secondaryViolet' as SpecColorType,
    name: 'Yes',
    count: 30,
    total: 120,
  },
  {
    value: 27,
    color: 'secondarySkyBlue' as SpecColorType,
    name: 'No',
    count: 20,
    total: 120,
  },
];

const dataFourItems = [
  {
    value: 14,
    color: 'secondaryViolet' as SpecColorType,
    name: '20-39',
    count: 41,
    total: 120,
  },
  {
    value: 27,
    color: 'secondarySkyBlue' as SpecColorType,
    name: '40-59',
    count: 32,
    total: 120,
  },
  {
    value: 34,
    color: 'secondaryGreen' as SpecColorType,
    name: '60-79',
    count: 50,
    total: 120,
  },
  {
    value: 25,
    color: 'secondaryTangerine' as SpecColorType,
    name: '80-100',
    count: 10,
    total: 120,
  },
];

export const TwoItems = Template.bind({});
TwoItems.args = {
  data: dataTwoItems,
  width: 260,
  height: 260,
};

export const FourItems = Template.bind({});
FourItems.args = {
  data: dataFourItems,
  width: 260,
  height: 260,
};

export const Responsive = Template.bind({});
Responsive.args = {
  data: dataFourItems,
  size: 260,
};

Responsive.argTypes = {
  size: {
    control: {
      type: 'range',
      min: 10,
      max: 1000,
    },
  },
};
