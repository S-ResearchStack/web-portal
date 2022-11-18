import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import SkeletonLoading, { SkeletonRect } from 'src/common/components/SkeletonLoading';
import styled from 'styled-components';
import { px } from 'src/styles';

export default {
  component: SkeletonLoading,
} as ComponentMeta<typeof SkeletonLoading>;

const Block = styled.div`
  margin: ${px(100)};
`;

const Template: ComponentStory<typeof SkeletonLoading> = (args) => (
  <div style={{ overflow: 'scroll' }}>
    <Block>
      <SkeletonLoading {...args}>
        <SkeletonRect x="0" y="0" rx="4" width="180" height="24" />
        <SkeletonRect x="0" y="48" rx="4" width="132" height="56" />
      </SkeletonLoading>
    </Block>
    <Block>
      <SkeletonLoading {...args}>
        <SkeletonRect x="0" y="0" width="240" height="24" />
        <SkeletonRect x="0" y="456" width="360" height="24" />
      </SkeletonLoading>
    </Block>
  </div>
);

export const Default = Template.bind({});

Default.args = {};
