import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import StudyAvatar from './StudyAvatar';

export default {
  component: StudyAvatar,
} as ComponentMeta<typeof StudyAvatar>;

const Template: ComponentStory<typeof StudyAvatar> = (args) => (
  <div style={{ width: 'fit-content' }}>
    <StudyAvatar {...args} />
  </div>
);

export const TestStudyAvatar = Template.bind({});
TestStudyAvatar.args = {
  color: 'onPrimary',
};
