import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import Indicator from './Indicator';

export default {
  component: Indicator,
} as ComponentMeta<typeof Indicator>;

const Template: ComponentStory<typeof Indicator> = (args) => <Indicator {...args} />;

export const TestIndicator = Template.bind({});
TestIndicator.args = {
  color: 'error',
};
