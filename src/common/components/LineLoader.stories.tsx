import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import LineLoader from 'src/common/components/LineLoader';

export default {
  component: LineLoader,
} as ComponentMeta<typeof LineLoader>;

const Template: ComponentStory<typeof LineLoader> = () => <LineLoader />;

export const Default = Template.bind({});
