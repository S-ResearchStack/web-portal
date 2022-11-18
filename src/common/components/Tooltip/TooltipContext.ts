import { createContext, useContext } from 'react';

import { ITooltipItemContext, ITooltipListContext } from './types';

const defaultContextValue: ITooltipListContext = {
  tooltipsMap: {},
};

const defaultTooltipContextValue: ITooltipItemContext = {
  create: () => '',
  destroy: () => {},
  setProps: () => {},
  getProps: () => undefined,
  subscribe: () => () => {},
};

export const TooltipListContext = createContext<ITooltipListContext>(defaultContextValue);
export const TooltipItemContext = createContext<ITooltipItemContext>(defaultTooltipContextValue);

export const useTooltipListCtx = (): ITooltipListContext =>
  useContext<ITooltipListContext>(TooltipListContext);
export const useTooltipItemCtx = (): ITooltipItemContext =>
  useContext<ITooltipItemContext>(TooltipItemContext);
