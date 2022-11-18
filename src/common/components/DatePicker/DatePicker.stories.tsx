import React, { useState } from 'react';
import { DateTime } from 'luxon';
import styled from 'styled-components';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import { px } from 'src/styles';
import DatePicker from '.';

export default {
  component: DatePicker,
  argTypes: {
    min: { control: 'date' },
    max: { control: 'date' },
    disabled: { control: 'boolean' },
  },
} as ComponentMeta<typeof DatePicker>;

const Container = styled.div`
  overflow-y: scroll;
  height: ${px(500)};
`;

const Content = styled.div`
  padding: ${px(10)};
  height: ${px(1000)};
`;

const Template: ComponentStory<typeof DatePicker> = ({ min, max, ...rest }) => {
  const [value, setValue] = useState<Date>();
  return (
    <Container>
      <Content>
        <DatePicker
          {...rest}
          value={value}
          onChange={setValue}
          min={min && new Date(min)}
          max={max && new Date(max)}
        />
      </Content>
    </Container>
  );
};

export const Default = Template.bind({});

export const WithAllowedDates = Template.bind({});
WithAllowedDates.args = {
  min: DateTime.local().minus({ days: 7 }).toJSDate(),
  max: DateTime.local().plus({ days: 30 }).toJSDate(),
};

export const WithPortal = Template.bind({});
WithPortal.args = {
  portal: true,
};
