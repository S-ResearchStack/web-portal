import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import Toggle from 'src/common/components/Toggle';

export default {
  component: Toggle,
} as ComponentMeta<typeof Toggle>;

const Template: ComponentStory<typeof Toggle> = (args) => <Toggle {...args} />;

export const Default = Template.bind({});

Default.args = {
  disabled: false,
};
