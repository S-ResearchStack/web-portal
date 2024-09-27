import React from 'react';
import styled from 'styled-components';

import ErrorIcon from 'src/assets/icons/error.svg';
import CloseIcon from 'src/assets/icons/close.svg';
import SuccessIcon from 'src/assets/icons/check_mark.svg';
import { colors, px, typography } from 'src/styles';

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  min-width: ${px(288)};
  width: 100%;
  background-color: ${colors.onSurface};
  box-shadow: 0 ${px(4)} ${px(4)} rgba(0, 0, 0, 0.25);
  border-radius: ${px(4)};

  padding: ${px(14)} ${px(24)}; // TODO: multiline text should use different paddings
`;

const Content = styled.div`
  display: flex;
  align-items: center;
`;

const Text = styled.div`
  ${typography.bodySmallRegular};
  color: ${colors.onPrimary};
  text-overflow: ellipsis;
  overflow: hidden;
`;

const ActionButton = styled.div`
  ${typography.bodyMediumSemibold};
  color: ${colors.onPrimary};
  text-transform: uppercase;
  margin-left: ${px(24)};
  cursor: pointer;
`;

const ColoredErrorIcon = styled(ErrorIcon)`
  fill: ${colors.statusError};
  margin-right: ${px(16)};
`;

const ColoredSuccessIcon = styled(SuccessIcon)`
  path {
    fill: ${colors.statusSuccess};
  }
  margin-right: ${px(16)};
`;

const ColoredCloseIcon = styled(CloseIcon)`
  path {
    fill: ${colors.surface};
  }
  margin-left: ${px(24)};
`;

type SnackbarProps = {
  text: string;
  actionLabel?: string;
  showErrorIcon?: boolean;
  showCloseIcon?: boolean;
  showSuccessIcon?: boolean;
  onAction?: () => void;
  onClose?: () => void;
};

const Snackbar = ({
  text,
  actionLabel,
  showErrorIcon,
  showCloseIcon,
  showSuccessIcon,
  onAction,
  onClose,
}: SnackbarProps) => (
  <Container>
    <Content>
      {showErrorIcon && !showSuccessIcon && <ColoredErrorIcon />}
      {showSuccessIcon && !showErrorIcon && <ColoredSuccessIcon />}
      <Text data-testid='snackbar-text'>{text}</Text>
    </Content>
    <Content>
      {actionLabel && <ActionButton onClick={onAction}>{actionLabel}</ActionButton>}
      {showCloseIcon && <ColoredCloseIcon onClick={onClose} />}
    </Content>
  </Container>
);

export default Snackbar;
