import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import Spinner from 'src/common/components/Spinner';

export default {
  component: Spinner,
} as ComponentMeta<typeof Spinner>;

const Template: ComponentStory<typeof Spinner> = (args) => <Spinner {...args} />;

export const Default = Template.bind({});

Default.args = {
  spin: true,
  size: 'l',
};
