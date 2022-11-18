import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import Pagination from 'src/common/components/Pagination';

export default {
  component: Pagination,
} as ComponentMeta<typeof Pagination>;

const Template: ComponentStory<typeof Pagination> = (args) => <Pagination {...args} />;

export const PaginationDefault = Template.bind({});
PaginationDefault.args = {
  totalCount: 1000,
  pageSize: 10,
  offset: 0,
};
