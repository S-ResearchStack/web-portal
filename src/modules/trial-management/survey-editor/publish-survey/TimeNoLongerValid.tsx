import React, { FC } from 'react';

import styled from 'styled-components';

import BackdropOverlay from 'src/common/components/BackdropOverlay';
import Button from 'src/common/components/Button';
import Fade from 'src/common/components/animations/Fade';
import { colors, px, typography } from 'src/styles';

const Centred = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding-top: ${px(311)};
  overflow: auto;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: ${px(40)};
  background-color: ${colors.primaryWhite};
  border-radius: ${px(4)};
  width: ${px(568)};
  min-height: ${px(279)};
`;

const Content = styled.div``;

const Header = styled.div`
  ${typography.headingMedium};
  color: ${colors.textPrimary};
  margin-bottom: ${px(24)};
`;

const Actions = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

const Text = styled.div`
  ${typography.bodyMediumRegular};
  color: ${colors.textPrimary};
  margin-bottom: ${px(40)};
`;

interface TimeNoLongerValidProps {
  open: boolean;
  onClose: () => void;
}

const TimeNoLongerValid: FC<TimeNoLongerValidProps> = ({ open, onClose }) => (
  <BackdropOverlay id="publish-time-no-longer-valid" open={open}>
    <Centred>
      <Fade in={open} unmountOnExit>
        <Container>
          <Content>
            <Header>Your publish time is no longer valid.</Header>
            <Text>
              Your publish time is no longer valid.
              <br />
              {`The specified publish time is now in the past for at least one participant. We'll pick a new time for you, but you can adjust it.`}
            </Text>
          </Content>
          <Actions>
            <Button fill="solid" onClick={onClose} width={164}>
              Update time
            </Button>
          </Actions>
        </Container>
      </Fade>
    </Centred>
  </BackdropOverlay>
);

export default TimeNoLongerValid;
