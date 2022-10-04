import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import Button from 'src/common/components/Button';
import ServiceScreen from './ServiceScreen';

export default {
  component: ServiceScreen,
} as ComponentMeta<typeof ServiceScreen>;

const Template: ComponentStory<typeof ServiceScreen> = (args) => <ServiceScreen {...args} />;

export const DefaultServiceScreen = Template.bind({});

DefaultServiceScreen.args = {
  type: 'error',
  children: <Button fill="solid">Reload</Button>,
};
