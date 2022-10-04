import React, { useState } from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import Tabs from 'src/common/components/Tabs';

export default {
  component: Tabs,
} as ComponentMeta<typeof Tabs>;

const Template: ComponentStory<typeof Tabs> = (args) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const tabs = ['Survey Responses', 'Survey Analytics'];

  return <Tabs {...args} items={tabs} activeItemIdx={activeIndex} onTabChange={setActiveIndex} />;
};

export const DefaultTabs = Template.bind({});
DefaultTabs.args = {
  items: ['Survey Responses', 'Survey Analytics'],
};
