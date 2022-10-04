import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import InputField from 'src/common/components/InputField';

export default {
  component: InputField,
} as ComponentMeta<typeof InputField>;

const Template: ComponentStory<typeof InputField> = (args) => <InputField {...args} />;

export const Email = Template.bind({});

Email.args = {
  type: 'email',
  label: 'Text Field Label',
  helperText: 'Description goes here',
  placeholder: 'Placeholder',
};
