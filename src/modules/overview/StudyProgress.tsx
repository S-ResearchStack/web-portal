import React, { useMemo, useEffect } from 'react';
import styled from 'styled-components';
import { DateTime } from 'luxon';
import _capitalize from 'lodash/capitalize';

import { px, typography, colors, theme } from 'src/styles';
import Card from 'src/common/components/Card';
import CardDurationTitle from 'src/common/components/CardDurationTitle';
import CardTitleWithInfo from 'src/common/components/CardTitleWithInfo';
import OverviewCardWrapperWithSkeleton from 'src/common/components/OverviewCardWrapperWithSkeleton';
import { SkeletonRect } from 'src/common/components/SkeletonLoading';
import { useShowSnackbar } from 'src/modules/snackbar';
import { hideSnackbar } from 'src/modules/snackbar/snackbar.slice';
import { useAppDispatch, useAppSelector } from 'src/modules/store';

import { useSelectedStudyId, selectedStudySelector } from 'src/modules/studies/studies.slice';

import {
  useStudyProgressData,
  setStorageLastSeenStatus,
  getStorageLastSeenStatus,
} from './overview.slice';

const BodyContainer = styled.div`
  display: flex;
  margin-top: ${px(18)};
`;

const SideContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const SideMiddleContent = styled.div`
  height: ${px(78)};
  display: flex;
  color: ${colors.textPrimary} !important;
  margin-top: ${px(10)};
`;

const LeftSideMiddleContent = styled(SideMiddleContent)`
  column-gap: ${px(16)};
  margin-bottom: ${px(12)};
`;

const LeftSideMiddleContentPart = styled.div`
  display: flex;
  align-items: baseline;
  column-gap: ${px(3)};
`;

const CountTitle = styled.div`
  ${typography.portalDisplayLarge};
`;

const UnitTitle = styled.div`
  ${typography.sdkBodyLargeSemibold};
  text-transform: uppercase;
`;

const RightSideMiddleContent = styled(SideMiddleContent)`
  align-items: center;
  margin-top: ${px(13)};
`;

const StatusCircle = styled.div<{ color?: string }>`
  width: ${px(16)};
  height: ${px(16)};
  border-radius: 50%;
  background-color: ${({ color }) => color};
  margin-right: ${px(16)};
`;

const StatusTitle = styled.div`
  ${typography.headingLargeSemibold};
  text-transform: capitalize;
`;

const CardDurationTitleContainer = styled.div`
  margin-bottom: ${px(5)};
`;

type Props = {
  isSwitchStudy?: boolean;
};

const StudyProgress: React.FC<Props> = ({ isSwitchStudy }) => {
  const studyId = useSelectedStudyId();
  const { data, isLoading, error, refetch } = useStudyProgressData({
    fetchArgs: !!studyId && studyId,
    refetchSilentlyOnMount: true,
  });
  const showSnackbar = useShowSnackbar();
  const dispatch = useAppDispatch();

  const lastSeenStatus = studyId ? getStorageLastSeenStatus(studyId) : undefined;
  const { status, id } = data || {};
  const selectedStudy = useAppSelector(selectedStudySelector);

  useEffect(() => {
    if (isSwitchStudy) {
      dispatch(hideSnackbar());
    } else if (
      studyId &&
      status &&
      lastSeenStatus &&
      lastSeenStatus !== status &&
      id?.value === studyId
    ) {
      showSnackbar({
        id: `${studyId}-${status}`,
        text: `Study status is updated to “${_capitalize(
          status
        )}” since the first participant has completed onboarding.`,
        actionLabel: 'OK',
        onAction: (settings) => {
          settings.hideAfterCall = true;
          setStorageLastSeenStatus(studyId, status);
        },
        duration: 0,
      });
    }
  }, [studyId, status, lastSeenStatus, showSnackbar, dispatch, id?.value, isSwitchStudy]);

  const statusTitle = useMemo(() => {
    switch (status) {
      case 'started':
        return 'Started';
      case 'ongoing':
        return 'ongoing';
      default:
        return 'Unknown';
    }
  }, [status]);

  const statusColor = useMemo(() => {
    switch (status) {
      case 'started':
        return theme.colors.primary;
      case 'ongoing':
        return theme.colors.secondaryGreen;
      default:
        return theme.colors.disabled;
    }
  }, [status]);

  const createdAtDate = useMemo(
    () =>
      selectedStudy &&
      DateTime.fromMillis(selectedStudy.createdAt || Date.now().valueOf()).startOf('day'),
    [selectedStudy]
  );
  const today = DateTime.now().startOf('day');

  const durationDetails = useMemo(() => {
    const diff = createdAtDate
      ? today.diff(createdAtDate.minus({ days: 1 }), ['years', 'days'])
      : { years: 0, days: 0 };

    return [
      { unit: 'year', count: diff.years },
      { unit: 'day', count: diff.days },
    ];
  }, [createdAtDate, today]);

  return (
    <OverviewCardWrapperWithSkeleton
      isLoading={isLoading}
      skeletons={[
        <SkeletonRect x="0" y="0" rx="2" width="50%" height="24" key="top" />,
        <SkeletonRect x="0" y="176" rx="2" width="100%" height="24" key="bottom" />,
      ]}
    >
      <Card title="Study Progress" error={!!error} onReload={refetch} empty={!isLoading && !data}>
        <BodyContainer>
          <SideContainer>
            <CardTitleWithInfo title="Total Duration" />
            <LeftSideMiddleContent>
              {durationDetails.map(
                ({ unit, count }) =>
                  !!count && (
                    <LeftSideMiddleContentPart key={[unit, count].join('-')}>
                      <CountTitle>{count}</CountTitle>
                      <UnitTitle>
                        {unit}
                        {count !== 1 && 's'}
                      </UnitTitle>
                    </LeftSideMiddleContentPart>
                  )
              )}
            </LeftSideMiddleContent>
            <CardDurationTitleContainer>
              <CardDurationTitle
                fromTs={selectedStudy?.createdAt || Date.now()}
                toTs={Date.now()}
              />
            </CardDurationTitleContainer>
          </SideContainer>
          <SideContainer>
            <CardTitleWithInfo
              title="Status"
              infoContent={
                status === 'started' ? (
                  <>
                    <span>Started means the study has been created</span>
                    <br />
                    <span>but no participants have completed onboarding.</span>
                  </>
                ) : (
                  <span>Ongoing means the study is actively in progress.</span>
                )
              }
            />
            <RightSideMiddleContent>
              <StatusCircle color={statusColor} />
              <StatusTitle>{statusTitle}</StatusTitle>
            </RightSideMiddleContent>
          </SideContainer>
        </BodyContainer>
      </Card>
    </OverviewCardWrapperWithSkeleton>
  );
};

export default StudyProgress;
