import React, { FC, useCallback, useMemo, useRef, useState } from 'react';
import _uniqueId from 'lodash/uniqueId';
import _throttle from 'lodash/throttle';
import useUnmount from 'react-use/lib/useUnmount';
import useEvent from 'react-use/lib/useEvent';

import { TooltipID, TooltipProps } from './types';
import TooltipContext from './TooltipContext';

interface TooltipProviderState {
  tooltipsMap: Record<TooltipID, TooltipProps>;
}

const TooltipProvider: FC<React.PropsWithChildren<object>> = ({ children }) => {
  const lastPointRef = useRef<Record<TooltipID, [number, number]>>({});

  const stateRef = useRef<TooltipProviderState>({
    tooltipsMap: {},
  });

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state, setStateAndSetStateRef]
  );

  const destroy = useCallback(
    (tooltipId: TooltipID) => {
      const tooltipsMap = { ...stateRef.current.tooltipsMap };

      delete tooltipsMap[tooltipId];

      setStateAndSetStateRef({ tooltipsMap });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state, setStateAndSetStateRef]
  );

  const setProps = useCallback(
    (tooltipId: TooltipID, props: Partial<Omit<TooltipProps, 'id'>>) => {
      const tooltipsMap = { ...stateRef.current.tooltipsMap };

      tooltipsMap[tooltipId] = { ...tooltipsMap[tooltipId], ...props };

      setStateAndSetStateRef({ tooltipsMap });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state, setStateAndSetStateRef]
  );

  const getProps = useCallback(
    (tooltipId: TooltipID): TooltipProps => stateRef.current.tooltipsMap[tooltipId],
    []
  );

  const handleCheckTriggerPosition = useMemo(
    () =>
      _throttle(() => {
        for (const tooltipId in stateRef.current.tooltipsMap) {
          if ({}.hasOwnProperty.call(stateRef.current.tooltipsMap, tooltipId)) {
            const tooltip = stateRef.current.tooltipsMap[tooltipId];

            if (tooltip.container && tooltip.show && tooltip.dynamic) {
              const { top, left } = tooltip.container.getBoundingClientRect();
              const lastPoint = lastPointRef.current[tooltipId];

              if (!lastPoint || lastPoint[0] !== left || lastPoint[1] !== top) {
                setProps(tooltipId, { show: false });
                // lastPointRef.current[tooltipId] = [left, top]; // TODO clarify what is it and why do we need it
                // setProps(tooltipId, { container: tooltip.container });
              }
            }
          }
        }
      }, 10),
    [setProps]
  );

  useUnmount(() => handleCheckTriggerPosition.cancel());

  useEvent('scroll', handleCheckTriggerPosition, document, true);
  useEvent('resize', handleCheckTriggerPosition);

  const value = useMemo(
    () => ({ create, destroy, setProps, getProps, tooltipsMap: state.tooltipsMap }),
    [create, state, destroy, setProps, getProps]
  );

  return <TooltipContext.Provider value={value}>{children}</TooltipContext.Provider>;
};

export default TooltipProvider;
