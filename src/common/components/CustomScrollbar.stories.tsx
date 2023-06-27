import React from 'react';
import styled from 'styled-components';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import _range from 'lodash/range';

import { colors, px } from 'src/styles';

import CustomScrollbar from './CustomScrollbar';

export default {
  component: CustomScrollbar,
} as ComponentMeta<typeof CustomScrollbar>;

export const MaxHeightContainer = styled(CustomScrollbar)`
  overflow: auto;
  max-height: ${px(500)};
  border: ${px(1)} solid ${colors.primary};
`;

const Row = styled.div`
  height: ${px(50)};
`;

const Template: ComponentStory<typeof CustomScrollbar> = (args) => (
  <MaxHeightContainer {...args}>
    {_range(20).map((idx) => (
      <Row key={idx} />
    ))}
  </MaxHeightContainer>
);

export const CustomScrollbarDefault = Template.bind({});

CustomScrollbarDefault.args = {
  scrollbarOffsetRight: 8,
  scrollbarTrackColor: 'white',
  scrollbarThumbColor: 'red',
};
