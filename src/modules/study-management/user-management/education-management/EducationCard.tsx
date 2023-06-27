import React, { FC, useCallback } from 'react';

import styled, { css } from 'styled-components';

import { useAppDispatch } from 'src/modules/store';
import { animation, colors, px, typography } from 'src/styles';
import Chips from 'src/modules/study-management/user-management/common/Chips';
import * as dt from 'src/common/utils/datetime';
import { PublicationListItem } from 'src/modules/study-management/user-management/education-management/educationList.slice';
import { editEducationPublication } from './education-editor/educationEditor.slice';
import { getPublicationIconByType } from './education.utils';

const Container = styled.div<{ hoverable?: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: ${px(160)};
  background: ${colors.primaryWhite};
  box-shadow: 0 0 ${px(2)} ${colors.black15};
  border-radius: ${px(4)};
  padding: ${px(16)} ${px(24)};
  transition: box-shadow 0.3s ${animation.defaultTiming};

  ${(p) =>
    p.hoverable &&
    css`
      &:hover {
        box-shadow: 0 ${px(2)} ${px(4)} rgba(71, 71, 71, 0.25); // TODO: unknown color
        cursor: pointer;
      }
    `}
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
  column-gap: ${px(8)};
`;

const Illustration = styled.div`
  margin: ${px(-3)} 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${colors.primaryLight};
  border-radius: ${px(2)};
  width: ${px(48)};
  min-width: ${px(48)};
  height: ${px(48)};
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

interface EducationCardProps extends React.HTMLAttributes<HTMLDivElement> {
  item: PublicationListItem;
}

const formatDate = (ts: dt.Timestamp): string => dt.format(ts, 'LLL d, yyyy');

const EducationCard: FC<EducationCardProps> = ({ item, ...props }) => {
  const dispatch = useAppDispatch();

  const isPublished = item.status === 'PUBLISHED';

  const handleCardClick = useCallback(() => {
    !isPublished && dispatch(editEducationPublication({ educationId: item.id }));
  }, [dispatch, item, isPublished]);

  return (
    <Container {...props} hoverable={!isPublished} onClick={handleCardClick}>
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
          <Illustration>{getPublicationIconByType(item.source)}</Illustration>
          <Title>{item.title}</Title>
        </Content>
      </Body>
      {!isPublished && (
        <Footer>
          <FooterModifiedText>
            {item.modifiedAt ? `Modified on ${formatDate(item.modifiedAt)}` : ''}
          </FooterModifiedText>
        </Footer>
      )}
    </Container>
  );
};

export default EducationCard;
