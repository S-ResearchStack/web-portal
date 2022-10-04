import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import Modal from 'src/common/components/Modal';
import Button from 'src/common/components/Button';
import styled from 'styled-components';

export default {
  component: Modal,
} as ComponentMeta<typeof Modal>;

const Template: ComponentStory<typeof Modal> = (args) => <Modal {...args} />;

export const Confirm = Template.bind({});

Confirm.args = {
  open: true,
  title: 'Enable Access',
  description: [
    'Are you sure you want to enable the member access?',
    <br />,
    'By doing this, they gain access to the data of this study again.',
  ],
  acceptLabel: 'Enable Access',
  declineLabel: 'Cancel',
  onAccept: () => {},
  onDecline: () => {},
  onEntered: () => {},
  onExited: () => {},
};

export const ConfirmWithCustomActions = Template.bind({});

const CustomCancelButton = styled(Button)`
  :hover:enabled {
    color: red;
  }
`;

const CustomOtherButton = styled(CustomCancelButton)`
  color: red;
`;

ConfirmWithCustomActions.args = {
  open: true,
  title: 'Enable Access',
  description: [
    'Are you sure you want to enable the member access?',
    <br />,
    'By doing this, they gain access to the data of this study again.',
  ],
  declineLabel: 'Cancel',
  acceptLabel: 'Accept',
  declineComponent: CustomCancelButton,
  children: (
    <CustomOtherButton color="primary" fill="text">
      Remove
    </CustomOtherButton>
  ),
  onEntered: () => {},
  onExited: () => {},
};
