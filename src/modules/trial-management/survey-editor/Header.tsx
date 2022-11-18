import styled from 'styled-components';
import React, { FC, useRef, useMemo } from 'react';
import { useIntersection } from 'react-use';
import { DateTime } from 'luxon';

import OfflineWarningIcon from 'src/assets/icons/offline_warning.svg';
import OfflineSyncingIcon from 'src/assets/icons/offline_syncing.svg';
import Button from 'src/common/components/Button';
import Tooltip from 'src/common/components/Tooltip';
import { animation, colors, px, typography } from 'src/styles';
import SimpleGrid from 'src/common/components/SimpleGrid';
import GoBackHeader from '../common/GoBackHeader';

interface HeaderOuterContainerProps {
  locked: boolean;
}

export const HEADER_HEIGHT = 80;
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
  height: ${px(HEADER_HEIGHT)};
  padding: ${px(16)} 0;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
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

const LastUpdateText = styled.div`
  ${typography.bodySmallRegular};
  color: ${colors.textSecondaryGray};
  margin: 0 ${px(32)} 0 ${px(8)};
`;

interface HeaderProps {
  onPublish: () => void;
  onPreview: () => void;
  savedOn?: number;
  showPreview?: boolean;
  hasSavingError?: boolean;
  isSaving?: boolean;
}

const Header: FC<HeaderProps> = ({
  onPublish,
  onPreview,
  savedOn,
  showPreview,
  hasSavingError,
  isSaving,
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

  return (
    <HeaderOuterContainer ref={gutterRef} locked={isHeaderLocked}>
      <HeaderContainer>
        <GoBackHeader title="Survey management" />
        <RightSide>
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
          {showPreview && (
            <Button fill="text" double="left" width={110} onClick={onPreview}>
              Preview
            </Button>
          )}
          <Button fill="solid" width={164} onClick={onPublish}>
            Publish
          </Button>
        </RightSide>
      </HeaderContainer>
    </HeaderOuterContainer>
  );
};

export default Header;
