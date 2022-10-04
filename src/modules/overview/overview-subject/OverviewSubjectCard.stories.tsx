import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import { getStoreDecorator } from 'src/modules/store/storybook';
import OverviewSubject from './OverviewSubject';

export default {
  component: OverviewSubject,
  decorators: [getStoreDecorator({})],
} as ComponentMeta<typeof OverviewSubject>;

const Template: ComponentStory<typeof OverviewSubject> = () => <OverviewSubject />;

export const OverviewSubjectTest = Template.bind({});
