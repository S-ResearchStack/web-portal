import React, { FC, useCallback } from 'react';
import styled from 'styled-components';
import useHover from 'react-use/lib/useHover';

import * as dt from 'src/common/utils/datetime';
import SkeletonLoading, { SkeletonRect } from 'src/common/components/SkeletonLoading';
import { animation, colors, px, typography } from 'src/styles';
import { useAppDispatch } from 'src/modules/store';
import { useSelectedStudyId } from 'src/modules/studies/studies.slice';
import Chips from './common/Chips';
import { editSurvey, openSurveyResults } from './survey-editor/surveyEditor.slice';
import { SurveyListItem } from './surveyList.slice';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: ${px(160)};
  background: ${colors.primaryWhite};
  box-shadow: 0 0 ${px(2)} rgba(0, 0, 0, 0.15); // TODO: unknown color
  border-radius: ${px(4)};
  padding: ${px(16)} ${px(24)};
  transition: box-shadow 0.3s ${animation.defaultTiming};

  &:hover {
    box-shadow: 0 ${px(2)} ${px(4)} rgba(71, 71, 71, 0.25); // TODO: unknown color
    cursor: pointer;
  }
`;

const Head = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: ${px(32)};
`;

const Title = styled.h2`
  ${typography.headingXSmall};
  color: ${colors.textPrimaryDark};
  padding: 0;
  margin: 0;
  margin-top: ${px(16)};
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  height: ${px(42)};
`;

const PublishedAt = styled.div`
  ${typography.bodyXSmallRegular};
  color: ${colors.textSecondaryGray};
  margin-top: ${px(2)};
`;

const Body = styled.div`
  flex: 1;
`;

const Footer = styled.div``;

const FooterModifiedText = styled.div`
  ${typography.bodyXSmallRegular};
  color: ${colors.textPrimary};
`;

const FooterPublishedText = styled.div`
  ${typography.labelRegular};
  color: ${colors.textPrimary};
  text-transform: uppercase;
  letter-spacing: 0.03em;

  strong {
    ${typography.labelSemibold};
    color: ${colors.textPrimary};
  }
`;

interface SurveyCardProps extends React.HTMLAttributes<HTMLDivElement> {
  item: SurveyListItem;
}

const formatDate = (ts: dt.Timestamp): string => dt.format(ts, 'LLL d, yyyy');

const SurveyCard: FC<SurveyCardProps> = ({ item, ...props }) => {
  const dispatch = useAppDispatch();
  const studyId = useSelectedStudyId();

  const handleCardClick = useCallback(() => {
    if (item.status === 'PUBLISHED') {
      dispatch(openSurveyResults({ surveyId: item.id }));
    } else {
      studyId && dispatch(editSurvey({ studyId, surveyId: item.id }));
    }
  }, [dispatch, studyId, item.id, item.status]);

  const isPublished = item.status === 'PUBLISHED';

  const element = (hovered: boolean) => {
    const completionPercents =
      !item.respondedParticipants || !item.totalParticipants
        ? 0
        : Math.round((item.respondedParticipants / item.totalParticipants) * 100);

    let footer: React.ReactNode;
    if (!isPublished) {
      footer = (
        <FooterModifiedText>{`Modified on ${formatDate(item.modifiedAt)}`}</FooterModifiedText>
      );
    } else if (hovered) {
      footer = (
        <FooterPublishedText>
          {`${item.respondedParticipants}/${item.totalParticipants}`}
          &nbsp;&nbsp;|&nbsp;&nbsp;
          <strong>{`${completionPercents}% completion`}</strong>
        </FooterPublishedText>
      );
    } else {
      footer = (
        <FooterPublishedText>
          OVERALL COMPLETION:&nbsp;<strong>{`${completionPercents}%`}</strong>
        </FooterPublishedText>
      );
    }

    return (
      <Container {...props} onClick={handleCardClick}>
        <Body>
          <Head>
            <Chips type={isPublished ? 'success' : 'disabled'}>
              {isPublished ? 'Published' : 'Draft'}
            </Chips>
            {isPublished && item.modifiedAt && (
              <PublishedAt>{formatDate(item.modifiedAt)}</PublishedAt>
            )}
          </Head>
          <Title>{item.title}</Title>
        </Body>
        <Footer>{footer}</Footer>
      </Container>
    );
  };

  const [hoverableElement] = useHover(element);

  return hoverableElement;
};

export default SurveyCard;

const SkeletonContainer = styled(SkeletonLoading)`
  margin-top: ${px(8)};
`;

export const SurveyCardLoading: FC<React.HTMLAttributes<HTMLDivElement>> = (props) => (
  <Container {...props}>
    <SkeletonContainer>
      <SkeletonRect x="0" y="0" width="180" height="24" />
      <SkeletonRect x="0" y="48" width="132" height="56" />
    </SkeletonContainer>
  </Container>
);
