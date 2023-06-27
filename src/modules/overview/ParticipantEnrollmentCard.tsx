import React, { useMemo, useState } from 'react';
import styled from 'styled-components';

import { px, colors, typography } from 'src/styles';
import ResponsiveContainer from 'src/common/components/ResponsiveContainer';
import Tooltip from 'src/common/components/Tooltip';
import PeriodDropdown from 'src/common/components/PeriodDropdown';
import LineChartWithDynamicAxis from 'src/modules/charts/LineChartWithDynamicAxis';
import InfoIconSvg from 'src/assets/icons/info.svg';
import IncreaseIcon from 'src/assets/icons/comparison_percentage_increase.svg';
import DecreaseIcon from 'src/assets/icons/comparison_percentage_decrease.svg';
import { SkeletonRect } from 'src/common/components/SkeletonLoading';
import OverviewCardWrapperWithSkeleton from 'src/common/components/OverviewCardWrapperWithSkeleton';
import Card from 'src/common/components/Card';
import { isInsideTest } from 'src/common/utils/testing';
import { useParticipantEnrollmentData, ParticipantEnrollmentPeriod } from './overview.slice';

const ResponsiveContainerStyled = styled(ResponsiveContainer)`
  padding-top: ${px(18)};
  height: ${px(362)};
  width: 100%;
`;

const InfoBlock = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

const Placeholder = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: ${px(445)};
  font-family: 'Fira Code';
  font-size: ${px(14)};
  line-height: ${px(18)};
  font-weight: 450;
  color: ${colors.black60};
  padding-bottom: ${px(48)};
`;

const TotalEnrollment = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: ${px(5)};
`;

const TotalEnrollmentTitle = styled.div`
  ${typography.bodyMediumRegular};
  display: flex;
  color: ${colors.textSecondaryGray};

  svg {
    margin-left: ${px(4)};
    margin-top: ${px(4)};
  }
`;

const TotalEnrollmentNumber = styled.div`
  ${typography.heading2LargeSemibold};
  color: ${colors.textPrimary};
`;

const NoDataYet = styled.div`
  height: ${px(325)};
  background-color: ${colors.background};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.textPrimary};
`;

const NoEnrolled = styled.div`
  ${typography.heading2LargeSemibold};
  color: ${colors.textDisabled};
`;

const PercentageBlock = styled.div`
  display: flex;
  align-items: center;
  ${typography.bodySmallRegular};
  line-height: ${px(24)};
  color: ${colors.textPrimary};
  margin-top: ${px(48)};
`;

const DecreaseIconStyled = styled(DecreaseIcon)`
  transform: scale(0.66);
`;

const IncreaseIconStyled = styled(IncreaseIcon)`
  transform: rotate(180deg) scale(0.66);
`;

const ParticipantEnrollmentCard: React.FC = () => {
  const [period, setPeriod] = useState<ParticipantEnrollmentPeriod>('all_time');

  const isAPIReady = isInsideTest; // TODO delete this variable when api will be ready

  const { data, isLoading, error, refetch } = useParticipantEnrollmentData({
    fetchArgs: isAPIReady && {
      period,
    },
  });

  const chartData = useMemo(() => data && data?.dataItems?.map((g) => ({ ...g })), [data]);
  const totalEnrollment = useMemo(
    () => (chartData && chartData.reduce((sum, d) => sum + d.value, 0)) || 0,
    [chartData]
  );

  const periodDropdown = useMemo(
    () => (
      <PeriodDropdown
        items={[
          { label: 'LAST 24 HRS', key: 'last_24_hours' },
          { label: 'LAST 7 DAYS', key: 'last_7_days' },
          { label: 'LAST 30 DAYS', key: 'last_30_days' },
          { label: 'ALL TIME', key: 'all_time' },
        ]}
        activeKey={period}
        onChange={(v) => setPeriod(v)}
      />
    ),
    [period]
  );

  const content = useMemo(
    () =>
      isAPIReady ? (
        <Card
          title="Participant enrollment"
          error={!!error}
          onReload={refetch}
          empty={!isLoading && (!chartData || !chartData.length)}
          action={periodDropdown}
        >
          <InfoBlock>
            <TotalEnrollment>
              <TotalEnrollmentTitle>
                Total enrolled
                <Tooltip
                  arrow
                  trigger="hover"
                  position="r"
                  content="The number of invited people who are eligible, have completed onboarding, and have not withdrawn."
                  styles={{
                    width: px(333),
                  }}
                  horizontalPaddings="l"
                >
                  <InfoIconSvg />
                </Tooltip>
              </TotalEnrollmentTitle>
              <TotalEnrollmentNumber>
                {chartData && chartData.length ? totalEnrollment : <NoEnrolled>--</NoEnrolled>}
              </TotalEnrollmentNumber>
            </TotalEnrollment>
            {data?.comparisonPercentage && period !== 'all_time' && (
              <PercentageBlock>
                {data?.comparisonPercentage > 0 ? <IncreaseIconStyled /> : <DecreaseIconStyled />}
                {`${Math.abs(data?.comparisonPercentage)}%`}
              </PercentageBlock>
            )}
          </InfoBlock>
          <ResponsiveContainerStyled>
            {chartData && chartData.length ? (
              <LineChartWithDynamicAxis width={0} height={335} data={chartData} />
            ) : (
              <NoDataYet>No data yet</NoDataYet>
            )}
          </ResponsiveContainerStyled>
        </Card>
      ) : (
        <Card title="Participant enrollment">
          <Placeholder>Coming soon</Placeholder>
        </Card>
      ),
    [
      isAPIReady,
      chartData,
      data,
      error,
      isLoading,
      period,
      periodDropdown,
      refetch,
      totalEnrollment,
    ]
  );

  return (
    <OverviewCardWrapperWithSkeleton
      isLoading={isLoading}
      skeletons={[
        <SkeletonRect key="top" x="0" y="0" rx="2" width="50%" height="24" />,
        <SkeletonRect key="bottom" x="0" y="452" rx="2" width="100%" height="24" />,
      ]}
    >
      {content}
    </OverviewCardWrapperWithSkeleton>
  );
};

export default ParticipantEnrollmentCard;
