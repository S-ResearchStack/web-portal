import React, { useState, useMemo, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { useParams } from 'react-router-dom';

import * as dt from 'src/common/utils/datetime';
import Tabs from 'src/common/components/Tabs';
import SimpleGrid from 'src/common/components/SimpleGrid';
import { px, colors, typography } from 'src/styles';
import GoBackHeader from './common/GoBackHeader';
import { useSurveyDetailsData } from './surveyPage.slice';
import SurveyResponses from './SurveyResponses';
import SurveyAnalytics from './SurveyAnalytics';
import { useSelectedStudyId } from '../studies/studies.slice';

const FULL_HEADER_HEIGHT = 295;
const COLLAPSED_HEADER_HEIGHT = FULL_HEADER_HEIGHT - 108;

const Container = styled.div`
  background-color: ${colors.updBackground};
  padding-bottom: ${px(52)};
  position: relative;
`;

const HeaderAnimation = keyframes`
  to {
    box-shadow: ${px(3)} ${px(4)} ${px(15)} 0 rgba(0, 0, 0, 0.05);
    height: ${px(COLLAPSED_HEADER_HEIGHT)};
    padding-top: ${px(16)};
  }
`;

const HeaderStickyContainer = styled.div<{ extraWidth: number }>`
  position: fixed;
  background-color: ${colors.updBackground};
  z-index: 1;
  height: ${px(FULL_HEADER_HEIGHT)};
  width: ${({ extraWidth }) => `calc(100% - ${px(extraWidth)})`};
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

const ContentContainer = styled.div`
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
  color: ${colors.updTextSecondaryGray};
`;

const Title = styled.div`
  ${typography.headingMedium};
  color: ${colors.updTextPrimary};
`;

type Props = {
  mainContainerRef: React.RefObject<HTMLDivElement>;
};

const SurveyPage = ({ mainContainerRef }: Props) => {
  const [activePageIndex, setActivePageIndex] = useState(0);
  const tabs = ['Survey Responses', 'Survey Analytics'];
  const params = useParams<{ surveyId: string }>();
  const studyId = useSelectedStudyId();

  const headerRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, error } = useSurveyDetailsData({
    fetchArgs: !!studyId && {
      id: params.surveyId,
      studyId,
    },
  });

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

  const content = useMemo(() => {
    if (!data) {
      return null;
    }

    if (activePageIndex === 0) {
      return (
        <ContentContainer>
          <SurveyResponses responses={data.responses} />
        </ContentContainer>
      );
    }
    return (
      <ContentContainer>
        <SurveyAnalytics analytics={data.analytics} />
        {/* <SurveyResponses responses={data.analitycs.statistics} /> */}
      </ContentContainer>
    );
  }, [activePageIndex, data]);

  const extraWidth = useMemo(() => {
    const sidebar = document.getElementById('sidebar')?.getBoundingClientRect();
    const sidebarWidth = sidebar?.width || 0;
    const scrollWidth = mainContainerRef.current
      ? mainContainerRef.current.offsetWidth - mainContainerRef.current.clientWidth
      : 0;

    return sidebarWidth + scrollWidth;
  }, [mainContainerRef]);

  if (!data || isLoading || !!error) {
    return null;
  }

  return (
    <Container>
      <HeaderStickyContainer ref={headerRef} extraWidth={extraWidth}>
        <SimpleGrid>
          <GoBackHeader title="Survey management" />
          <TitleContainer>
            <Title>{data?.surveyInfo.title}</Title>
            <PublishedInfo>
              {data.surveyInfo.publishedAt &&
                `Published on ${dt.format(data.surveyInfo.publishedAt, 't LLL d, yyyy')}`}
            </PublishedInfo>
          </TitleContainer>
          <Tabs items={tabs} activeItemIdx={activePageIndex} onTabChange={setActivePageIndex} />
        </SimpleGrid>
      </HeaderStickyContainer>
      <SimpleGrid>{content}</SimpleGrid>
    </Container>
  );
};

export default SurveyPage;
