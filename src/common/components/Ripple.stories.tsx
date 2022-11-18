import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import styled from 'styled-components';
import { px } from 'src/styles';
import Ripple, { RippleTriggerProps, useRipple, UseRippleArgs } from './Ripple';

type RippleTestProps = Partial<RippleTriggerProps<HTMLDivElement>> & {
  children?: React.ReactElement;
};

const Trigger = styled.div<RippleTestProps>`
  width: ${px(256)};
  height: ${px(256)};
  border: 1px solid lightblue;
`;

export const RippleTest = (args: UseRippleArgs) => {
  const { addRippleTriggerProps, rippleProps } = useRipple<HTMLDivElement, RippleTestProps>(args);

  return (
    <Trigger {...addRippleTriggerProps()} data-testid="trigger">
      <Ripple {...rippleProps} data-testid="ripple" />
    </Trigger>
  );
};

export default {
  component: RippleTest,
} as ComponentMeta<typeof RippleTest>;

const Template: ComponentStory<typeof RippleTest> = (args) => <RippleTest {...args} />;

export const DefaultRipple = Template.bind({});

DefaultRipple.args = {
  color: 'primary',
  opacity: [1, 1],
  duration: 2000,
};
