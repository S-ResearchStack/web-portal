import React, { useMemo } from 'react';
import styled from 'styled-components';

import Modal, { ModalProps, useModalCachedData } from 'src/common/components/Modal';
import { colors, px, typography } from 'src/styles';
import { ObjectInfo } from 'src/modules/object-storage/utils';
import { getFilenameInfo } from 'src/modules/study-management/participant-management/lab-visit/utils';

const Filename = styled.div`
  ${typography.bodyMediumSemibold};
  color: ${colors.textSecondaryGray};
  margin-top: ${px(8)};
`;

type RemoveDocumentModalProps = {
  data?: ObjectInfo;
  onRequestClose: () => void;
} & Omit<
  ModalProps,
  'open' | 'title' | 'description' | 'acceptLabel' | 'declineLabel' | 'onDecline'
>;

const RemoveDocumentModal = ({ data, onRequestClose, ...props }: RemoveDocumentModalProps) => {
  const { data: cachedData, modalProps } = useModalCachedData(data);
  const filename = useMemo(
    () => cachedData?.name && getFilenameInfo(cachedData?.name).fullName,
    [cachedData?.name]
  );

  return (
    <Modal
      {...props}
      {...modalProps}
      title="Delete file"
      description="Are you sure you want to remove this file?"
      acceptLabel="Delete file"
      declineLabel="Cancel"
      onDecline={onRequestClose}
    >
      <Filename>{filename}</Filename>
    </Modal>
  );
};

export default RemoveDocumentModal;
