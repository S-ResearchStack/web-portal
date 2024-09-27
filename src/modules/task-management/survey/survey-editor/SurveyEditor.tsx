import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDragLayer } from 'react-dnd';
import _isEqual from 'lodash/isEqual';
import styled from 'styled-components';

import Button from 'src/common/components/Button';
import Modal from 'src/common/components/Modal';
import Tooltip from 'src/common/components/Tooltip';
import InputImage from 'src/common/components/InputImage';
import Editor from 'src/modules/common/Editor';
import CardSvgLoader from 'src/modules/common/CardSvgLoader';
import ItemListEditor from 'src/modules/common/ItemListEditor';
import PublishTask from '../../publish-task/PublishTask';

import useHistoryChangeOnce from 'src/common/hooks/useHistoryChangeOnce';
import { useAppDispatch } from 'src/modules/store';
import { useLayoutContentRef } from 'src/modules/main-layout/LayoutContentCtx';
import { hideSnackbar } from 'src/modules/snackbar/snackbar.slice';
import { useSelectedStudyId } from 'src/modules/studies/studies.slice';
import { px } from 'src/styles';

import useHandleQuestionDelete from './useHandleQuestionDelete';
import SurveyEditorTitle, { SURVEY_TITLE_DATA_ID } from './SurveyEditorTitle';
import { QuestionEditorCounters } from '../QuestionEditorGroup';
import QuestionCard, { QUESTION_CARD_HEIGHT, QUESTION_CARD_LOADER_TITLE_WIDTH } from './QuestionCard';
import {
  hasSomeSurveyErrors,
  hasSurveyQuestionErrors,
  hasSurveyTitleErrors,
  useSurveyEditor
} from './surveyEditor.slice';

import PlusIcon from 'src/assets/icons/plus.svg';
import SectionsIcon from 'src/assets/icons/sections.svg';

const QuestionActionButton = styled(Button)`
  width: ${px(164)};
`;

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
      <QuestionActionButton data-testid={`add-question-${questionsCount + 1}`} fill="bordered" icon={<PlusIcon />} onClick={onAddQuestion}>
        Add question
      </QuestionActionButton>
    </>
  );
};

const DOCUMENTATION_URL = 'https://developer.samsung.com/health/stack/portal-guide/content-creation/creating-a-survey.html';

const SurveyEditor = () => {
  const { isDragging } = useDragLayer((monitor) => ({
    isDragging: monitor.isDragging(),
  }));

  const {
    isLoading,
    survey,
    surveyErrors,
    addQuestion,
    copyQuestion,
    updateQuestion,
    changeQuestionType,
    removeQuestion,
    generateSurvey,
    validateSurvey,
    updateSurvey,
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

  const studyId = useSelectedStudyId();
  const dispatch = useAppDispatch();
  const layoutContentRef = useLayoutContentRef();

  useHistoryChangeOnce(async () => {
    reset();
  }, [reset]);

  useEffect(() => {
    studyId && generateSurvey({ studyId });
  }, [studyId]);

  const shouldPublish = useCallback(() => {
    const errors = validateSurvey();

    if (!hasSomeSurveyErrors(errors)) {
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
  }, [validateSurvey, layoutContentRef]);

  const onExitPromptCb = useCallback(() => {
    dispatch(hideSnackbar());
  }, [dispatch]);


  const isStudySwitching = useMemo(
    () => !survey.studyId || !_isEqual(studyId, survey.studyId),
    [studyId, survey.studyId]
  );

  const [confirmRemoveOptionCallback, setConfirmRemoveOptionCallback] =
    useCallableState<() => void>();

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

  return (
    <>
      <Editor
        backTitle="TASK MANAGEMENT"
        isSaving={false}
        hasSavingError={false}
        items={survey.questions}
        sectionsEditor={sectionsEditor}
        minCardHeight={QUESTION_CARD_HEIGHT}
        shouldPreviewOpen={shouldPreviewOpen}
        onRequestSavingErrorExit={onExitPromptCb}
        renderHeadEditor={() => (
          <>
            <SurveyEditorTitle
              title={survey.title}
              description={survey.description}
              descriptionPlaceholder="Add survey description (optional)"
              onChangeTitle={(evt) => updateSurvey({ title: evt.target.value })}
              onChangeDescription={(evt) => updateSurvey({ description: evt.target.value })}
              error={surveyErrors?.title.empty}
              loading={!survey.title ? (!survey.id && isLoading) || isStudySwitching : false}
              disableInput={isLoading}
            />
            <InputImage onChange={(file, url) => { updateSurvey({ iconUrl: url }) }} />
          </>
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
        renderPreview={() => <></>}
        floatButton={{
          tooltip: 'Here you can find the documentation for survey creation!',
          href: DOCUMENTATION_URL,
        }}
      />
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
          setConfirmRemoveOptionCallback();
        }}
      />
    </>
  );
};

export default SurveyEditor;
