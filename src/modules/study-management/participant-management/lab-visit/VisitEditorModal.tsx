import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useSetState from 'react-use/lib/useSetState';
import useInterval from 'react-use/lib/useInterval';
import _isObject from 'lodash/isObject';
import _isEqual from 'lodash/isEqual';
import styled from 'styled-components';

import { useSelectedStudyId } from 'src/modules/studies/studies.slice';
import Modal, { ModalProps, useModalCachedData } from 'src/common/components/Modal';
import { colors, px, typography } from 'src/styles';
import useShowSnackbar from 'src/modules/snackbar/useShowSnackbar';
import { LabVisitItem, useLabVisitParticipantSuggestions, useSaveLabVisit } from './labVisit.slice';
import { ParticipantId } from './ParticipantId';
import { CheckInBy } from './CheckInBy';
import { VisitNotes } from './VisitNotes';
import { VisitDateTime } from './VisitDateTime';
import { VisitDocuments } from './VisitDocuments';

type NecessaryModalProps =
  | 'open'
  | 'onAccept'
  | 'onDecline'
  | 'acceptProcessing'
  | 'onExited'
  | 'onEnter';

const ConfirmCloseModal: FC<Pick<ModalProps, NecessaryModalProps>> = ({ ...props }) => (
  <Modal
    {...props}
    title="Unsaved Changes"
    description={[
      'If you leave this page, any changes you have made will be lost. Are you sure you want to leave this page?',
    ]}
    acceptLabel="Leave page"
    declineLabel="Keep editing"
  />
);

const Container = styled.div``;

const SubTitle = styled.div`
  ${typography.headingXSmall};
  color: ${colors.textPrimary};
  margin-top: ${px(16)};
  margin-bottom: ${px(24)};
`;

const ControlsGrid = styled.div`
  display: grid;
  column-gap: ${px(24)};
  row-gap: ${px(17)};
  grid-template-columns: ${px(369)} ${px(500)};
  grid-template-areas:
    'participant-id visit-start'
    'check-in-by visit-end'
    'notes documents';
`;

type ValidationState = {
  participantId: boolean;
  startTs: boolean;
  endTs: boolean;
  checkInBy: boolean;
  notes: boolean;
  documents: boolean;
};

type VisitEditorModalProps = {
  data?: Partial<LabVisitItem>;
  onRequestClose: () => void;
  onSaved: () => void;
} & Omit<
  ModalProps,
  | 'open'
  | 'size'
  | 'title'
  | 'description'
  | 'acceptLabel'
  | 'declineLabel'
  | 'onAccept'
  | 'onDecline'
>;

const VisitEditorModal = ({ data, onRequestClose, onSaved, ...props }: VisitEditorModalProps) => {
  const showSnackbar = useShowSnackbar();
  const studyId = useSelectedStudyId();

  const [isOpenUnsavedChangesConfirm, setOpenUnsavedChangesConfirm] = useState(false);
  const handleDeclineUnsavedChangesConfirm = useCallback(
    () => setOpenUnsavedChangesConfirm(false),
    []
  );
  const handleAcceptUnsavedChangesConfirm = useCallback(() => {
    setOpenUnsavedChangesConfirm(false);
    onRequestClose();
  }, [onRequestClose]);

  const {
    data: cachedData,
    updateData,
    modalProps,
    baseData,
    updateBaseData,
  } = useModalCachedData(data);
  const { data: rawParticipantSuggestions } = useLabVisitParticipantSuggestions({
    fetchArgs: studyId ? { studyId } : false,
  });

  const participantSuggestions = useMemo(
    () => rawParticipantSuggestions ?? [],
    [rawParticipantSuggestions]
  );

  const { save } = useSaveLabVisit();

  const [{ isSending, hasError }, setSaveProcess] = useSetState<{
    isSending: boolean;
    hasError: boolean;
  }>({ isSending: false, hasError: false });

  const isEdit = !!cachedData?.visitId;

  const [validateStatus, setValidateStatus] = useSetState<ValidationState>({
    participantId: true,
    startTs: true,
    endTs: true,
    checkInBy: true,
    notes: true,
    documents: true,
  });

  const [handleAfterSent, setHandleAfterSent] = useState<{
    cb?: (filePath: string) => Promise<void>;
  }>({});

  const isValid = useMemo(
    () =>
      Object.keys(validateStatus)
        .map((p) => validateStatus[p as keyof typeof validateStatus])
        .every(Boolean),
    [validateStatus]
  );

  const [isUploading, setUploading] = useState(false);

  const isDisabled = !isValid || isUploading;

  const handleDecline = useCallback(() => {
    if (!_isEqual(baseData, cachedData) || handleAfterSent.cb) {
      setOpenUnsavedChangesConfirm(true);
      return;
    }
    onRequestClose();
  }, [handleAfterSent, baseData, cachedData, onRequestClose]);

  const isSavedRef = useRef(false);
  const handleSave = useCallback(async () => {
    if (!cachedData || isDisabled) {
      return;
    }

    function checkVisitDataOrThrow(d: unknown): asserts d is Required<LabVisitItem> {
      if (!_isObject(data)) {
        throw new Error('LabVisitItem does not exist');
      }
    }

    try {
      setSaveProcess({ isSending: true, hasError: false });

      const updatedVisitData = await save(cachedData);

      checkVisitDataOrThrow(updatedVisitData);
      updateData(updatedVisitData);
      updateBaseData(updatedVisitData);

      if (handleAfterSent.cb) {
        await handleAfterSent.cb(updatedVisitData.filesPath);
      }

      setSaveProcess({ isSending: false, hasError: false });
      isSavedRef.current = true;
      onSaved();
      onRequestClose();
    } catch {
      setSaveProcess({ isSending: false, hasError: true });
    }
  }, [
    cachedData,
    isDisabled,
    data,
    setSaveProcess,
    save,
    handleAfterSent,
    updateData,
    onSaved,
    onRequestClose,
    updateBaseData,
  ]);

  const handleSaveRef = useRef(handleSave);
  useEffect(() => {
    handleSaveRef.current = handleSave;
  }, [handleSave]);

  useEffect(() => {
    if (hasError) {
      showSnackbar({
        showErrorIcon: true,
        text: 'Something went wrong while saving. Please try again. ',
        actionLabel: 'RETRY',
        onAction: () => handleSaveRef.current(),
      });
    }
  }, [hasError, showSnackbar]);

  const [maxAllowedTimestamp, setMaxAllowedTimestamp] = useState(Date.now());
  useInterval(
    () => {
      setMaxAllowedTimestamp(Date.now());
    },
    data ? 10 * 1000 : null
  );

  return (
    <>
      <Modal
        {...props}
        {...modalProps}
        title={isEdit ? 'Edit In-Lab Visit' : 'Add In-Lab Visit'}
        size="large"
        acceptLabel="Save"
        declineLabel="Cancel"
        disableAccept={isDisabled}
        acceptProcessing={isSending}
        onAccept={handleSave}
        onDecline={handleDecline}
      >
        <Container>
          <SubTitle>Visit Information</SubTitle>
          {cachedData && (
            <ControlsGrid>
              <ParticipantId
                value={cachedData.participantId ?? ''}
                onChange={(participantId) => updateData({ participantId })}
                suggestions={participantSuggestions ?? []}
                onValidateChange={(participantId) => setValidateStatus({ participantId })}
              />
              <VisitDateTime
                maxAllowedTimestamp={maxAllowedTimestamp}
                duration={[cachedData.startTs, cachedData.endTs]}
                onChange={([startTs, endTs]) => updateData({ startTs, endTs })}
                onValidateChange={([startTs, endTs]) => setValidateStatus({ startTs, endTs })}
              />
              <CheckInBy
                value={cachedData.checkInBy ?? ''}
                onChange={(checkInBy) => updateData({ checkInBy })}
                onValidateChange={(checkInBy) => setValidateStatus({ checkInBy })}
              />
              <VisitNotes
                value={cachedData.notes ?? ''}
                onChange={(notes) => updateData({ notes })}
                onValidateChange={(notes) => setValidateStatus({ notes })}
              />
              <VisitDocuments
                filesPath={cachedData.filesPath}
                onValidateChange={(documents) => setValidateStatus({ documents })}
                onUploadingStatusChange={setUploading}
                setAfterSent={setHandleAfterSent}
              />
            </ControlsGrid>
          )}
        </Container>
      </Modal>
      <ConfirmCloseModal
        open={isOpenUnsavedChangesConfirm}
        onAccept={handleAcceptUnsavedChangesConfirm}
        onDecline={handleDeclineUnsavedChangesConfirm}
      />
    </>
  );
};

export default VisitEditorModal;
