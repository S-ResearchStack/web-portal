import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import { getStoreDecorator } from 'src/modules/store/storybook';
import CreateStudyScreen from './CreateStudyScreen';

export default {
  component: CreateStudyScreen,
  decorators: [getStoreDecorator({})],
} as ComponentMeta<typeof CreateStudyScreen>;

const Template: ComponentStory<typeof CreateStudyScreen> = (args) => (
  <CreateStudyScreen {...args} />
);

export const CreateStudyScreenTest = Template.bind({});
