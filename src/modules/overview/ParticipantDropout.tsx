import React, { useState, useMemo } from 'react';
import useWindowSize from 'react-use/lib/useWindowSize';
import styled, { css } from 'styled-components';
import { DateTime } from 'luxon';

import * as API from 'src/modules/api';
import { px, typography, colors } from 'src/styles';
import Card from 'src/common/components/Card';
import CardDurationTitle from 'src/common/components/CardDurationTitle';
import CardTitleWithInfo from 'src/common/components/CardTitleWithInfo';
import PeriodDropdown from 'src/common/components/PeriodDropdown';
import { DropdownItem } from 'src/common/components/Dropdown';
import OverviewCardWrapperWithSkeleton from 'src/common/components/OverviewCardWrapperWithSkeleton';
import { SkeletonRect } from 'src/common/components/SkeletonLoading';
import {
  DESKTOP_WIDTH_BREAKPOINT,
  LAPTOP_WIDTH_BREAKPOINT,
} from 'src/common/components/SimpleGrid';
import TrendDownIcon from 'src/assets/icons/trend_down.svg';
import { isInsideTest } from 'src/common/utils/testing';

import { useSelectedStudyId } from 'src/modules/studies/studies.slice';

import { useParticipantDropoutData } from './overview.slice';

const BodyContainer = styled.div<{ $compact?: boolean }>`
  display: flex;
  flex-direction: column;
  margin-top: ${({ $compact }) => px($compact ? 20 : 4)};
`;

const TitleContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const EnrollmentsCount = styled.div<{
  $disabled?: boolean;
  $smallFont?: boolean;
  $compact?: boolean;
}>`
  ${({ $smallFont }) =>
    $smallFont ? typography.headingXXLargeSemibold : typography.portalDisplayLarge};
  color: ${({ $disabled }) => ($disabled ? colors.textDisabled : colors.textPrimary)};
  height: ${px(78)};
  overflow: hidden;

  ${({ $compact, $smallFont }) => {
    if ($smallFont) {
      return css`
        margin-top: ${px($compact ? 15 : 23)};
        margin-bottom: ${px($compact ? 3 : 13)};
      `;
    }

    return css`
      margin-top: ${px($compact ? 7 : 23)};
      margin-bottom: ${px($compact ? 11 : 13)};
    `;
  }}
`;

const FooterContainer = styled.div`
  display: flex;
  justify-content: space-between;
  padding-bottom: ${px(5)};
`;

const TrendContainer = styled.div<{ $compact?: boolean }>`
  display: flex;
  column-gap: ${({ $compact }) => px($compact ? 2 : 8)};
  align-items: baseline;
`;

const TrendValue = styled.div`
  ${typography.bodySmallRegular};
  color: ${colors.textPrimary};
`;

const TrendDown = styled(TrendDownIcon)`
  fill: ${colors.statusSuccess};
`;

const TrendUp = styled(TrendDownIcon)`
  transform: rotate(180deg);
  fill: ${colors.statusError};
`;

const Placeholder = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: ${px(168)};
  font-family: 'Fira Code';
  font-size: ${px(14)};
  line-height: ${px(18)};
  font-weight: 450;
  color: ${colors.black60};
  padding-bottom: ${px(26)};
`;

const dropdownItems: DropdownItem<API.DropoutTimePeriod>[] = [
  { label: 'LAST 24 HOURS', key: 'day' },
  { label: 'LAST 7 DAYS', key: 'week' },
  { label: 'LAST 30 DAYS', key: 'month' },
  { label: 'ALL TIME', key: 'allTime' },
];

const ParticipantDropout: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<API.DropoutTimePeriod>('allTime');
  const studyId = useSelectedStudyId();

  const isAPIReady = isInsideTest; // TODO delete this variable when api will be ready

  const { data, isLoading, error, refetch } = useParticipantDropoutData({
    fetchArgs: isAPIReady && (studyId || ''),
  });

  const { width: screenWidth } = useWindowSize();

  const isCompact = screenWidth < DESKTOP_WIDTH_BREAKPOINT && screenWidth > LAPTOP_WIDTH_BREAKPOINT;

  const { withdrawals, trend } = data?.periods?.[selectedPeriod] || {};

  const [fromTs, toTs] = useMemo(() => {
    if (!withdrawals) {
      return [];
    }

    const todayTs = Date.now();

    if (selectedPeriod === 'allTime') {
      return [data?.enrolledAt || 0, todayTs];
    }

    const yesterday = DateTime.fromMillis(todayTs).minus({ days: 1 });
    const yesterdayTs = yesterday.toMillis();

    if (selectedPeriod === 'day') {
      return [yesterdayTs];
    }

    let minusDays;

    if (selectedPeriod === 'month') {
      minusDays = 31;
    } else if (selectedPeriod === 'week') {
      minusDays = 8;
    }

    return [yesterday.minus({ days: minusDays }).toMillis(), yesterdayTs];
  }, [selectedPeriod, data?.enrolledAt, withdrawals]);

  const trendContent = useMemo(
    () =>
      selectedPeriod !== 'allTime' &&
      !!withdrawals && (
        <TrendContainer $compact={isCompact}>
          {!!trend && (trend < 0 ? <TrendDown /> : <TrendUp />)}
          <TrendValue>{Math.abs(trend || 0)}%</TrendValue>
        </TrendContainer>
      ),
    [trend, selectedPeriod, withdrawals, isCompact]
  );

  const content = useMemo(
    () =>
      isAPIReady ? (
        <Card
          bottomAction={isCompact}
          title="Participant dropout"
          action={
            <PeriodDropdown
              items={dropdownItems}
              activeKey={selectedPeriod}
              onChange={setSelectedPeriod}
            />
          }
          error={!!error}
          onReload={refetch}
          empty={!isLoading && !data}
        >
          <BodyContainer $compact={isCompact}>
            <TitleContainer>
              <CardTitleWithInfo
                title="Withdrawals"
                infoContent={
                  <>
                    <span>The number of participants who</span>
                    <br />
                    <span>have dropped out of the study.</span>
                  </>
                }
                tooltipPosition={isCompact ? 'bl' : 'r'}
              />
              {isCompact && trendContent}
            </TitleContainer>
            <EnrollmentsCount
              $disabled={!withdrawals}
              $smallFont={(withdrawals || 0).toString().length >= 4 && isCompact}
              $compact={isCompact}
            >
              {withdrawals ? withdrawals.toLocaleString() : '--'}
            </EnrollmentsCount>
            <FooterContainer>
              <CardDurationTitle
                fromTs={fromTs}
                toTs={toTs}
                placeholder="No participants enrolled yet"
              />
              {!isCompact && trendContent}
            </FooterContainer>
          </BodyContainer>
        </Card>
      ) : (
        <Card title="Participant dropout">
          <Placeholder>Coming soon</Placeholder>
        </Card>
      ),
    [
      isAPIReady,
      data,
      error,
      isCompact,
      isLoading,
      fromTs,
      toTs,
      refetch,
      selectedPeriod,
      withdrawals,
      trendContent,
    ]
  );

  return (
    <OverviewCardWrapperWithSkeleton
      isLoading={isLoading}
      skeletons={[
        <SkeletonRect x="0" y="0" rx="2" width="37%" height="24" key="top" />,
        <SkeletonRect x="0" y="176" rx="2" width="100%" height="24" key="bottom" />,
      ]}
    >
      {content}
    </OverviewCardWrapperWithSkeleton>
  );
};

export default ParticipantDropout;
