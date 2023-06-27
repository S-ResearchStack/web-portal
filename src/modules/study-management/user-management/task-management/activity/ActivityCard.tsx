import React, { FC, useCallback } from 'react';
import styled from 'styled-components';
import useHover from 'react-use/lib/useHover';

import * as dt from 'src/common/utils/datetime';
import { animation, colors, px, typography } from 'src/styles';
import { useAppDispatch } from 'src/modules/store';
import { useSelectedStudyId } from 'src/modules/studies/studies.slice';

import Chips from 'src/modules/study-management/user-management/common/Chips';
import { editActivity, openActivityResults } from './activity-editor/activityEditor.slice';
import { ActivitiesListItem } from './activitiesList.slice';
import { getActivityIconByType } from './activities.utils';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: ${px(160)};
  background: ${colors.primaryWhite};
  box-shadow: 0 0 ${px(2)} ${colors.black15};
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
  margin-bottom: ${px(19)};
`;

const Content = styled.div`
  display: flex;
  column-gap: ${px(16)};
`;

const Illustration = styled.div`
  margin: ${px(-3)} 0;

  &,
  > svg {
    width: ${px(48)};
    height: ${px(48)};
  }
`;

const Title = styled.h2`
  ${typography.headingXSmall};
  color: ${colors.textPrimaryDark};
  padding: 0;
  margin: 0;
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
  ${typography.labelRegular};
  color: ${colors.textPrimary};
`;

const FooterPublishedText = styled.div`
  ${typography.labelRegular};
  color: ${colors.textPrimary};
  letter-spacing: 0.03em;

  strong {
    ${typography.labelSemibold};
    color: ${colors.textPrimary};
    text-transform: uppercase;
  }
`;

interface SurveyCardProps extends React.HTMLAttributes<HTMLDivElement> {
  item: ActivitiesListItem;
}

const formatDate = (ts: dt.Timestamp): string => dt.format(ts, 'LLL d, yyyy');

const ActivityCard: FC<SurveyCardProps> = ({ item, ...props }) => {
  const dispatch = useAppDispatch();
  const studyId = useSelectedStudyId();

  const handleCardClick = useCallback(() => {
    if (item.status === 'PUBLISHED') {
      dispatch(openActivityResults({ activityId: item.id }));
    } else {
      studyId && dispatch(editActivity({ studyId, activityId: item.id }));
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
          Overall completion:&nbsp;<strong>{`${completionPercents}%`}</strong>
        </FooterPublishedText>
      );
    }

    const ActivityIcon = getActivityIconByType(item.type);

    return (
      <Container {...props} onClick={handleCardClick}>
        <Body>
          <Head>
            <Chips type={isPublished ? 'success' : 'disabled'}>
              {isPublished ? 'Published' : 'Draft'}
            </Chips>
            {isPublished && item.publishedAt && (
              <PublishedAt>{formatDate(item.publishedAt)}</PublishedAt>
            )}
          </Head>
          <Content>
            <Illustration>
              <ActivityIcon />
            </Illustration>
            <Title>{item.title}</Title>
          </Content>
        </Body>
        <Footer>{footer}</Footer>
      </Container>
    );
  };

  const [hoverableElement] = useHover(element);

  return hoverableElement;
};

export default ActivityCard;
