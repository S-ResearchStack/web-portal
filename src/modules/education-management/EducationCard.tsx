import React, { FC, useCallback, useState } from 'react';

import styled, { css } from 'styled-components';

import { useAppDispatch } from 'src/modules/store';
import { animation, colors, px, typography } from 'src/styles';
import Chips from 'src/modules/common/Chips';
import * as dt from 'src/common/utils/datetime';
import { EducationalContentListItem } from './educationList.slice';
import { editEducationContent } from './education-editor/educationEditor.slice';
import { getEducationalContentIconByType } from './education.utils';
import { useTranslation } from 'src/modules/localization/useTranslation';
import Modal, { ModalProps } from 'src/common/components/Modal';
import IconButton from 'src/common/components/IconButton';
import Trash from 'src/assets/icons/trash_can_small.svg';
import Cancel from 'src/assets/icons/close.svg';
import { useDeleteEducation } from './deleteEducation.slice';
import { useSelectedStudyId } from 'src/modules/studies/studies.slice';

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

type NecessaryModalProps =
  | 'open'
  | 'onAccept'
  | 'onDecline'
  | 'acceptProcessing'
  | 'onExited'
  | 'onEnter';

const ConfirmDeleteModal: FC<Pick<ModalProps, NecessaryModalProps>> = ({ ...props }) => {
  const { t } = useTranslation();
  return (
    <Modal
      {...props}
      title={t('TITLE_CONFIRM_DELETE_EDUCATION')}
      description={[t('CAPTION_CONFIRM_DELETE_EDUCATION')]}
      acceptLabel={t('TITLE_YES')}
      declineLabel={t('TITLE_NO')}
    />
  );
};

const ConfirmCancelModal: FC<Pick<ModalProps, NecessaryModalProps>> = ({ ...props }) => {
  const { t } = useTranslation();
  return (
    <Modal
      {...props}
      title={t('TITLE_CONFIRM_CANCEL_PUBLISH_EDUCATION')}
      description={[t('CAPTION_CONFIRM_CANCEL_PUBLISH_EDUCATION')]}
      acceptLabel={t('TITLE_YES')}
      declineLabel={t('TITLE_NO')}
    />
  );
};

interface EducationCardProps extends React.HTMLAttributes<HTMLDivElement> {
  item: EducationalContentListItem;
  refetchList: () => Promise<void>;
}

const formatDate = (ts: dt.Timestamp): string => dt.format(ts, 'LLL d, yyyy');

const EducationCard: FC<EducationCardProps> = ({ item, refetchList, ...props }) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const [isOpenDeleteConfirm, setIsOpenDeleteConfirm] = useState(false);
  const [isOpenCancelConfirm, setIsOpenCancelConfirm] = useState(false);

  const studyId = useSelectedStudyId();
  const { deleteEducation, isDeleting, cancelEducation, isCanceling } = useDeleteEducation();

  const isPublished = item.status === 'PUBLISHED';

  const handleCardClick = useCallback(() => {
    !isPublished && dispatch(editEducationContent({ educationId: item.id }));
  }, [dispatch, item, isPublished]);

  const handleClickDeleteIcon = useCallback((event: any) => {
    event.stopPropagation();
    setIsOpenDeleteConfirm(true);
  }, []);

  const handleClickCancelIcon = useCallback(() => {
    setIsOpenCancelConfirm(true);
  }, []);

  const handleDecline = useCallback(() => {
    setIsOpenDeleteConfirm(false);
    setIsOpenCancelConfirm(false);
  }, []);

  const handleAcceptDelete = useCallback(async () => {
    studyId && item.id && await deleteEducation({ studyId, educationId: item.id });
    setIsOpenDeleteConfirm(false);
    refetchList();
  }, [studyId, item.id, deleteEducation]);

  const handleAcceptCancel = useCallback(async () => {
    studyId && item.id && await cancelEducation({ studyId, educationId: item.id });
    setIsOpenCancelConfirm(false);
    refetchList();
  }, [studyId, item.id, cancelEducation]);

  return (
    <>
      <Container {...props} hoverable={!isPublished} onClick={handleCardClick}>
        <Body>
          <Head>
            <Chips type={isPublished ? 'success' : 'disabled'}>
              {isPublished ? 'Published' : 'Draft'}
            </Chips>
            {isPublished && item.publishedAt && (
              <PublishedAt>{formatDate(item.publishedAt)}</PublishedAt>
            )}
            {isPublished ? (
              <IconButton data-testid="cancel-education-button" icon={Cancel} color='primaryBluePressed' onClick={handleClickCancelIcon} />
            ) : (
              <IconButton data-testid="delete-education-button" icon={Trash} color='primaryBluePressed' onClick={handleClickDeleteIcon} />
            )}
          </Head>
          <Content>
            <Illustration>{getEducationalContentIconByType(item.type)}</Illustration>
            <Title>{item.title}</Title>
          </Content>
        </Body>
        {!isPublished && (
          <Footer>
            <FooterModifiedText>
              {item.modifiedAt ? `${t('LABEL_MODIFIED_ON')} ${formatDate(item.modifiedAt)}` : ''}
            </FooterModifiedText>
          </Footer>
        )}
      </Container>
      <ConfirmDeleteModal
        open={isOpenDeleteConfirm}
        onAccept={handleAcceptDelete}
        onDecline={handleDecline}
        acceptProcessing={isDeleting}
      />
      <ConfirmCancelModal
        open={isOpenCancelConfirm}
        onAccept={handleAcceptCancel}
        onDecline={handleDecline}
        acceptProcessing={isCanceling}
      />
    </>
  );
};

export default EducationCard;
