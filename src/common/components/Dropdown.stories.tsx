import React, { useState } from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import styled from 'styled-components';

import { px } from 'src/styles';
import RadioIcon from 'src/assets/icons/radio_checked.svg';
import CheckboxIcon from 'src/assets/icons/checkbox_checked.svg';
import SliderIcon from 'src/assets/icons/slider.svg';
import CalendarIcon from 'src/assets/icons/calendar.svg';

import Dropdown from './Dropdown';

const Layout = styled.div`
  display: flex;
  gap: ${px(56)};
`;

const DropdownWrapper = styled.div`
  width: ${px(200)};
  height: ${px(150)};
`;

export default {
  component: Dropdown,
} as ComponentMeta<typeof Dropdown>;

const Template: ComponentStory<typeof Dropdown> = () => {
  const [activeDropdownKey, setActiveDropdownKey] = useState('vertical');
  const [activeDropdownWithIconKey, setActiveDropdownWithIconKey] = useState(0);

  return (
    <Layout>
      <DropdownWrapper>
        <Dropdown
          items={[
            { label: 'Vertical', key: 'vertical' },
            { label: 'Horizontal', key: 'horizontal' },
            { label: 'Third Option', key: '3rd' },
            { label: 'Fourth Option', key: '4th' },
          ]}
          activeKey={activeDropdownKey}
          onChange={setActiveDropdownKey}
        />
      </DropdownWrapper>
      <DropdownWrapper>
        <Dropdown
          items={[
            { label: 'Single-selection', key: 0, icon: <RadioIcon /> },
            { label: 'Multi-selection', key: 1, icon: <CheckboxIcon /> },
            { label: 'Slider scale', key: 2, icon: <SliderIcon /> },
            { label: 'Date & Time', key: 4, icon: <CalendarIcon /> },
          ]}
          activeKey={activeDropdownWithIconKey}
          onChange={setActiveDropdownWithIconKey}
          loading
        />
      </DropdownWrapper>
    </Layout>
  );
};

export const TestDropdown = Template.bind({});
