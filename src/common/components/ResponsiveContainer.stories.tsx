import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import BarChart from '../../modules/charts/BarChart';
import ResponsiveContainer from './ResponsiveContainer';

export default {
  isHorizontal: false,
} as ComponentMeta<typeof ResponsiveContainer>;

type ChildProps = {
  width?: number;
};

const Child = ({ width }: ChildProps) => <div>{`Container width: ${width}`}</div>;

const Template: ComponentStory<typeof ResponsiveContainer> = () => (
  <ResponsiveContainer>
    <Child />
  </ResponsiveContainer>
);

const TemplateWithHeight: ComponentStory<typeof ResponsiveContainer> = () => (
  <ResponsiveContainer provideHeight>
    {({ width, height }) => <div>{`Container width ${width} height ${height}`}</div>}
  </ResponsiveContainer>
);

const data = [
  { name: 'Q1', value: 23, totalValue: 100 },
  { name: 'Q2', value: 38, totalValue: 100 },
  { name: 'Q3', value: 16, totalValue: 100 },
  { name: 'Q4', value: 56, totalValue: 100 },
  { name: 'Q5', value: 84, totalValue: 100 },
];

const TemplateWithChart: ComponentStory<typeof ResponsiveContainer> = () => (
  <ResponsiveContainer>
    <BarChart data={data} width={500} height={500} />
  </ResponsiveContainer>
);

export const BasicTemplate = Template.bind({});
export const BasicTemplateWithHeight = TemplateWithHeight.bind({});
export const WithChart = TemplateWithChart.bind({});
