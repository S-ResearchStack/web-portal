import { createContext, useContext } from 'react';

import { ITooltipContext } from './types';

const defaultContextValue: ITooltipContext = {
  tooltipsMap: {},
  create: () => '',
  destroy: () => {},
  setProps: () => {},
  getProps: () => undefined,
};

const TooltipContext = createContext<ITooltipContext>(defaultContextValue);

export const useTooltipCtx = (): ITooltipContext => useContext<ITooltipContext>(TooltipContext);

export default TooltipContext;
