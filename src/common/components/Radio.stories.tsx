import React, { useState } from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import styled from 'styled-components';

import { SpecColorType } from 'src/styles/theme';

import Radio from './Radio';

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

export default {
  component: Radio,
} as ComponentMeta<typeof Radio>;

const radios = [
  null,
  'Single Line',
  <>
    Contains 1 upper case, 1 lower case, 1 number, and <br />1 special character
  </>,
];

const colored: SpecColorType[] = [
  'secondaryViolet',
  'secondaryTangerine',
  'secondarySkyBlue',
  'secondaryGreen',
  'secondaryRed',
  'statusSuccess',
  'statusWarning',
  'statusError',
];

const Template: ComponentStory<typeof Radio> = (args) => {
  const [id, setId] = useState(0);
  const [id2, setId2] = useState(0);

  return (
    <Container>
      {radios.map((children, idx) => (
        <Radio checked={id === idx} value={idx} onChange={() => setId(idx)} {...args}>
          {children}
        </Radio>
      ))}
      <br />
      <br />
      {colored.map((color, idx) => (
        <Radio
          checked={id2 === idx}
          color={color}
          value={idx}
          onChange={() => setId2(idx)}
          {...args}
        >
          {color}
        </Radio>
      ))}
    </Container>
  );
};

export const TestRadio = Template.bind({});
TestRadio.args = {
  kind: 'radio',
  disabled: false,
};
