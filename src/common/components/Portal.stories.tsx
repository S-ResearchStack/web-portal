import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import styled from 'styled-components';

import Card from './Card';
import Portal from './Portal';

const PortalChild = styled(Card)`
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 100px;
  left: 100px;
  right: 100px;
`;

export default {
  component: Portal,
} as ComponentMeta<typeof Portal>;

const Template: ComponentStory<typeof Portal> = (args) => <Portal {...args} />;

export const DefaultPortal = Template.bind({});

DefaultPortal.args = {
  enabled: true,
  children: <PortalChild>Portal works</PortalChild>,
};
