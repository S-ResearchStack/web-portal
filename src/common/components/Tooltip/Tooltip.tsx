import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import styled from 'styled-components';
import _debounce from 'lodash/debounce';
import _isEqual from 'lodash/isEqual';
import usePrevious from 'react-use/lib/usePrevious';

import {
  ITooltipContext,
  Point,
  TooltipControls,
  TooltipID,
  TooltipPosition,
  TooltipProps,
} from './types';
import { useTooltipCtx } from './TooltipContext';

const DEFAULT_SET_TOOLTIP_PROPS_DELAY = 50;

const TooltipTrigger = styled.span`
  display: inline-block;
`;

type TooltipComponentProps = React.PropsWithChildren<Omit<TooltipProps, 'id'>>;

const Tooltip = forwardRef(
  ({ children, ...props }: TooltipComponentProps, ref: React.ForwardedRef<TooltipControls>) => {
    const tooltipIdRef = useRef<TooltipID>();
    const containerRef = useRef<HTMLSpanElement>(null);
    const tooltipCtx: ITooltipContext = useTooltipCtx();

    const prevProps = usePrevious(props);

    useEffect(() => {
      if (containerRef.current) {
        tooltipIdRef.current = tooltipCtx.create({
          container: containerRef.current,
          ...props,
        });
      }

      return () => {
        if (tooltipIdRef.current) {
          tooltipCtx.destroy(tooltipIdRef.current);
        }
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
      if (containerRef.current && tooltipIdRef.current && !_isEqual(prevProps, props)) {
        tooltipCtx.setProps(tooltipIdRef.current, {
          container: containerRef.current,
          ...props,
        });
      }
    }, [tooltipCtx, prevProps, props, tooltipIdRef]);

    useEffect(() => {
      if (prevProps?.show !== props.show) {
        if (props.show) {
          props.onShow?.();
        } else {
          props.onHide?.();
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.show]);

    const initRef = useCallback(
      (): TooltipControls => ({
        setPoint(point: Point) {
          if (tooltipIdRef.current) {
            tooltipCtx.setProps(tooltipIdRef.current, { point });
          }
          return this;
        },
        setContent(content: React.ReactNode) {
          if (tooltipIdRef.current) {
            tooltipCtx.setProps(tooltipIdRef.current, { content });
          }
          return this;
        },
        setContainer(container?: HTMLElement) {
          if (tooltipIdRef.current && container) {
            tooltipCtx.setProps(tooltipIdRef.current, { container });
          }
          return this;
        },
        getContainer(): HTMLElement | undefined {
          if (tooltipIdRef.current) {
            return tooltipCtx.getProps(tooltipIdRef.current)?.container;
          }
          return undefined;
        },
        getTooltip(): HTMLElement | undefined {
          if (tooltipIdRef.current) {
            return document.getElementById(tooltipIdRef.current) || undefined;
          }
          return undefined;
        },
        setArrow(arrow: boolean) {
          if (tooltipIdRef.current) {
            tooltipCtx.setProps(tooltipIdRef.current, { arrow });
          }
          return this;
        },
        setPosition(position: TooltipPosition) {
          if (tooltipIdRef.current) {
            tooltipCtx.setProps(tooltipIdRef.current, { position });
          }
          return this;
        },
        show() {
          if (tooltipIdRef.current) {
            tooltipCtx.setProps(tooltipIdRef.current, { show: true });
          }
          return this;
        },
        hide() {
          if (tooltipIdRef.current) {
            tooltipCtx.setProps(tooltipIdRef.current, { show: false });
          }
          return this;
        },
        destroy() {
          if (tooltipIdRef.current) {
            tooltipCtx.destroy(tooltipIdRef.current);
          }
        },
      }),
      [tooltipCtx]
    );

    useImperativeHandle(ref, initRef);

    const setTooltipPropsDelayed = useMemo(
      () =>
        _debounce((tooltipId: TooltipID, tooltipProps: Partial<Omit<TooltipProps, 'id'>>) => {
          tooltipCtx.setProps(tooltipId, tooltipProps);
        }, props.delay || DEFAULT_SET_TOOLTIP_PROPS_DELAY),
      [props.delay, tooltipCtx]
    );

    const evtProps = useMemo(() => {
      const triggersProps: Partial<React.HTMLAttributes<HTMLElement>> = {};

      if (props.trigger) {
        const triggers = !Array.isArray(props.trigger) ? [props.trigger] : props.trigger;

        triggers.forEach((evtType) => {
          switch (evtType) {
            case 'click':
              triggersProps.onClick = () => {
                if (tooltipIdRef.current) {
                  setTooltipPropsDelayed(tooltipIdRef.current, { show: !props.show });
                }
              };
              break;

            case 'hover':
              triggersProps.onMouseEnter = () => {
                if (tooltipIdRef.current) {
                  setTooltipPropsDelayed(tooltipIdRef.current, { show: true });
                }
              };
              triggersProps.onMouseLeave = () => {
                if (tooltipIdRef.current) {
                  setTooltipPropsDelayed(tooltipIdRef.current, { show: false });
                }
              };
              break;

            default:
              break;
          }
        });
      }

      return triggersProps;
    }, [props.trigger, setTooltipPropsDelayed, props.show]);

    return (
      <TooltipTrigger ref={containerRef} {...evtProps}>
        {children}
      </TooltipTrigger>
    );
  }
) as (props: TooltipComponentProps & { ref?: React.ForwardedRef<TooltipControls> }) => JSX.Element;

const TooltipMemoized = React.memo(Tooltip, (prevProps, nextProps) =>
  _isEqual(prevProps, nextProps)
);

export default TooltipMemoized;
