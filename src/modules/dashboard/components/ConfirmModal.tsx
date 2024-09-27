import React from 'react';
import Modal from 'src/common/components/Modal';
import { useDeleteChart } from '../chart-list/chartList.slice';
import { useSelectedStudyId } from 'src/modules/studies/studies.slice';

export type ConfirmDeleteModalProps = {
  dashboardId: string;
  chart?: string;
  onDeleted: () => void;
  onClose: () => void;
};

const ConfirmDeleteModal = ({ dashboardId, chart, onDeleted, onClose }: ConfirmDeleteModalProps) => {
  const studyId = useSelectedStudyId();
  const { isDeleting, remove } = useDeleteChart();

  const onAcceptDelete = async () => {
    if (!studyId || !chart) return;
    const ok = await remove(studyId, dashboardId, chart);
    if (ok) {
      onClose();
      onDeleted();
    }
  };

  return (
    <Modal
      acceptLabel="Yes"
      declineLabel="No"
      title="Warning"
      description="This chart will be delete permanently from Dashboard. Do you want to delete this chart?"
      open={!!chart}
      acceptProcessing={isDeleting}
      onAccept={onAcceptDelete}
      onDecline={onClose}
    />
  );
};

export default ConfirmDeleteModal;
