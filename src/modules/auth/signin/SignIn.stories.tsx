import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import { getStoreDecorator } from 'src/modules/store/storybook';
import SignInScreen from './SignIn';

export default {
  minimized: false,
  component: SignInScreen,
  decorators: [getStoreDecorator({})],
} as ComponentMeta<typeof SignInScreen>;

const Template: ComponentStory<typeof SignInScreen> = (args) => <SignInScreen {...args} />;

export const SignIn = Template.bind({});
