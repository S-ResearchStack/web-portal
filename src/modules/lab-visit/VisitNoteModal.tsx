import React, { useCallback, useEffect, useRef, useState } from 'react';
import styled, { css } from 'styled-components';

import * as dt from 'src/common/utils/datetime';
import Modal, { ModalProps, useModalCachedData } from 'src/common/components/Modal';
import { colors, px, typography } from 'src/styles';
import Tooltip from 'src/common/components/Tooltip';
import { LabVisitItem, useEditLabVisit } from './labVisit.slice';

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  padding-right: ${px(35)};
`;

const HeaderCellContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: ${px(7)};
  gap: ${px(16)};
  width: ${px(191)};
  max-width: ${px(191)};
  min-width: ${px(191)};
  padding-right: ${px(16)};
`;

const HeaderCellTitle = styled.div`
  ${typography.headingSmall};
  color: ${colors.textPrimary};
`;

const textEllipsis = css`
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`;

const HeaderCellDescription = styled.div`
  ${textEllipsis};
  ${typography.bodyMediumRegular};
  color: ${colors.textPrimary};
  > span {
    max-width: 100%;
    ${textEllipsis};
  }
`;

type HeaderCellProps = {
  title: string;
  description: string;
};

const isElementEllipsis = (el: HTMLElement) => el.offsetWidth < el.scrollWidth;

const HeaderCell = ({ title, description }: HeaderCellProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isTooltipAllowed, setTooltipAllowed] = useState<boolean>(false);

  useEffect(() => {
    const container = containerRef.current?.firstElementChild;
    if (!(container instanceof HTMLElement)) {
      return;
    }

    setTooltipAllowed(isElementEllipsis(container));
  }, [description]);

  return (
    <HeaderCellContainer>
      <HeaderCellTitle>{title}</HeaderCellTitle>
      <HeaderCellDescription ref={containerRef}>
        <Tooltip
          trigger={isTooltipAllowed ? 'hover' : undefined}
          content={description}
          position="abl"
        >
          {description}
        </Tooltip>
      </HeaderCellDescription>
    </HeaderCellContainer>
  );
};

const NoteBox = styled.div`
  ${typography.bodyMediumRegular};
  color: ${colors.textPrimary};
  padding: ${px(16)};
  border-radius: ${px(4)};
  border: ${px(1)} solid ${colors.primary10};
  margin-top: ${px(24)};
`;

type VisitNoteModalProps = {
  data?: LabVisitItem;
  onRequestClose: () => void;
  onEdit: (item: LabVisitItem) => void;
} & Omit<
  ModalProps,
  'open' | 'title' | 'description' | 'acceptLabel' | 'declineLabel' | 'onAccept' | 'onDecline'
>;

const VisitNoteModal = ({ data, onRequestClose, onEdit, ...props }: VisitNoteModalProps) => {
  const { data: cachedData, modalProps } = useModalCachedData(data);
  const { isEditble } = useEditLabVisit();

  const handleEdit = useCallback(() => {
    cachedData && onEdit(cachedData);
  }, [cachedData, onEdit]);

  return (
    <Modal
      {...props}
      {...modalProps}
      title="Notes"
      acceptLabel="Edit note"
      declineLabel="Cancel"
      disableAccept={!isEditble}
      onAccept={handleEdit}
      onDecline={onRequestClose}
    >
      <Header>
        <HeaderCell title="Participant Email" description={cachedData?.participantEmail ?? '—'} />
        <HeaderCell
          title="Visit Date"
          description={
            cachedData?.startTime ? dt.format(cachedData.startTime, 'ccc, LLL dd, yyyy') : '—'
          }
        />
        <HeaderCell
          title="Visit Time"
          description={cachedData?.startTime ? dt.format(cachedData.startTime, 'hh:mm a') : '—'}
        />
      </Header>
      <NoteBox>{cachedData?.note}</NoteBox>
    </Modal>
  );
};

export default VisitNoteModal;
