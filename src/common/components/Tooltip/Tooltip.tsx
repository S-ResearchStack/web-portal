import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import styled from 'styled-components';
import _debounce from 'lodash/debounce';
import _isEqual from 'lodash/isEqual';
import usePrevious from 'react-use/lib/usePrevious';

import {
  ITooltipItemContext,
  Point,
  TooltipControls,
  TooltipID,
  TooltipPosition,
  TooltipProps,
} from './types';
import { useTooltipItemCtx } from './TooltipContext';
import TooltipItem from './TooltipItem';

const DEFAULT_SET_TOOLTIP_PROPS_DELAY = 50;

const TooltipTrigger = styled.span<{ relative: boolean }>`
  display: inline-block;
  position: ${({ relative }) => (relative ? 'relative' : 'static')};
`;

type TooltipComponentProps = React.PropsWithChildren<Omit<TooltipProps, 'id'>>;

const Tooltip = forwardRef(
  ({ children, ...props }: TooltipComponentProps, ref: React.ForwardedRef<TooltipControls>) => {
    const containerRef = useRef<HTMLSpanElement>(null);
    const tooltipCtx: ITooltipItemContext = useTooltipItemCtx();
    const prevProps = usePrevious(props);
    const [tooltipIdx, setTooltipIdx] = useState<TooltipID>();
    const [currentTooltip, setCurrenTooltip] = useState<TooltipProps>();

    useEffect(() => {
      let ttIdx: TooltipID;

      if (containerRef.current) {
        ttIdx = tooltipCtx.create({
          container: containerRef.current,
          ...props,
        });

        setTooltipIdx(ttIdx);
      }

      return () => {
        tooltipCtx.destroy(ttIdx);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
      if (containerRef.current && tooltipIdx && !_isEqual(prevProps, props)) {
        tooltipCtx.setProps(tooltipIdx, {
          container: containerRef.current,
          ...props,
        });
      }
    }, [tooltipCtx, prevProps, props, tooltipIdx]);

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
          if (tooltipIdx) {
            tooltipCtx.setProps(tooltipIdx, { point });
          }
          return this;
        },
        setContent(content: React.ReactNode) {
          if (tooltipIdx) {
            tooltipCtx.setProps(tooltipIdx, { content });
          }
          return this;
        },
        setContainer(container?: HTMLElement) {
          if (tooltipIdx && container) {
            tooltipCtx.setProps(tooltipIdx, { container });
          }
          return this;
        },
        getContainer(): HTMLElement | undefined {
          if (tooltipIdx) {
            return tooltipCtx.getProps(tooltipIdx)?.container;
          }
          return undefined;
        },
        getTooltip(): HTMLElement | undefined {
          if (tooltipIdx) {
            return document.getElementById(tooltipIdx) || undefined;
          }
          return undefined;
        },
        setArrow(arrow: boolean) {
          if (tooltipIdx) {
            tooltipCtx.setProps(tooltipIdx, { arrow });
          }
          return this;
        },
        setPosition(position: TooltipPosition) {
          if (tooltipIdx) {
            tooltipCtx.setProps(tooltipIdx, { position });
          }
          return this;
        },
        show() {
          if (tooltipIdx) {
            tooltipCtx.setProps(tooltipIdx, { show: true });
          }
          return this;
        },
        hide() {
          if (tooltipIdx) {
            tooltipCtx.setProps(tooltipIdx, { show: false });
          }
          return this;
        },
        destroy() {
          if (tooltipIdx) {
            tooltipCtx.destroy(tooltipIdx);
          }
        },
      }),
      [tooltipIdx, tooltipCtx]
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
                if (tooltipIdx) {
                  setTooltipPropsDelayed(tooltipIdx, { show: !props.show });
                }
              };
              break;

            case 'hover':
              triggersProps.onMouseEnter = () => {
                if (tooltipIdx) {
                  setTooltipPropsDelayed(tooltipIdx, { show: true });
                }
              };
              triggersProps.onMouseLeave = () => {
                if (tooltipIdx) {
                  setTooltipPropsDelayed(tooltipIdx, { show: false });
                }
              };
              break;

            default:
              break;
          }
        });
      }

      return triggersProps;
    }, [props.trigger, props.show, tooltipIdx, setTooltipPropsDelayed]);

    useEffect(() => {
      let describe: () => void;
      if (tooltipIdx) {
        describe = tooltipCtx.subscribe(tooltipIdx, setCurrenTooltip);
      }
      return () => describe?.();
    }, [tooltipCtx, tooltipIdx]);

    return (
      <TooltipTrigger
        ref={containerRef}
        {...evtProps}
        relative={!props.point}
        data-testid="tooltip-container"
      >
        {children}
        {props.static && tooltipIdx ? (
          <TooltipItem
            data-testid="tooltip-item"
            key={tooltipIdx}
            id={tooltipIdx}
            {...(currentTooltip || props)}
            {...(props.point
              ? { point: props.point }
              : { container: containerRef.current as HTMLElement })}
          />
        ) : null}
      </TooltipTrigger>
    );
  }
) as (props: TooltipComponentProps & { ref?: React.ForwardedRef<TooltipControls> }) => JSX.Element;

const TooltipMemoized = React.memo(Tooltip, (prevProps, nextProps) =>
  _isEqual(prevProps, nextProps)
);

export default TooltipMemoized;
