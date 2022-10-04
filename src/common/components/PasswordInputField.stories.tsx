import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import PasswordInputField from 'src/common/components/PasswordInputField';

export default {
  component: PasswordInputField,
} as ComponentMeta<typeof PasswordInputField>;

const Template: ComponentStory<typeof PasswordInputField> = (args) => (
  <PasswordInputField {...args} />
);

export const Password = Template.bind({});
Password.args = {
  label: 'Password input field',
  helperText: 'no validated',
};
