import React, { FC, useCallback, useEffect, useRef } from 'react';
import styled from 'styled-components';
import useKey from 'react-use/lib/useKey';

import { colors, px, typography } from 'src/styles';
import BackdropOverlay, { BackdropOverlayProps } from 'src/common/components/BackdropOverlay';
import Card from 'src/common/components/Card';
import Button from 'src/common/components/Button';
import Fade from 'src/common/components/animations/Fade';

type ClickableProps = Pick<React.HTMLAttributes<HTMLElement>, 'onClick'>;

export interface ModalProps extends Omit<BackdropOverlayProps, 'title'> {
  title: React.ReactNode;
  description: React.ReactNode;
  acceptLabel: string;
  declineLabel: string;
  onAccept: () => void;
  onDecline: () => void;
  declineComponent?: React.ComponentType<ClickableProps>;
  acceptComponent?: React.ComponentType<ClickableProps>;
  disableActions?: boolean;
  acceptProcessing?: boolean;
}

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
`;

const StyledCard = styled(Card)`
  padding: ${px(32)};
  width: ${px(568)};
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
  margin-bottom: ${px(40)};
`;

const Actions = styled.div`
  display: flex;
  align-self: flex-end;
`;

const Modal: FC<ModalProps> = ({
  className,
  title,
  description,
  children,
  acceptLabel,
  onAccept,
  declineLabel,
  onDecline,
  declineComponent,
  acceptComponent,
  acceptProcessing,
  ...props
}) => {
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

  useKey('Escape', () => props.open && handleOnClickDecline(), undefined, [
    props.open,
    handleOnClickDecline,
  ]);

  useKey('Enter', () => props.open && handleOnClickAccept(), undefined, [
    props.open,
    handleOnClickAccept,
  ]);

  const DeclineComponent = declineComponent || Button;
  const AcceptComponent = acceptComponent || Button;

  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (props.open) {
      cardRef.current?.focus();
    }
  }, [props.open]);

  return (
    <BackdropOverlay id="modal" {...props}>
      <Container>
        <Fade in={props.open} unmountOnExit>
          <StyledCard
            ref={cardRef}
            tabIndex={tabIndex}
            aria-modal={props.open}
            aria-hidden={ariaHidden}
            className={className || ''}
            role="alertdialog"
            data-testid="modal"
          >
            <Body>
              <Title data-testid="modal-title">{title}</Title>
              <Description data-testid="modal-description">{description}</Description>
              <Actions>
                {children}
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
