import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import { getStoreDecorator } from 'src/modules/store/storybook';
import Sidebar from './Sidebar';

export default {
  component: Sidebar,
  decorators: [
    getStoreDecorator({
      studies: {
        studies: [
          {
            id: 'test',
            name: 'Study Name',
            color: 'secondarySkyBlue',
            createdAt: 1652648400000,
          },
        ],
        selectedStudyId: 'test',
        isLoading: false,
      },
    }),
  ],
} as ComponentMeta<typeof Sidebar>;

const Template: ComponentStory<typeof Sidebar> = () => <Sidebar onStudyClick={() => {}} />;

export const Minimized = Template.bind({});
