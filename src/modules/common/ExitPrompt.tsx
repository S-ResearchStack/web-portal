import React, { useCallback, useEffect, useState } from 'react';
import { useHistory, Prompt } from 'react-router-dom';

import { Location } from 'history';
import styled from 'styled-components';

import BackdropOverlay from 'src/common/components/BackdropOverlay';
import Fade from 'src/common/components/animations/Fade';
import Button from 'src/common/components/Button';
import { colors, px, typography } from 'src/styles';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${px(32)};
  background-color: ${colors.primaryWhite};
  border-radius: ${px(4)};
  width: ${px(568)};
  min-height: ${px(255)};
`;

const Centred = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: ${px(21)};
  overflow: auto;
`;

const Header = styled.div`
  ${typography.headingMedium};
  color: ${colors.textPrimary};
`;

const Text = styled.div`
  margin: ${px(24)} 0 ${px(40)};
  ${typography.bodyMediumRegular};
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

type ExitPromptProps = {
  when: boolean;
  onExitCb?: () => void;
};

const ExitPrompt = ({ when, onExitCb }: ExitPromptProps) => {
  const history = useHistory();

  const [showPrompt, setShowPrompt] = useState(false);
  const [nextPath, setNextPath] = useState<Location<unknown> | undefined>(undefined);
  const [confirmedNavigation, setConfirmedNavigation] = useState(false);

  const showModal = useCallback((l: Location<unknown>) => {
    setShowPrompt(true);
    setNextPath(l);
  }, []);

  const closeModal = useCallback((cb?: () => void) => {
    setShowPrompt(false);
    if (cb) {
      cb();
    }
  }, []);

  const handleBlockedNavigation = useCallback(
    (nextLocation: Location<unknown>) => {
      if (!confirmedNavigation && when) {
        showModal(nextLocation);
        return false;
      }
      return true;
    },
    [confirmedNavigation, showModal, when]
  );

  const handleConfirmNavigationClick = useCallback(() => {
    closeModal(() => {
      if (nextPath) {
        setConfirmedNavigation(true);
      }
      if (onExitCb) {
        onExitCb();
      }
    });
  }, [closeModal, nextPath, onExitCb]);

  useEffect(() => {
    if (confirmedNavigation) {
      if (nextPath) {
        history.push(nextPath);
      }
      setConfirmedNavigation(false);
    }
  }, [confirmedNavigation, nextPath, history]);

  return (
    <>
      <Prompt when={when} message={handleBlockedNavigation} />
      <BackdropOverlay id="publish-task" open={showPrompt}>
        <Centred>
          <Fade in={showPrompt} unmountOnExit>
            <Container>
              <Header>Exit with unsaved changes?</Header>
              <Text>
                This page has unsaved changes and you will lose the offline changes if you exit. Are
                you sure to exit?
              </Text>
              <Actions>
                <Button fill="text" width={164} onClick={() => closeModal()}>
                  Cancel
                </Button>
                <Button fill="solid" width={164} onClick={handleConfirmNavigationClick}>
                  Exit
                </Button>
              </Actions>
            </Container>
          </Fade>
        </Centred>
      </BackdropOverlay>
    </>
  );
};

export default ExitPrompt;
