import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

import styled, { keyframes } from 'styled-components';
import * as dt from 'src/common/utils/datetime';
import Tabs from 'src/common/components/Tabs';
import SimpleGrid from 'src/common/components/SimpleGrid';
import ResponsiveContainer from 'src/common/components/ResponsiveContainer';
import { px, colors, typography } from 'src/styles';
import SkeletonLoading, { SkeletonRect } from 'src/common/components/SkeletonLoading';
import { useLayoutContentRef } from 'src/modules/main-layout/LayoutContentCtx';
import { Path } from 'src/modules/navigation/store';

import GoBackHeader from './common/GoBackHeader';
import { SurveyResults, SurveyResultsSurveyInfo, useSurveyDetailsData } from './surveyPage.slice';
import SurveyResponses from './SurveyResponses';
import SurveyAnalytics from './SurveyAnalytics';
import { useSelectedStudyId } from '../studies/studies.slice';
import { surveyListDataSelector } from './surveyList.slice';

const FULL_HEADER_HEIGHT = 295;
const COLLAPSED_HEADER_HEIGHT = FULL_HEADER_HEIGHT - 108;

const Container = styled.div`
  background-color: ${colors.background};
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
  position: relative;

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

const SurveyPage = () => {
  const [activePageIndex, setActivePageIndex] = useState(0);
  const history = useHistory();
  const tabs = ['Survey Responses', 'Survey Analytics'];
  const params = useParams<{ surveyId: string }>();
  const studyId = useSelectedStudyId();

  const mainContainerRef = useLayoutContentRef();
  const headerRef = useRef<HTMLDivElement>(null);

  const surveyList = useSelector(surveyListDataSelector);
  const initialData: SurveyResults | undefined = useMemo(() => {
    const selectedItem = surveyList?.published.find((i) => i.id === params.surveyId);

    return (
      selectedItem && {
        surveyInfo: selectedItem as SurveyResultsSurveyInfo,
      }
    );
  }, [params.surveyId, surveyList?.published]);

  const { data, isLoading, error } = useSurveyDetailsData(
    {
      initialData,
      fetchArgs: !!studyId && {
        id: params.surveyId,
        studyId,
      },
    },
    {
      text: "Can't get survey data.",
      duration: 0,
      onAction: () => history.push(Path.TrialManagement),
      actionLabel: 'back',
      showErrorIcon: true,
    }
  );

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
    if (activePageIndex === 0) {
      return (
        <ContentContainer>
          <SurveyResponses loading={isLoading} responses={data?.responses} />
        </ContentContainer>
      );
    }
    return (
      <ContentContainer>
        <SurveyAnalytics loading={isLoading} analytics={data?.analytics} />
        {/* <SurveyResponses responses={data.analitycs.statistics} /> */}
      </ContentContainer>
    );
  }, [activePageIndex, data, isLoading]);

  if (error) {
    return null;
  }

  return (
    <Container>
      <ResponsiveContainer>
        {({ width }) => (
          <HeaderStickyContainer ref={headerRef} width={width}>
            <SimpleGrid>
              <GoBackHeader title="Survey management" />
              <TitleContainer>
                {!data?.surveyInfo.title && <TitleLoader />}
                <Title>{data?.surveyInfo.title || ' '}</Title>
                <PublishedInfo>
                  {data?.surveyInfo.publishedAt &&
                    `Published on ${dt.format(data.surveyInfo.publishedAt, 't LLL d, yyyy')}`}
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

export default SurveyPage;
