import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import styled from 'styled-components';

import { px } from 'src/styles';
import PlusIcon from 'src/assets/icons/plus.svg';
import Button from 'src/common/components/Button';
import CollapseSection from './CollapseSection';

export default {
  component: CollapseSection,
} as ComponentMeta<typeof CollapseSection>;

const Template: ComponentStory<typeof CollapseSection> = (args) => <CollapseSection {...args} />;

const Container = styled.div``;
const TemplateMultiple: ComponentStory<typeof CollapseSection> = (args) => (
  <Container>
    <CollapseSection {...args} />
    <CollapseSection {...args} />
    <CollapseSection {...args} />
  </Container>
);

const Body = styled.div`
  height: ${px(500)};
  background-color: gray;
`;

export const Default = Template.bind({});
Default.args = {
  title: 'Title',
  children: <Body />,
};

export const DefaultDisabled = Template.bind({});
DefaultDisabled.args = {
  title: 'Title',
  disabled: true,
  children: <Body />,
};

export const WithExtra = Template.bind({});
WithExtra.args = {
  title: 'Extra',
  children: <Body />,
  headerExtra: <Button icon={<PlusIcon />} fill="solid" style={{ width: 200 }} />,
};

export const Multiple = TemplateMultiple.bind({});
Multiple.args = {
  title: 'Title',
  children: <Body />,
};
