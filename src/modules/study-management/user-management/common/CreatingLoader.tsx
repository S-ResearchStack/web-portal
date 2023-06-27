import React from 'react';
import styled from 'styled-components';

import { colors, px, typography } from 'src/styles';
import BackdropOverlay, { BackdropOverlayProps } from 'src/common/components/BackdropOverlay';
import Spinner from 'src/common/components/Spinner';

const LoadingContent = styled.div`
  ${typography.headingLargeSemibold};
  color: ${colors.textPrimary};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  height: ${px(182)};
`;

type TaskCreatingProps = {
  label: string;
} & Omit<BackdropOverlayProps, 'blur'>;

const CreatingLoader = ({ label, ...props }: TaskCreatingProps) => (
  <BackdropOverlay {...props} blur>
    <LoadingContent data-testid="creating-loader">
      <Spinner size="m" />
      {label}
    </LoadingContent>
  </BackdropOverlay>
);

export default CreatingLoader;
