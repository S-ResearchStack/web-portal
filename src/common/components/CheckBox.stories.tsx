import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import useToggle from 'react-use/lib/useToggle';
import styled from 'styled-components';

import CheckBox from './CheckBox';

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

export default {
  component: CheckBox,
} as ComponentMeta<typeof CheckBox>;

const Template: ComponentStory<typeof CheckBox> = (args) => {
  const [checked0, setChecked0] = useToggle(true);
  const [checked1, setChecked1] = useToggle(false);
  const [checked2, setChecked2] = useToggle(false);

  return (
    <Container>
      <CheckBox checked={checked0} onChange={() => setChecked0()} {...args} />
      <CheckBox checked={checked1} onChange={() => setChecked1()} {...args}>
        Single line
      </CheckBox>
      <CheckBox checked={checked2} onChange={() => setChecked2()} {...args}>
        Contains 1 upper case, 1 lower case, 1 number, and <br />1 special character
      </CheckBox>
    </Container>
  );
};

export const TwoStringsText = Template.bind({});
TwoStringsText.args = {
  disabled: false,
};
