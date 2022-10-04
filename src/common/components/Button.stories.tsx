import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import Plus from 'src/assets/icons/plus.svg';
import Button from 'src/common/components/Button';

export default {
  component: Button,
} as ComponentMeta<typeof Button>;

const Template: ComponentStory<typeof Button> = (args) => <Button {...args} />;

export const TestRippleButton = Template.bind({});
TestRippleButton.args = {
  children: 'ripple button',
  fill: 'text',
  color: 'error',
  disabled: true,
  icon: <Plus />,
  $loading: false,
};
