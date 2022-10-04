import styled from 'styled-components';
import React, { FC, useRef } from 'react';
import { useIntersection } from 'react-use';
import { DateTime } from 'luxon';
import Button from 'src/common/components/Button';
import { animation, colors, px, typography } from 'src/styles';
import SimpleGrid from 'src/common/components/SimpleGrid';
import GoBackHeader from '../common/GoBackHeader';

interface HeaderOuterContainerProps {
  locked: boolean;
}

export const HEADER_HEIGHT = 80;

const HeaderOuterContainer = styled.div<HeaderOuterContainerProps>`
  background-color: ${colors.updBackground};
  padding-top: ${px(32)};
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
`;

const LastUpdateText = styled.div`
  ${typography.bodySmallRegular};
  color: ${colors.updTextSecondaryGray};
  margin-right: ${px(32)};
`;

interface HeaderProps {
  onPublish: () => void;
  onPreview: () => void;
  savedOn?: number;
  showPreview?: boolean;
}

const Header: FC<HeaderProps> = ({ onPublish, onPreview, savedOn, showPreview }) => {
  const gutterRef = useRef<HTMLDivElement>(null);
  const gutterIntersection = useIntersection(gutterRef, {
    root: null,
    threshold: 0.9,
  });

  return (
    <HeaderOuterContainer ref={gutterRef} locked={!gutterIntersection?.isIntersecting}>
      <HeaderContainer>
        <GoBackHeader title="Survey management" />
        <RightSide>
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
