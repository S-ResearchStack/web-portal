import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import styled from 'styled-components';

import Card from './Card';
import BackdropOverlay from './BackdropOverlay';

const CentredBackdropOverlay = styled(BackdropOverlay)`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export default {
  component: CentredBackdropOverlay,
} as ComponentMeta<typeof CentredBackdropOverlay>;

const Template: ComponentStory<typeof CentredBackdropOverlay> = (args) => (
  <CentredBackdropOverlay {...args} />
);

export const DefaultBackdropOverlay = Template.bind({});

DefaultBackdropOverlay.args = {
  open: true,
  closeOnClick: true,
  /* eslint-disable no-restricted-syntax */
  onOpen: () => console.log('onOpen'),
  onClose: () => console.log('onClose'),
  onRequestClose: () => console.log('onRequestClose'),
  /* eslint-enable */
  children: <Card>Hello world!</Card>,
};
