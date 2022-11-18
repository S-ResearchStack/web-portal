import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import edit from 'src/assets/icons/edit.svg';
import visibility from 'src/assets/icons/visibility.svg';
import zoomInIcon from 'src/assets/icons/zoom_in.svg';
import IconButton from './IconButton';

export default {
  component: IconButton,
} as ComponentMeta<typeof IconButton>;

const Template: ComponentStory<typeof IconButton> = (args) => <IconButton {...args} />;

export const SizeS = Template.bind({});
SizeS.args = {
  icon: edit,
  color: 'textSecondaryGray',
};

export const SizeM = Template.bind({});
SizeM.args = {
  icon: visibility,
  color: 'textSecondaryGray',
};

export const SizeL = Template.bind({});
SizeL.args = {
  icon: zoomInIcon,
  color: 'textSecondaryGray',
};
