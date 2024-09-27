import React, { FC, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import styled, { css } from 'styled-components';
import useKey from 'react-use/lib/useKey';
import useEvent from 'react-use/lib/useEvent';
import { v4 as uuid } from 'uuid';

import { colors, px, typography } from 'src/styles';
import BackdropOverlay, { BackdropOverlayProps } from 'src/common/components/BackdropOverlay';
import Card, { CardProps } from 'src/common/components/Card';
import Button from 'src/common/components/Button';
import Fade from 'src/common/components/animations/Fade';

type UseModalCachedDataArg<T> = T | undefined;

export const useModalCachedData = <T,>(data: UseModalCachedDataArg<T>) => {
  const [cachedData, setCachedData] = useState<UseModalCachedDataArg<T>>(data);
  const [baseData, setBaseData] = useState<UseModalCachedDataArg<T>>(data);

  useEffect(() => {
    if (data) {
      setBaseData(data);
      setCachedData(data);
    }
  }, [data]);

  const updateData = useCallback(
    (d: Partial<T>) => setCachedData({ ...cachedData, ...(d as T) }),
    [cachedData]
  );

  return {
    data: cachedData ?? data,
    updateData,
    baseData,
    updateBaseData: setBaseData,
    modalProps: {
      open: !!data,
      onExited: useCallback(() => setCachedData(undefined), []),
    },
  };
};

type ModalContextValue = {
  openedCount: number;
  queue: string[];
};

type ModalContextType = ModalContextValue & {
  register: (modalId: string) => void;
  unregister: (modalId: string) => void;
};

export const ModalContext = React.createContext<ModalContextType>({
  queue: [],
  openedCount: 0,
  register() {},
  unregister() {},
});

export const ModalProvider = ({ children }: React.PropsWithChildren) => {
  const valueRef = useRef<ModalContextValue>({ openedCount: 0, queue: [] });
  const [value, setValue] = useState<ModalContextValue>(valueRef.current);

  const register = useCallback((modalId: string) => {
    valueRef.current.openedCount += 1;
    valueRef.current.queue = [...valueRef.current.queue, modalId];

    setValue({
      ...valueRef.current,
      openedCount: valueRef.current.openedCount,
      queue: valueRef.current.queue,
    });
  }, []);

  const unregister = useCallback((modalId: string) => {
    valueRef.current.openedCount -= 1;
    valueRef.current.queue = valueRef.current.queue.filter((i) => i !== modalId);

    setValue({
      ...valueRef.current,
      openedCount: valueRef.current.openedCount,
      queue: valueRef.current.queue.filter((i) => i !== modalId),
    });
  }, []);

  const ctx = useMemo(() => ({ ...value, register, unregister }), [register, unregister, value]);

  return <ModalContext.Provider value={ctx}>{children}</ModalContext.Provider>;
};

type ClickableProps = Pick<React.HTMLAttributes<HTMLElement>, 'onClick'>;
type ModalSize = 'default' | 'large' | 'xlarge';

export interface ModalProps extends Omit<BackdropOverlayProps, 'title'> {
  title: React.ReactNode;
  description?: React.ReactNode;
  size?: ModalSize;
  acceptLabel: string;
  declineLabel: string;
  onAccept: () => void;
  onDecline: () => void;
  declineComponent?: React.ComponentType<ClickableProps>;
  acceptComponent?: React.ComponentType<ClickableProps>;
  disableAccept?: boolean;
  acceptProcessing?: boolean;
}

const CONTAINER_PADDING = 21;

const Container = styled.div<{ isOverflow: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;

  ${(p) =>
    p.isOverflow &&
    css`
      overflow: auto;
      align-items: flex-start;
      padding: ${px(CONTAINER_PADDING)};
    `}
`;

const Body = styled.div`
  color: ${colors.textPrimary};
  display: flex;
  flex-direction: column;
`;

const Title = styled.div`
  ${typography.headingMedium};
  margin-bottom: ${px(24)};
`;

const Description = styled.div`
  ${typography.bodyMediumRegular};
`;

const Actions = styled.div`
  display: flex;
  align-self: flex-end;
  margin-top: ${px(40)};
`;

const StyledCard = styled(Card)<{ size?: ModalSize } & CardProps>`
  padding: ${px(32)};
  width: ${px(568)};

  ${(p) => {
    switch (p.size) {
      case 'large':
        return css`
          padding: ${px(40)};
          width: ${px(973)};

          ${Description} {
            margin-top: ${px(-8)};
          }
        `;
      case 'xlarge':
        return css`
          padding: ${px(40)};
          width: ${px(1280)};

          ${Description} {
            margin-top: ${px(-8)};
          }
        `;
      default:
        return;
    }
  }}
`;

const Modal: FC<ModalProps> = ({
  className,
  title,
  description,
  size,
  children,
  acceptLabel,
  onAccept,
  declineLabel,
  onDecline,
  declineComponent,
  acceptComponent,
  acceptProcessing,
  disableAccept,
  ...props
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const modalCtx = useContext(ModalContext);
  const modalId = useMemo(() => uuid(), []);

  const isModalActive = useMemo(() => {
    if (!modalCtx.queue.length) {
      return false;
    }

    return modalCtx.queue[modalCtx.queue.length - 1] === modalId;
  }, [modalCtx.queue, modalId]);

  const handleOnClickAccept = useCallback(() => {
    if (!acceptProcessing) {
      onAccept();
    }
  }, [acceptProcessing, onAccept]);

  const handleOnClickDecline = useCallback(() => {
    if (!acceptProcessing) {
      onDecline();
    }
  }, [acceptProcessing, onDecline]);

  const tabIndex = props.open ? 0 : -1;
  const ariaHidden = tabIndex < 0;

  useKey('Escape', () => isModalActive && props.open && handleOnClickDecline(), undefined, [
    props.open,
    handleOnClickDecline,
    isModalActive,
  ]);

  useKey('Enter', () => isModalActive && props.open && handleOnClickAccept(), undefined, [
    props.open,
    handleOnClickAccept,
    isModalActive,
  ]);

  const DeclineComponent = declineComponent || Button;
  const AcceptComponent = acceptComponent || Button;

  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (props.open) {
      modalCtx.register(modalId);
      cardRef.current?.focus();
    }
    return () => {
      props.open && modalCtx.unregister(modalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.open]);

  const [isOverflow, setOverflow] = useState(false);

  const checkOverflow = useCallback(() => {
    if (!containerRef.current) {
      return false;
    }

    const { offsetWidth, scrollWidth, offsetHeight, scrollHeight } = containerRef.current;
    const d = isOverflow ? CONTAINER_PADDING : 0;
    return offsetWidth < scrollWidth - d || offsetHeight < scrollHeight - d;
  }, [isOverflow]);

  useEffect(() => {
    setOverflow(checkOverflow());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.open, children, description]);

  useEvent(
    'resize',
    () => {
      setOverflow(checkOverflow());
    },
    window
  );

  return (
    <BackdropOverlay id="modal" {...props}>
      <Container ref={containerRef} isOverflow={isOverflow}>
        <Fade in={props.open} unmountOnExit>
          <StyledCard
            ref={cardRef}
            size={size}
            tabIndex={tabIndex}
            aria-modal={props.open}
            aria-hidden={ariaHidden}
            className={className || ''}
            role="alertdialog"
            data-testid="modal"
          >
            <Body>
              <Title data-testid="modal-title">{title}</Title>
              {description && (
                <Description data-testid="modal-description">{description}</Description>
              )}
              {children}
              <Actions>
                <DeclineComponent
                  double="left"
                  width={164}
                  fill="text"
                  onClick={handleOnClickDecline}
                  color="primary"
                  tabIndex={tabIndex}
                  data-testid="decline-button"
                >
                  {declineLabel}
                </DeclineComponent>
                <AcceptComponent
                  width={164}
                  fill="solid"
                  $loading={acceptProcessing}
                  onClick={handleOnClickAccept}
                  tabIndex={tabIndex}
                  disabled={disableAccept}
                  data-testid="accept-button"
                >
                  {acceptLabel}
                </AcceptComponent>
              </Actions>
            </Body>
          </StyledCard>
        </Fade>
      </Container>
    </BackdropOverlay>
  );
};

export default Modal;
