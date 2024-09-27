import React, { FC, useRef, useMemo } from 'react';
import { useIntersection } from 'react-use';

import { DateTime } from 'luxon';
import styled from 'styled-components';

import OfflineWarningIcon from 'src/assets/icons/offline_warning.svg';
import OfflineSyncingIcon from 'src/assets/icons/offline_syncing.svg';
import Button from 'src/common/components/Button';
import Tooltip from 'src/common/components/Tooltip';
import SimpleGrid, {
  desktopMq,
  DeviceScreenMatches,
  SimpleGridSchema,
} from 'src/common/components/SimpleGrid';
import { animation, colors, px, typography } from 'src/styles';
import GoBackHeader from 'src/common/components/GoBackHeader';

interface HeaderOuterContainerProps {
  locked: boolean;
}

export const HEADER_HEIGHT = 80;
export const HEADER_LAPTOP_HEIGHT = 109;
export const HEADER_PADDING_TOP = 32;

const HeaderOuterContainer = styled.div<HeaderOuterContainerProps>`
  background-color: ${colors.background};
  padding-top: ${px(HEADER_PADDING_TOP)};
  padding: ${px(HEADER_PADDING_TOP)} ${px(24)} 0;
  position: sticky;
  top: ${px(-32)};
  z-index: 100;
  transition: box-shadow 150ms ${animation.defaultTiming}; // TODO: check delay
  box-shadow: ${({ locked }) =>
    locked
      ? `${px(3)} ${px(4)} ${px(15)} rgba(0, 0, 0, 0.08)` // TODO: unknown color
      : '0 0 0 rgba(0, 0, 0, 0.08)'}; // TODO: unknown color
  grid-area: header;
`;

const HeaderContainer = styled(SimpleGrid)`
  height: ${px(HEADER_LAPTOP_HEIGHT)};
  padding-top: ${px(16)};
  padding-bottom: ${px(16)};
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  row-gap: ${px(8)};

  @media screen and ${desktopMq.media} {
    height: ${px(HEADER_HEIGHT)};
  }
`;

const RightSide = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;

  span {
    display: flex;
    align-items: center;
  }
`;

const TopSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const BottomSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;

  @media screen and ${desktopMq.media} {
    display: none;
  }
`;

const Messages = styled.div`
  display: none;
  @media screen and ${desktopMq.media} {
    display: flex;
  }
`;

const LastUpdateText = styled.div`
  ${typography.bodySmallRegular};
  color: ${colors.textSecondaryGray};
  margin: 0 0 0 ${px(8)};

  @media screen and ${desktopMq.media} {
    margin: 0 ${px(32)} 0 ${px(8)};
  }
`;

interface HeaderProps {
  onPublish: () => void;
  onPreview: () => void;
  onSave?: () => void;
  savedOn?: number;
  showPreview?: boolean;
  hasSavingError?: boolean;
  isSaving?: boolean;
  customGridSchema?: Partial<DeviceScreenMatches<Partial<SimpleGridSchema>>>;
  backTitle: string;
}

const Header: FC<HeaderProps> = ({
  onPublish,
  onSave,
  savedOn,
  hasSavingError,
  isSaving,
  customGridSchema,
  backTitle,
}) => {
  const gutterRef = useRef<HTMLDivElement>(null);
  const gutterIntersection = useIntersection(gutterRef, {
    root: null,
    threshold: 0.9,
  });
  const isHeaderLocked = useMemo(
    () => (gutterIntersection ? !gutterIntersection?.isIntersecting : false),
    [gutterIntersection]
  );

  const renderMessages = () => (
    <>
      {hasSavingError && !isSaving && (
        <Tooltip
          arrow
          position="b"
          trigger="hover"
          content="Your changes haven’t been saved."
          horizontalPaddings="l"
        >
          <OfflineWarningIcon />
        </Tooltip>
      )}
      {hasSavingError && isSaving && (
        <Tooltip
          arrow
          position="b"
          trigger="hover"
          content="Syncing your offline changes..."
          horizontalPaddings="l"
        >
          <OfflineSyncingIcon />
        </Tooltip>
      )}
      <LastUpdateText>
        {savedOn ? `Saved at ${DateTime.fromMillis(savedOn).toFormat('hh:mm a LLL d, y')}` : ''}
      </LastUpdateText>
    </>
  );

  return (
    <HeaderOuterContainer ref={gutterRef} locked={isHeaderLocked}>
      <HeaderContainer customSchema={customGridSchema}>
        <TopSection>
          <GoBackHeader title={backTitle} />
          <RightSide>
            <Messages>{renderMessages()}</Messages>
            {onSave && (
              <Button
                data-testid="editor-header-preview"
                fill="text"
                double="left"
                width={110}
                disabled={isSaving}
                onClick={onSave}
              >
                Save
              </Button>
            )}
            <Button
              data-testid="editor-header-publish"
              fill="solid"
              width={164}
              onClick={onPublish}
            >
              Publish
            </Button>
          </RightSide>
        </TopSection>
        <BottomSection>{renderMessages()}</BottomSection>
      </HeaderContainer>
    </HeaderOuterContainer>
  );
};

export default Header;