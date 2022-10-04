import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import Card from './Card';

export default {
  component: Card,
} as ComponentMeta<typeof Card>;

const Template: ComponentStory<typeof Card> = (args) => <Card {...args} />;

export const CardDefault = Template.bind({});

CardDefault.args = {
  children: 'Content',
  title: 'Roboto 18px Bold',
  action: 'Card actions',
};
