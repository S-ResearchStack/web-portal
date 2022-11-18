import React from 'react';
import styled from 'styled-components';

import { colors, px, typography, animation } from 'src/styles';

const Container = styled.div<{ visible: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: absolute;
  bottom: 0;

  min-width: ${px(288)};
  width: 100%;
  background-color: ${colors.onSurface};
  box-shadow: ${px(0)} ${px(4)} ${px(4)} rgba(0, 0, 0, 0.25);
  border-radius: ${px(4)};

  padding: ${px(14)} ${px(24)};
  margin-top: ${px(24)};
  opacity: ${({ visible }) => (visible ? 1 : 0)};
  transition: opacity 300ms ${animation.defaultTiming};
  z-index: 2;
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
`;

type TimeWarningProps = {
  seconds: number;
  onClose: () => void;
};

const TimeWarning = ({ seconds, onClose }: TimeWarningProps) => (
  <Container visible={!!seconds}>
    <Text>{`Your selected publish time is in ${Math.ceil(
      seconds / 60
    )} minutes for at least one participant. Publish now or select a new time.`}</Text>
    <ActionButton onClick={onClose}>OK</ActionButton>
  </Container>
);

export default TimeWarning;
