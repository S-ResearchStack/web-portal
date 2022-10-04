import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import Drawer from './Drawer';

export default {
  component: Drawer,
} as ComponentMeta<typeof Drawer>;

const Template: ComponentStory<typeof Drawer> = (args) => <Drawer {...args} />;

export const DefaultDrawer = Template.bind({});

DefaultDrawer.args = {
  open: true,
};
