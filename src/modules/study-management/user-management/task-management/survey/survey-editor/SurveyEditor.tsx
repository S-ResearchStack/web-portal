import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDragLayer } from 'react-dnd';
import { useHistory, useParams } from 'react-router-dom';
import useNetworkState from 'react-use/lib/useNetworkState';
import usePrevious from 'react-use/lib/usePrevious';
import useUpdateEffect from 'react-use/lib/useUpdateEffect';

import styled from 'styled-components';
import _isEqual from 'lodash/isEqual';

import { useAppDispatch } from 'src/modules/store';
import { Path } from 'src/modules/navigation/store';
import { useSelectedStudyId } from 'src/modules/studies/studies.slice';
import { colors, px } from 'src/styles';
import { useLayoutContentRef } from 'src/modules/main-layout/LayoutContentCtx';
import { useShowSnackbar } from 'src/modules/snackbar';
import { hideSnackbar } from 'src/modules/snackbar/snackbar.slice';
import EditorTitle, {
  SURVEY_TITLE_DATA_ID,
} from 'src/modules/study-management/user-management/common/EditorTitle';
import Button from 'src/common/components/Button';
import Tooltip from 'src/common/components/Tooltip';
import CardSvgLoader from 'src/modules/study-management/user-management/common/CardSvgLoader';
import SectionsIcon from 'src/assets/icons/sections.svg';
import PlusIcon from 'src/assets/icons/plus.svg';
import Modal from 'src/common/components/Modal';
import { InputFieldProps, StyledTextField } from 'src/common/components/InputField';
import PublishTask from 'src/modules/study-management/user-management/task-management/publish-task/PublishTask';
import useHistoryChangeOnce from 'src/modules/study-management/user-management/common/useHistoryChangeOnce';
import ItemListEditor from 'src/modules/study-management/user-management/common/ItemListEditor';
import Editor from 'src/modules/study-management/user-management/common/Editor';
import { usePublishTaskSlice } from 'src/modules/study-management/user-management/task-management/publish-task/publishTask.slice';
import withLocalDebouncedState from 'src/common/withLocalDebouncedState';
import { GENERIC_SERVER_ERROR_TEXT } from 'src/modules/api/executeRequest';
import { useSurveyListData } from '../surveyList.slice';
import SurveyPreview from './survey-preview/SurveyPreview';
import {
  hasSomeSurveyErrors,
  hasSurveyQuestionErrors,
  hasSurveyTitleErrors,
  saveSurveyIfRequired,
  SurveySection,
  useSurveyEditor,
} from './surveyEditor.slice';
import EditSkipLogicDrawer from './skip-logic/EditSkipLogicDrawer';
import { QuestionEditorCounters } from '../QuestionEditorGroup';
import QuestionCard, {
  QUESTION_CARD_HEIGHT,
  QUESTION_CARD_LOADER_TITLE_WIDTH,
} from './QuestionCard';
import useHandleQuestionDelete from './useHandleQuestionDelete';

const QuestionActionButton = styled(Button)`
  width: ${px(164)};
`;

const SectionTitle = withLocalDebouncedState<HTMLInputElement, InputFieldProps>(styled(
  StyledTextField
)`
  background-color: ${colors.onPrimary};
  margin-top: ${px(8)};
  margin-bottom: ${px(40)};
`);

type EditorSectionActionsProps = QuestionEditorCounters & {
  onAddSection: () => void;
  onAddQuestion: () => void;
};

const useCallableState = <T,>(fn?: T) => {
  const [state, setState] = useState<{ fn?: T }>({ fn });
  return [state.fn, useCallback((func?: T) => setState({ fn: func }), [])] as const;
};

const EditorSectionActions = ({
  sectionsCount,
  questionsCount,
  onAddSection,
  onAddQuestion,
}: EditorSectionActionsProps) => {
  const isShowAddSectionTooltip = !sectionsCount && questionsCount > 1;

  return (
    <>
      <Tooltip
        show={!isShowAddSectionTooltip ? false : undefined}
        content="By adding a section your existing questions will all appear on the same page."
        position="l"
        trigger={isShowAddSectionTooltip ? 'hover' : undefined}
        arrow
      >
        <QuestionActionButton fill="text" icon={<SectionsIcon />} onClick={onAddSection}>
          Add section
        </QuestionActionButton>
      </Tooltip>
      <QuestionActionButton fill="bordered" icon={<PlusIcon />} onClick={onAddQuestion}>
        Add question
      </QuestionActionButton>
    </>
  );
};

const DOCUMENTATION_URL = 'https://s-healthstack.io/creating-a-survey.html';

const SurveyEditor = () => {
  const showSnackbar = useShowSnackbar();

  const { isDragging } = useDragLayer((monitor) => ({
    isDragging: monitor.isDragging(),
  }));

  const {
    addQuestion,
    survey,
    loadSurvey,
    savedOn,
    validateSurvey,
    saveSurvey,
    isFailedConnection,
    isSaving,
    lastTouchedOn,
    surveyErrors,
    updateSurvey,
    isLoading,
    updateQuestion,
    copyQuestion,
    removeQuestion,
    changeQuestionType,
    addSection,
    removeSection,
    duplicateSection,
    mergeSection,
    updateSection,
    setSections,
    reset,
  } = useSurveyEditor({
    canRecalculateSections: () => !isDragging,
  });

  const sectionsEditor = {
    sections: survey.questions,
    addSection,
    removeSection,
    duplicateSection,
    mergeSection,
    updateSection,
    setSections,
  };

  const pathParams = useParams<{ surveyId: string }>();
  const studyId = useSelectedStudyId();
  const networkState = useNetworkState();
  const history = useHistory();
  const surveyList = useSurveyListData({ fetchArgs: false });
  const dispatch = useAppDispatch();
  const { isSending } = usePublishTaskSlice();

  useHistoryChangeOnce(async () => {
    if (lastTouchedOn) {
      !isSending && (await dispatch(saveSurveyIfRequired({ force: true })));
      surveyList.data && surveyList.refetch();
    }
    reset();
  }, [isSending, dispatch, surveyList, lastTouchedOn, history, reset]);

  useEffect(() => {
    const onLoadError = () => {
      showSnackbar({
        text: GENERIC_SERVER_ERROR_TEXT,
        duration: 0,
        actionLabel: 'back',
        showErrorIcon: true,
        onAction: () => history.push(Path.StudyManagement),
      });
    };

    studyId &&
      pathParams.surveyId &&
      loadSurvey({ studyId, surveyId: pathParams.surveyId, onError: onLoadError });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studyId, pathParams.surveyId]);

  const layoutContentRef = useLayoutContentRef();

  const handleSaveSurvey = useCallback(() => {
    const errors = validateSurvey();

    if (!hasSomeSurveyErrors(errors)) {
      saveSurvey();
    }
  }, [saveSurvey, validateSurvey]);

  const showOfflineSnackbar = useCallback(() => {
    showSnackbar({
      id: 'survey-editor-unsafe-changes-error',
      text: 'This page has unsaved changes. Please try again.',
      duration: 0,
      actionLabel: 'retry',
      showCloseIcon: true,
      showErrorIcon: true,
      onAction: (settings) => {
        settings.hideAfterCall = false;
        handleSaveSurvey();
      },
    });
  }, [handleSaveSurvey, showSnackbar]);

  useUpdateEffect(() => {
    if (!lastTouchedOn || isSaving || !isFailedConnection) {
      return;
    }

    if (networkState.online) {
      handleSaveSurvey();
    }
  }, [networkState.online]);

  useUpdateEffect(() => {
    if (isFailedConnection && !isSaving) {
      showOfflineSnackbar();
    }
  }, [isSaving]);

  const prevIsFailedConnection = usePrevious(isFailedConnection);

  useEffect(() => {
    if (prevIsFailedConnection && !isFailedConnection) {
      showSnackbar({
        text: 'The changes made offline were synced',
        showSuccessIcon: true,
      });
    }
  }, [isFailedConnection, prevIsFailedConnection, showSnackbar]);

  const shouldPublish = useCallback(() => {
    const errors = validateSurvey();

    if (!hasSomeSurveyErrors(errors)) {
      saveSurvey();
      return true;
    }

    const errorTargets = [
      {
        selector: `[data-id="${SURVEY_TITLE_DATA_ID}"]`,
        hasError: hasSurveyTitleErrors(errors),
      },
      ...errors.questions.map((q) => ({
        selector: `[data-id="${q.id}"]`,
        hasError: hasSurveyQuestionErrors(q),
      })),
    ].filter((t) => t.hasError);

    const isVisible = (selector: string) => {
      const el = layoutContentRef.current?.querySelector(selector);
      const rect = el?.getBoundingClientRect();
      if (!rect) {
        return false;
      }

      const isYVisible = (y: number) => y > 0 && y < window.innerHeight;
      return isYVisible(rect.top) && isYVisible(rect.bottom);
    };

    const isSomeErrorVisible = errorTargets.some((et) => isVisible(et.selector));
    if (isSomeErrorVisible) {
      return false;
    }

    const firstError = errorTargets[0];
    if (firstError) {
      const el = layoutContentRef.current?.querySelector(firstError.selector);
      el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }

    return false;
  }, [validateSurvey, saveSurvey, layoutContentRef]);

  const onExitPromptCb = useCallback(() => {
    dispatch(hideSnackbar());
  }, [dispatch]);

  const hasSavingError = useMemo(
    () => !!isFailedConnection && !!lastTouchedOn,
    [isFailedConnection, lastTouchedOn]
  );

  const isStudySwitching = useMemo(
    () => !survey.studyId || !_isEqual(studyId, survey.studyId),
    [studyId, survey.studyId]
  );

  const [confirmRemoveOptionCallback, setConfirmRemoveOptionCallback] =
    useCallableState<() => void>(undefined);

  const deleteHandler = useHandleQuestionDelete({
    survey,
    onDeleteConfirmed(q) {
      removeQuestion(q);
    },
  });

  const shouldPreviewOpen = useCallback(() => !isLoading, [isLoading]);

  const isDeleteButtonVisible = useMemo(
    () => survey.questions.map((s) => s.children).flat().length > 1,
    [survey.questions]
  );

  const checkIfShowMergeConfirmNeeds = (
    section: SurveySection,
    idx: number,
    sections: SurveySection[]
  ): boolean => idx > 0 && sections[idx - 1].children.some((i) => !!i.skipLogic);

  return (
    <>
      <Editor
        shouldPreviewOpen={shouldPreviewOpen}
        hasSavingError={hasSavingError}
        savedOn={savedOn}
        isSaving={isSaving}
        onRequestSavingErrorExit={onExitPromptCb}
        items={survey.questions}
        minCardHeight={QUESTION_CARD_HEIGHT}
        sectionsEditor={sectionsEditor}
        backTitle="TASK MANAGEMENT"
        checkIfShowMergeConfirmNeeds={checkIfShowMergeConfirmNeeds}
        renderHeadEditor={() => (
          <EditorTitle
            title={survey.title}
            description={survey.description}
            descriptionPlaceholder="Add survey description (optional)"
            onChangeTitle={(evt) => updateSurvey({ title: evt.target.value })}
            onChangeDescription={(evt) => updateSurvey({ description: evt.target.value })}
            error={surveyErrors?.title.empty}
            loading={!survey.title ? (!survey.id && isLoading) || isStudySwitching : false}
            disableInput={isLoading}
          />
        )}
        renderItemsEditor={({ ...editorProps }) => (
          <ItemListEditor
            {...editorProps}
            isLoading={(!survey.id && isLoading) || isStudySwitching}
            originalItems={survey.questions}
            rowGap={32}
            updateItems={(questions) => updateSurvey({ questions })}
            renderLoadingItem={() => (
              <CardSvgLoader
                titleLoaderWidth={QUESTION_CARD_LOADER_TITLE_WIDTH}
                minHeight={QUESTION_CARD_HEIGHT}
              />
            )}
            renderItem={({ item, index, compactCardView }) => (
              <QuestionCard
                surveyId={survey.id}
                question={item}
                index={index}
                errors={surveyErrors?.questions.find((q) => q.id === item.id)}
                compactCardView={compactCardView}
                isDeleteButtonVisible={isDeleteButtonVisible}
                onCopy={copyQuestion}
                onChange={updateQuestion}
                onRemove={deleteHandler.tryDeleteQuestion}
                onUpdateQuestionType={changeQuestionType}
                confirmOptionRemoval={setConfirmRemoveOptionCallback}
              />
            )}
          />
        )}
        sectionTitleTooltip="All questions in the section appear on the same page in the participant app."
        renderSectionTitle={({ current, total }) => `Section ${current} of ${total}`}
        renderSectionHeader={({ section }) => (
          <SectionTitle
            placeholder="Enter section title (optional)"
            value={section?.title || ''}
            onChange={(evt) =>
              section && sectionsEditor.updateSection({ ...section, title: evt.target.value })
            }
            maxLength={90}
          />
        )}
        renderSectionActions={({ section, ...actionsProps }) => (
          <EditorSectionActions
            {...actionsProps}
            onAddSection={() => sectionsEditor.addSection(section.id)}
            onAddQuestion={() => addQuestion(section.id)}
          />
        )}
        shouldPublish={shouldPublish}
        renderPublish={({ isOpened, close }) => (
          <PublishTask type="survey" open={isOpened} onClose={close} />
        )}
        renderPreview={() => <SurveyPreview />}
        floatButton={{
          tooltip: 'Here you can find the documentation for survey creation!',
          href: DOCUMENTATION_URL,
        }}
      />
      <EditSkipLogicDrawer />
      {deleteHandler.modalElements}
      <Modal
        open={!!confirmRemoveOptionCallback}
        title="Delete Option"
        description="Are you sure you want to delete this option? By doing this, you will lose any associated skip logic."
        acceptLabel="Delete option"
        declineLabel="Cancel"
        onDecline={() => setConfirmRemoveOptionCallback(undefined)}
        onAccept={() => {
          confirmRemoveOptionCallback?.();
          setConfirmRemoveOptionCallback(undefined);
        }}
      />
    </>
  );
};

export default SurveyEditor;
