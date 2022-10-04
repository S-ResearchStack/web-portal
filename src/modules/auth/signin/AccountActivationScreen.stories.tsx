import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import { getStoreDecorator } from 'src/modules/store/storybook';
import AccountActivationScreen from './AccountActivationScreen';

export default {
  component: AccountActivationScreen,
  decorators: [getStoreDecorator({})],
} as ComponentMeta<typeof AccountActivationScreen>;

const Template: ComponentStory<typeof AccountActivationScreen> = () => <AccountActivationScreen />;

export const AccountActivationScreenTest = Template.bind({});
