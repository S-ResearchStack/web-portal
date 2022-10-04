import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import { getStoreDecorator } from 'src/modules/store/storybook';
import ScreenCenteredCard from './ScreenCenteredCard';

export default {
  component: ScreenCenteredCard,
  decorators: [getStoreDecorator({})],
} as ComponentMeta<typeof ScreenCenteredCard>;

const Template: ComponentStory<typeof ScreenCenteredCard> = (args) => (
  <ScreenCenteredCard {...args} />
);

export const ScreenCenteredCardTest = Template.bind({});
ScreenCenteredCardTest.args = {
  width: 50,
  minWidth: 300,
  ratio: 0.8,
  children: <div style={{ margin: 'auto' }}>CONTENT</div>,
};
