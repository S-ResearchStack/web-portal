import React, { FC, useCallback, useMemo, useRef, useState } from 'react';
import _uniqueId from 'lodash/uniqueId';

import { TooltipSubscribeListener, TooltipID, TooltipProps } from './types';
import { TooltipListContext, TooltipItemContext } from './TooltipContext';

interface TooltipProviderState {
  tooltipsMap: Record<TooltipID, TooltipProps>;
}

const TooltipProvider: FC<React.PropsWithChildren<object>> = ({ children }) => {
  const stateRef = useRef<TooltipProviderState>({
    tooltipsMap: {},
  });

  const changeEvents = useRef<Map<TooltipID, TooltipSubscribeListener>>(new Map());

  const [state, setState] = useState<TooltipProviderState>({
    tooltipsMap: {},
  });

  const setStateAndSetStateRef = useCallback(
    (value: TooltipProviderState) => {
      stateRef.current = value;
      setState(value);
    },
    [setState]
  );

  const create = useCallback(
    (tooltipProps: Omit<TooltipProps, 'id'>): TooltipID => {
      const tooltipsMap = { ...stateRef.current.tooltipsMap };
      const tooltipId: TooltipID = _uniqueId('tooltip-');

      tooltipsMap[tooltipId] = {
        ...tooltipProps,
        id: tooltipId,
      };

      setStateAndSetStateRef({ tooltipsMap });

      return tooltipId;
    },
    [setStateAndSetStateRef]
  );

  const destroy = useCallback(
    (tooltipId: TooltipID) => {
      const tooltipsMap = { ...stateRef.current.tooltipsMap };
      delete tooltipsMap[tooltipId];
      setStateAndSetStateRef({ tooltipsMap });
    },
    [setStateAndSetStateRef]
  );

  const setProps = useCallback(
    (tooltipId: TooltipID, props: Partial<Omit<TooltipProps, 'id'>>) => {
      const tooltipsMap = { ...stateRef.current.tooltipsMap };
      tooltipsMap[tooltipId] = { ...tooltipsMap[tooltipId], ...props };
      if (changeEvents.current.has(tooltipId)) {
        changeEvents.current.get(tooltipId)?.(tooltipsMap[tooltipId]);
      }
      setStateAndSetStateRef({ tooltipsMap });
    },
    [setStateAndSetStateRef]
  );

  const getProps = useCallback(
    (tooltipId: TooltipID): TooltipProps => stateRef.current.tooltipsMap[tooltipId],
    []
  );

  const subscribe = useCallback((tooltipId: TooltipID, cb: (tooltip: TooltipProps) => void) => {
    changeEvents.current.set(tooltipId, cb);
    return () => changeEvents.current.delete(tooltipId);
  }, []);

  const tooltipItemCtxValue = useMemo(
    () => ({ create, destroy, setProps, getProps, subscribe }),
    [create, destroy, getProps, setProps, subscribe]
  );

  return (
    <TooltipListContext.Provider value={state}>
      <TooltipItemContext.Provider value={tooltipItemCtxValue}>
        {children}
      </TooltipItemContext.Provider>
    </TooltipListContext.Provider>
  );
};

export default TooltipProvider;
