import React, { useEffect, useRef } from 'react';

import styled, { keyframes } from 'styled-components';

import * as dt from 'src/common/utils/datetime';
import Tabs from 'src/common/components/Tabs';
import SimpleGrid from 'src/common/components/SimpleGrid';
import ResponsiveContainer from 'src/common/components/ResponsiveContainer';
import { px, colors, typography } from 'src/styles';
import SkeletonLoading, { SkeletonRect } from 'src/common/components/SkeletonLoading';
import { useLayoutContentRef } from 'src/modules/main-layout/LayoutContentCtx';
import GoBackHeader from 'src/modules/study-management/common/GoBackHeader';

const FULL_HEADER_HEIGHT = 330;
const COLLAPSED_HEADER_HEIGHT = FULL_HEADER_HEIGHT - 124;

const Container = styled.div`
  background-color: ${colors.background};
  padding-bottom: ${px(20)};
  position: relative;
`;

const HeaderAnimation = keyframes`
  to {
    box-shadow: ${px(3)} ${px(4)} ${px(15)} 0 rgba(0, 0, 0, 0.05);
    height: ${px(COLLAPSED_HEADER_HEIGHT)};
    padding-top: ${px(16)};
  }
`;

const HeaderStickyContainer = styled.div<{ width?: number }>`
  position: fixed;
  background-color: ${colors.background};
  z-index: 1003;
  height: ${px(FULL_HEADER_HEIGHT)};
  width: ${({ width }) => (width ? px(width) : '100%')};
  padding-top: ${px(60)};

  animation: ${HeaderAnimation} 1s linear;
  &,
  * {
    animation-play-state: paused;
    animation-delay: calc(var(--anim-progress) * -1s);
    animation-iteration-count: 1;
    animation-fill-mode: both;
  }
`;

export const ContentContainer = styled.div`
  margin-top: ${px(FULL_HEADER_HEIGHT)};
`;

const TitleContainerAnimation = keyframes`
  to {
    margin-top: ${px(24)};
    margin-bottom: ${px(24)};
  }
`;

const TitleContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: ${px(48)};
  margin-bottom: ${px(48)};
  margin-left: ${px(8)};
  animation: ${TitleContainerAnimation} 1s linear;
  position: relative;
  min-height: ${px(64)};

  &,
  * {
    animation-play-state: paused;
    animation-delay: calc(var(--anim-progress) * -1s);
    animation-iteration-count: 1;
    animation-fill-mode: both;
  }
`;

const PublishedInfo = styled.div`
  ${typography.bodyXSmallRegular};
  color: ${colors.textSecondaryGray};
`;

const Title = styled.div`
  ${typography.headingMedium};
  color: ${colors.textPrimary};
`;

const TitleLoaderContainer = styled(SkeletonLoading)`
  position: absolute;
`;

const TitleLoader = () => (
  <TitleLoaderContainer>
    <SkeletonRect x={0} y={0} width={460} height={16} />
  </TitleLoaderContainer>
);

type Props = {
  content: JSX.Element;
  tabs: string[];
  title?: string;
  publishedAt?: number;
  activePageIndex: number;
  setActivePageIndex: (idx: number) => void;
};

const TaskPage: React.FC<Props> = ({
  content,
  tabs,
  title,
  publishedAt,
  activePageIndex,
  setActivePageIndex,
}) => {
  const mainContainerRef = useLayoutContentRef();
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const maxHeaderAdjustment = FULL_HEADER_HEIGHT - COLLAPSED_HEADER_HEIGHT;
      const progress =
        Math.min(mainContainerRef.current?.scrollTop || 0, maxHeaderAdjustment) /
        maxHeaderAdjustment;
      headerRef.current?.style.setProperty('--anim-progress', String(progress));
    };
    onScroll();

    const mainContainerRefCurrent = mainContainerRef.current;

    mainContainerRefCurrent?.addEventListener('scroll', onScroll);
    return () => {
      mainContainerRefCurrent?.removeEventListener('scroll', onScroll);
    };
  });

  return (
    <Container>
      <ResponsiveContainer>
        {({ width }) => (
          <HeaderStickyContainer ref={headerRef} width={width}>
            <SimpleGrid>
              <GoBackHeader title="Task management" />
              <TitleContainer>
                {title ? <Title>{title || ' '}</Title> : <TitleLoader />}
                <PublishedInfo>
                  {publishedAt && `Published on ${dt.format(publishedAt, 't LLL d, yyyy')}`}
                </PublishedInfo>
              </TitleContainer>
              <Tabs items={tabs} activeItemIdx={activePageIndex} onTabChange={setActivePageIndex} />
            </SimpleGrid>
          </HeaderStickyContainer>
        )}
      </ResponsiveContainer>
      <SimpleGrid>{content}</SimpleGrid>
    </Container>
  );
};

export default TaskPage;
