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
import { LabVisitItem, useEditLabVisit, useLabVisitParticipantSuggestions, useLabVisitResearcherSuggestions, useSaveLabVisit } from './labVisit.slice';
import ParticipantEmail from './ParticipantEmail';
import VisitPic from './VisitPic';
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
  subjectNumber: boolean;
  startTime: boolean;
  endTime: boolean;
  picId: boolean;
  note: boolean;
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
  const { isEditble } = useEditLabVisit();

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
    modalProps,
    data: cachedData,
    baseData,
    updateData,
    updateBaseData,
  } = useModalCachedData(data);

  const {
    data: rawParticipantSuggestions
  } = useLabVisitParticipantSuggestions({
    fetchArgs: studyId ? { studyId } : false,
    refetchSilentlyOnMount: true,
  });

  const participantSuggestions = useMemo(
    () => (rawParticipantSuggestions ?? []).map(({ subjectNumber }) => ({ label: subjectNumber, value: subjectNumber })),
    [rawParticipantSuggestions]
  );

  const {
    data: rawResearcherSuggestions
  } = useLabVisitResearcherSuggestions({
    fetchArgs: studyId ? { studyId } : false,
    refetchSilentlyOnMount: true,
  });

  const researcherSuggestions = useMemo(
    () => (rawResearcherSuggestions ?? []).map(({ name }) => name),
    [rawResearcherSuggestions]
  );

  const { save } = useSaveLabVisit();

  const [{ isSending, hasError }, setSaveProcess] = useSetState<{
    isSending: boolean;
    hasError: boolean;
  }>({ isSending: false, hasError: false });

  const isEdit = !!cachedData?.id;

  const [validateStatus, setValidateStatus] = useSetState<ValidationState>({
    subjectNumber: true,
    startTime: true,
    endTime: true,
    picId: true,
    note: true,
    documents: true,
  });

  const [handleAfterSent, setHandleAfterSent] = useState<{
    cb?: (filePaths: string[]) => Promise<void>;
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
        await handleAfterSent.cb(updatedVisitData.filePaths);
      }

      isSavedRef.current = true;
      onSaved();
      onRequestClose();
      setSaveProcess({ isSending: false, hasError: false });
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
              <ParticipantEmail
                value={cachedData.subjectNumber ?? ''}
                suggestions={participantSuggestions ?? []}
                onChange={(subjectNumber) => updateData({ subjectNumber })}
                onValidateChange={(subjectNumber) => setValidateStatus({ subjectNumber })}
              />
              <VisitDateTime
                maxAllowedTimestamp={maxAllowedTimestamp}
                duration={[cachedData.startTime, cachedData.endTime]}
                onChange={([startTime, endTime]) => updateData({ startTime, endTime })}
                onValidateChange={([startTime, endTime]) => setValidateStatus({ startTime, endTime })}
              />
              <VisitPic
                disabled={!isEditble}
                value={cachedData.picId ?? ''}
                suggestions={researcherSuggestions as string[] ?? []}
                onChange={(picId) => updateData({ picId })}
                onValidateChange={(picId) => setValidateStatus({ picId })}
              />
              <VisitNotes
                value={cachedData.note ?? ''}
                onChange={(note) => updateData({ note })}
                onValidateChange={(note) => setValidateStatus({ note })}
              />
              <VisitDocuments
                filePaths={cachedData.filePaths ?? []}
                onChange = {(filePaths) =>  updateData({ filePaths })}
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
