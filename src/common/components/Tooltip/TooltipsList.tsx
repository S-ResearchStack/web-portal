import React, { FC } from 'react';

import Portal from 'src/common/components/Portal';

import { useTooltipCtx } from './TooltipContext';
import TooltipItem from './TooltipItem';

const TooltipsList: FC = () => {
  const tooltipCtx = useTooltipCtx();
  const tooltips: React.ReactNode[] = [];

  for (const tooltipId in tooltipCtx.tooltipsMap) {
    if ({}.hasOwnProperty.call(tooltipCtx.tooltipsMap, tooltipId)) {
      const item = tooltipCtx.tooltipsMap[tooltipId];

      if (item.show) {
        tooltips.push(<TooltipItem {...item} key={item.id} />);
      }
    }
  }

  return (
    <Portal id="tooltip-portal" enabled={!!tooltips.length}>
      {tooltips}
    </Portal>
  );
};

export default TooltipsList;
