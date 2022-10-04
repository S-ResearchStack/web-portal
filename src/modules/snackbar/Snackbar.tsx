import React from 'react';
import styled from 'styled-components';

import { colors, px, typography } from 'src/styles';

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  min-width: ${px(288)};
  width: 100%;
  background-color: ${colors.updOnSurface};
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  border-radius: ${px(4)};

  padding: ${px(14)} ${px(24)}; // TODO: multiline text should use different paddings
`;

const Text = styled.div`
  ${typography.bodySmallRegular};
  color: ${colors.onPrimary};
  text-overflow: ellipsis;
  overflow: hidden;
`;

const ActionButton = styled.div`
  ${typography.body2Medium14};
  color: ${colors.onPrimary};
  text-transform: uppercase;
  margin-left: ${px(24)};
`;

type SnackbarProps = {
  text: string;
  actionLabel?: string;
  onAction?: () => void;
};

const Snackbar = ({ text, actionLabel, onAction }: SnackbarProps) => (
  <Container>
    <Text>{text}</Text>
    {actionLabel && <ActionButton onClick={onAction}>{actionLabel}</ActionButton>}
  </Container>
);

export default Snackbar;
