import React, { useMemo } from 'react';
import styled from 'styled-components';

import { theme, px } from 'src/styles';
import { TranslationId, useTranslation } from '../localization/useTranslation';
import Card from 'src/common/components/Card';
import OverviewCardWrapperWithSkeleton from 'src/common/components/OverviewCardWrapperWithSkeleton';
import { SkeletonRect } from 'src/common/components/SkeletonLoading';
import ListOverview, { ListItem } from './common/ListOverview';
import { BasicInfoObject, ParticipationApprovalType, StudyScope } from '../api';

import StudyImg from 'src/assets/images/studyImage.png';

const scopeTooltip: Record<StudyScope, TranslationId> = {
  'PRIVATE': 'CAPTION_STUDY_SCOPE_PRIVATE',
  'PUBLIC': 'CAPTION_STUDY_SCOPE_PUBLIC',
}
const participationApprovalTypeTooltip: Record<ParticipationApprovalType, TranslationId> = {
  'MANUAL': 'CAPTION_PARTICIPATION_APPROVAL_TYPE_MANUAL',
  'AUTO': 'CAPTION_PARTICIPATION_APPROVAL_TYPE_AUTO',
}

const BasicInfo = ({ data, isLoading }: { data?: BasicInfoObject, isLoading?: boolean }) => {
  const { t } = useTranslation();
  const list: ListItem[] = useMemo(() => {
    if (!data) return [];
    return [
      {
        key: 'Description',
        value: data.description,
      },
      {
        key: 'Organization',
        value: data.organization,
      },
      {
        key: 'Scope',
        value: data.scope,
        tooltip: t(scopeTooltip[data.scope as StudyScope]),
      },
      {
        key: 'Participation Code',
        value: data.participationCode,
      },
      {
        key: 'Participation Approval Type',
        value: data.participationApprovalType,
        tooltip: t(participationApprovalTypeTooltip[data.participationApprovalType as ParticipationApprovalType]),
      },
      {
        key: 'Duration',
        value: data.duration,
      },
      {
        key: 'Period',
        value: data.period,
      },
      {
        key: 'Requirements',
        value: data.requirements?.join("\n"),
        linneCount: data.requirements.length
      },
      {
        key: 'Investigation Device',
        value: data.investigationDevice,
      },
      {
        key: 'Reference Device',
        value: data.referenceDevice,
      },
    ]
  }, [data, t]);

  return (
    <OverviewCardWrapperWithSkeleton
      isLoading={isLoading}
      skeletons={[
        <SkeletonRect key="top" x="0" y="0" rx="2" width="120%" height="180" />,
        <SkeletonRect key="middle2" x="0" y="240" rx="2" width="40%" height="30" />,
        <SkeletonRect key="middle3" x="0" y="280" rx="2" width="30%" height="20" />,
        <SkeletonRect key="bottom" x="0" y="340" rx="2" width="100%" height="408" />,
      ]}
    >
      <Card
        height={px(800)}
      >
        <ImageContainer>
          <StudyImage src={data?.imageURL || StudyImg} alt="study image" />
        </ImageContainer>
        <StudyBasicInfo>
          <h3>{data?.name || '-'}</h3>
          <span>{data?.id || '-'}</span>
        </StudyBasicInfo>
        <ListOverview data={list} />
      </Card>
    </OverviewCardWrapperWithSkeleton>
  );
};

export default BasicInfo;

const ImageContainer = styled.div`
  position: relative;
`
const StudyImage = styled.img`
  height: ${px(204)};
  margin: ${px(-24)};
  width: calc(100% + ${px(48)});
  object-fit: cover;
`
const StudyBasicInfo = styled.div`
  margin-top: ${px(70)};
  margin-bottom: ${px(24)};
  h3 {
    margin-bottom: ${px(7)};
  }
  span {
    color: ${theme.colors.black60};
    font-size: ${px(14)};
  }
`
