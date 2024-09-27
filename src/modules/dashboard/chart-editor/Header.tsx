import React, { FC, useRef, useMemo } from 'react';
import { useIntersection } from 'react-use';
import Alert from '@mui/material/Alert';
import styled from 'styled-components';

import { animation, colors, px } from 'src/styles';
import Button from 'src/common/components/Button';
import GoBackHeader from 'src/common/components/GoBackHeader';
import SimpleGrid, { desktopMq, DeviceScreenMatches, SimpleGridSchema } from 'src/common/components/SimpleGrid';

const HEADER_HEIGHT = 80;
const HEADER_LAPTOP_HEIGHT = 109;
const HEADER_PADDING_TOP = 32;

interface HeaderProps {
  backTitle: string;
  onSave: () => void;
  onDelete?: () => void;
  isSaving?: boolean;
  customGridSchema?: Partial<DeviceScreenMatches<Partial<SimpleGridSchema>>>;
  error?: boolean;
}

const Header: FC<HeaderProps> = ({
  backTitle,
  onSave,
  onDelete,
  isSaving,
  customGridSchema,
  error
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
      <HeaderContainer customSchema={customGridSchema}>
        <TopSection>
          <GoBackHeader title={backTitle} />
          <RightSide>
            {error && (
              <Alert variant="outlined" severity="error" style={{border: 'none', color: '#d32f2f'}}>Please fill required fields</Alert>
            )}
            {onDelete && (
              <Button
                data-testid="editor-header-delete"
                fill="text"
                double="left"
                width={110}
                onClick={onDelete}
              >
                Delete
              </Button>
            )}
            <Button
              data-testid="editor-header-save"
              fill="solid"
              width={164}
              disabled={isSaving}
              onClick={onSave}
            >
              Save
            </Button>
          </RightSide>
        </TopSection>
      </HeaderContainer>
    </HeaderOuterContainer>
  );
};

export default Header;

interface HeaderOuterContainerProps {
  locked: boolean;
}

const HeaderOuterContainer = styled.div<HeaderOuterContainerProps>`
  background-color: ${colors.background};
  padding-top: ${px(HEADER_PADDING_TOP)};
  padding: ${px(HEADER_PADDING_TOP)} ${px(24)} 0;
  position: sticky;
  top: ${px(-32)};
  z-index: 100;
  transition: box-shadow 150ms ${animation.defaultTiming};
  box-shadow: ${({ locked }) =>
    locked
      ? `${px(3)} ${px(4)} ${px(15)} rgba(0, 0, 0, 0.08)`
      : '0 0 0 rgba(0, 0, 0, 0.08)'};
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

const TopSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const RightSide = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;
