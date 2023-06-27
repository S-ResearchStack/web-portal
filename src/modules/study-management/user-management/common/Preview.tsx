import React, { useRef } from 'react';

import styled from 'styled-components';

import Close from 'src/assets/icons/close.svg';
import { laptopMq } from 'src/common/components/SimpleGrid';
import Button from 'src/common/components/Button';
import { animation, boxShadow, colors, px } from 'src/styles';
import { PreviewScreenCtx } from './PreviewScreenCtx';

const PreviewContainer = styled.div<{ $isOpen: boolean }>`
  min-width: ${({ $isOpen }) => ($isOpen ? px(350) : px(0))};
  height: 100vh;
  position: fixed;
  top: 100%;
  right: 0;
  z-index: 101;
  opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
  transition: opacity 300ms ${animation.defaultTiming};
  grid-area: preview;

  &:before {
    content: '';
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.38);
    position: fixed;
    left: 0;
    right: 0;
    bottom: -100%;
    top: 100%;
    z-index: 0;
  }

  @media screen and ${laptopMq.media} {
    position: sticky;
    top: 0;
    right: auto;

    &:before {
      display: none;
    }
  }
`;

const PreviewContent = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  z-index: 1;
  padding: ${px(48)} 0 0;
  box-shadow: ${boxShadow.card};
  background-color: ${colors.surface};
`;

const CloseButton = styled(Button)`
  margin-left: ${px(24)};
  > div {
    svg {
      margin-right: ${px(4)};
    }
  }
`;

const PreviewScreen = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
`;

type TaskPreviewProps = {
  open?: boolean;
  onRequestClose: () => void;
  renderContent: () => JSX.Element;
};

const Preview = ({ open, onRequestClose, renderContent }: TaskPreviewProps) => {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <PreviewContainer data-testid="task-preview" $isOpen={!!open}>
      <PreviewContent>
        <CloseButton
          data-testid="survey-preview-close"
          icon={<Close />}
          fill="text"
          width={164}
          onClick={onRequestClose}
          rippleOff
        >
          Close Preview
        </CloseButton>
        <PreviewScreenCtx.Provider value={ref}>
          <PreviewScreen ref={ref}>{renderContent()}</PreviewScreen>
        </PreviewScreenCtx.Provider>
      </PreviewContent>
    </PreviewContainer>
  );
};

export default Preview;
