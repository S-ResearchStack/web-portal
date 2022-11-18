import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { useDragLayer } from 'react-dnd';
import { useHistory, useParams } from 'react-router-dom';
import { useUpdateEffect, useNetworkState } from 'react-use';

import styled from 'styled-components';
import usePrevious from 'react-use/lib/usePrevious';

import { useAppDispatch } from 'src/modules/store';
import { Path } from 'src/modules/navigation/store';
import { useSelectedStudyId } from 'src/modules/studies/studies.slice';
import SimpleGrid from 'src/common/components/SimpleGrid';
import { colors, px } from 'src/styles';
import { useLayoutContentRef } from 'src/modules/main-layout/LayoutContentCtx';
import { useShowSnackbar } from 'src/modules/snackbar';
import { hideSnackbar } from 'src/modules/snackbar/snackbar.slice';
import PublishSurvey from './publish-survey/PublishSurvey';
import Preview from './survey-preview/Preview';
import {
  hasSomeSurveyErrors,
  hasSurveyQuestionErrors,
  hasSurveyTitleErrors,
  useSurveyEditor,
} from './surveyEditor.slice';
import Header, { HEADER_HEIGHT, HEADER_PADDING_TOP } from './Header';
import QuestionsEditor, { SURVEY_TITLE_DATA_ID } from './QuestionsEditor';
import HelpFloatButton from './HelpFloatButton';
import ExitPrompt from './ExitPrompt';

const SurveyEditorContainer = styled.div`
  display: flex;
`;

const ContentContainer = styled.div<{ $previewOpened: boolean }>`
  background-color: ${colors.background};
  width: 100%;
  display: grid;
  grid-template-areas:
    'header'
    'body';
  grid-template-rows: ${px(HEADER_HEIGHT + HEADER_PADDING_TOP)} 1fr;
  grid-template-columns: 1fr;
  position: relative;
`;

const SurveyEditor = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const showSnackbar = useShowSnackbar();

  const [isPublishOpened, setPublishOpened] = useState(false);
  useDragLayer((monitor) => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    isDragging: monitor.isDragging(),
  }));
  const {
    survey,
    loadSurvey,
    savedOn,
    validateSurvey,
    saveSurvey,
    isFailedConnection,
    isSaving,
    lastTouchedOn,
  } = useSurveyEditor();
  const [isPreviewOpened, setPreviewOpened] = useState(false);
  const prevDataLength = usePrevious(survey.questions.length);
  const pathParams = useParams() as { surveyId: string };
  const studyId = useSelectedStudyId();
  const networkState = useNetworkState();
  const history = useHistory();

  useEffect(() => {
    const snackbarOnLoadError = () =>
      showSnackbar({
        text: "Can't get survey data.",
        duration: 0,
        actionLabel: 'back',
        showErrorIcon: true,
        onAction: () => history.push(Path.TrialManagement),
      });

    studyId &&
      pathParams.surveyId &&
      loadSurvey({ studyId, surveyId: pathParams.surveyId, onError: snackbarOnLoadError });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studyId, pathParams.surveyId]);

  const layoutContentRef = useLayoutContentRef();

  // scroll to down as an element should be added or copied

  const handleSaveSurvey = useCallback(() => {
    const errors = validateSurvey();

    if (!hasSomeSurveyErrors(errors)) {
      saveSurvey();
    }
  }, [saveSurvey, validateSurvey]);

  const showOfflineSnackbar = useCallback(() => {
    showSnackbar({
      id: 'survey-editor-unsave-changes-error',
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

  useEffect(() => {
    let timeout: number;

    if (prevDataLength && prevDataLength < survey.questions.length && containerRef.current) {
      timeout = window.setTimeout(() => {
        layoutContentRef.current?.scrollBy({
          top: layoutContentRef.current?.scrollHeight,
          behavior: 'smooth',
        });
      }, 0);
    }

    return () => {
      window.clearTimeout(timeout);
    };
  }, [survey.questions.length, prevDataLength, layoutContentRef]);

  const prevIsFailedConnection = usePrevious(isFailedConnection);

  useEffect(() => {
    if (prevIsFailedConnection && !isFailedConnection) {
      showSnackbar({
        text: 'The changes made offline were synced',
        showSuccessIcon: true,
      });
    }
  }, [isFailedConnection, prevIsFailedConnection, showSnackbar]);

  const handlePublish = useCallback(() => {
    const errors = validateSurvey();

    if (!hasSomeSurveyErrors(errors)) {
      saveSurvey();
      setPublishOpened(true);
      return;
    }

    const errorTargets = [
      {
        selector: `[data-id=${SURVEY_TITLE_DATA_ID}]`,
        hasError: hasSurveyTitleErrors(errors),
      },
      ...errors.questions.map((q) => ({
        selector: `[data-id=${q.id}]`,
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
      return;
    }

    const firstError = errorTargets[0];
    if (firstError) {
      const el = layoutContentRef.current?.querySelector(firstError.selector);
      el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, [validateSurvey, saveSurvey, layoutContentRef]);

  const handleClosePublish = () => setPublishOpened(false);
  const handleClosePreview = () => setPreviewOpened(false);

  const dispatch = useAppDispatch();

  const onExitPromptCb = useCallback(() => {
    dispatch(hideSnackbar());
  }, [dispatch]);

  const hasSavingError = useMemo(
    () => !!isFailedConnection && !!lastTouchedOn,
    [isFailedConnection, lastTouchedOn]
  );

  return (
    <>
      <SurveyEditorContainer ref={containerRef}>
        <ExitPrompt when={hasSavingError} onExitCb={onExitPromptCb} />
        <ContentContainer $previewOpened={isPreviewOpened}>
          <Header
            onPublish={handlePublish}
            onPreview={() => setPreviewOpened(true)}
            showPreview={!isPreviewOpened}
            savedOn={savedOn}
            hasSavingError={hasSavingError}
            isSaving={isSaving}
          />
          <SimpleGrid fullScreen>
            <QuestionsEditor />
          </SimpleGrid>
          <PublishSurvey open={isPublishOpened} onClose={handleClosePublish} />
        </ContentContainer>
        {isPreviewOpened && <Preview isOpen={isPreviewOpened} onClose={handleClosePreview} />}
      </SurveyEditorContainer>
      <HelpFloatButton />
    </>
  );
};

export default SurveyEditor;
