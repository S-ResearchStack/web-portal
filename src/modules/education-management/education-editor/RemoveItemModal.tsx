import React from 'react';

import Modal, { useModalCachedData } from 'src/common/components/Modal';
import { ItemType } from 'src/modules/api';

type ModalProps = {
  data?: ItemType;
  onRequestClose: () => void;
  onRequestAccept: () => void;
};

const RemoveItemModal = ({ data, onRequestClose, onRequestAccept }: ModalProps) => {
  const { modalProps } = useModalCachedData(data);

  return (
    <Modal
      {...modalProps}
      title="Delete Block"
      description={
        <>
          Are you sure you want to delete?
          <br />
          By doing this, you will lose the content you have entered.
        </>
      }
      declineLabel="Cancel"
      acceptLabel="Delete Block"
      onAccept={onRequestAccept}
      onDecline={onRequestClose}
    />
  );
};

export default RemoveItemModal;
