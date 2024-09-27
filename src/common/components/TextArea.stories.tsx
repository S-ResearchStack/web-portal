import React, { useState } from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import styled from 'styled-components';

import TextArea from './TextArea';

export default {
  component: TextArea,
} as ComponentMeta<typeof TextArea>;

const TextAreaWithMaxHeight = styled(TextArea)`
  max-height: 300px;
`;

const Template: ComponentStory<typeof TextArea> = (args) => {
  const [value, setValue] = useState('');

  return (
    <TextAreaWithMaxHeight
      {...args}
      placeholder="Enter multiline text..."
      value={value}
      onChange={(evt) => setValue(evt.target.value)}
    />
  );
};

export const DefaultTextArea = Template.bind({});

DefaultTextArea.args = {
  disabled: false,
};
