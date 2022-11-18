import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import _random from 'lodash/random';
import styled from 'styled-components';

import Table, {
  ColumnOptions,
  RowKeyExtractor,
  SortCallback,
} from 'src/common/components/Table/index';
import { TooltipProvider, TooltipsList } from 'src/common/components/Tooltip';
import { px } from 'src/styles';

enum Status {
  ACTIVE,
  INVITED,
}

interface Row {
  id: number;
  name: string;
  email: string;
  status: Status;
}

const WrappedTable = styled(Table)`
  max-height: ${px(400)};
  height: ${px(400)};
`;

const Template: ComponentStory<typeof WrappedTable> = (args) => (
  <TooltipProvider>
    <WrappedTable {...args} />
    <TooltipsList />
  </TooltipProvider>
);

export const StaticTable = Template.bind({});

const rows: Row[] = [
  { id: 1, name: 'Jerry', email: 'jerry@example.com', status: Status.ACTIVE },
  { id: 2, name: 'Louise', email: 'louise@example.com', status: Status.ACTIVE },
  { id: 3, name: 'Cecelia', email: 'cecelia@example.com', status: Status.ACTIVE },
  { id: 4, name: 'Kendra', email: 'kendra@example.com', status: Status.INVITED },
  { id: 5, name: 'Lester', email: 'lester@example.com', status: Status.ACTIVE },
  { id: 6, name: 'Nicolas', email: 'nicolas@example.com', status: Status.ACTIVE },
  { id: 7, name: 'Adnan', email: 'adnan@example.com', status: Status.INVITED },
  { id: 8, name: 'Braxton', email: 'braxton@example.com', status: Status.ACTIVE },
  { id: 9, name: 'Mindy', email: 'mindy@example.com', status: Status.ACTIVE },
  { id: 10, name: 'Wilf', email: 'wilf@example.com', status: Status.ACTIVE },
];

const getRowKey: RowKeyExtractor<Row> = (row) => row.id;

const columns: ColumnOptions<Row>[] = [
  {
    dataKey: 'id',
    label: '#',
    $width: 70,
  },
  {
    dataKey: 'name',
    label: 'Long title with many letters',
    $width: 200,
    render: (name, row) =>
      row.status === Status.INVITED ? <span style={{ opacity: 0.6 }}>{name}</span> : name,
  },
  {
    dataKey: 'email',
    label: 'E-mail',
  },
  {
    dataKey: 'id',
    align: 'right',
    render: (id) => (
      <button
        type="button"
        onClick={() => {
          // eslint-disable-next-line no-alert
          alert(id);
        }}
      >
        alert({id})
      </button>
    ),
  },
];

StaticTable.args = {
  resizableColumns: true,
  stickyHeader: true,
  stickyFooter: true,
  getRowKey,
  columns,
  rows,
  sort: {
    column: 'name',
    direction: 'asc',
    // eslint-disable-next-line no-restricted-syntax
    onSortChange: ((sortings) => console.log(sortings)) as SortCallback<Row>,
  },
  pagination: {
    totalCount: 1000,
    initialPage: 1,
    pageSize: 10,
    onPageChange: () => {},
  },
};

export const VirtualTable = Template.bind({});

const randomRow = (): Row => rows[_random(0, rows.length - 1)];

const virtualizedRows = Array(1000)
  .fill(undefined)
  .map((_, id) => ({ ...randomRow(), id: id + 1 }));

VirtualTable.args = {
  resizableColumns: true,
  stickyHeader: true,
  virtual: true,
  getRowKey,
  columns,
  rows: virtualizedRows,
};

export default {
  component: WrappedTable,
} as ComponentMeta<typeof Table>;
