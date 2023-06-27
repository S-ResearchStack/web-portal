import React, { useCallback, useEffect, useMemo } from 'react';
import { useDragLayer } from 'react-dnd';
import { useHistory, useParams } from 'react-router-dom';
import useNetworkState from 'react-use/lib/useNetworkState';
import usePrevious from 'react-use/lib/usePrevious';
import useUpdateEffect from 'react-use/lib/useUpdateEffect';
import useWindowSize from 'react-use/lib/useWindowSize';

import _isEqual from 'lodash/isEqual';

import { useAppDispatch } from 'src/modules/store';
import { Path } from 'src/modules/navigation/store';
import { useSelectedStudyId } from 'src/modules/studies/studies.slice';
import { useLayoutContentRef } from 'src/modules/main-layout/LayoutContentCtx';
import { useShowSnackbar } from 'src/modules/snackbar';
import { hideSnackbar } from 'src/modules/snackbar/snackbar.slice';
import CardSvgLoader from 'src/modules/study-management/user-management/common/CardSvgLoader';
import EditorTitle from 'src/modules/study-management/user-management/common/EditorTitle';
import useHistoryChangeOnce from 'src/modules/study-management/user-management/common/useHistoryChangeOnce';
import ItemListEditor from 'src/modules/study-management/user-management/common/ItemListEditor';
import Editor from 'src/modules/study-management/user-management/common/Editor';
import { usePublishTaskSlice } from 'src/modules/study-management/user-management/task-management/publish-task/publishTask.slice';
import { GENERIC_SERVER_ERROR_TEXT } from 'src/modules/api/executeRequest';
import { useActivitiesListData } from '../activitiesList.slice';
import PublishTask from '../../publish-task/PublishTask';
import {
  hasActivityItemsErrors,
  hasSomeActivityErrors,
  saveActivityIfRequired,
  useActivityEditor,
  useActivitySections,
} from './activityEditor.slice';
import ActivityCard, {
  ACTIVITY_CARD_HEIGHT,
  ACTIVITY_CARD_LOADER_TITLE_WIDTH,
} from './ActivityCard';
import ActivityTaskPreview from './preview/ActivityTaskPreview';

const DOCUMENTATION_URL = 'http://unknown';

const ActivityEditor = () => {
  const showSnackbar = useShowSnackbar();

  useDragLayer((monitor) => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    isDragging: monitor.isDragging(),
  }));

  const {
    activity,
    loadActivity,
    savedOn,
    validateActivity,
    saveActivity,
    isFailedConnection,
    isSaving,
    lastTouchedOn,
    activityErrors,
    updateActivity,
    isLoading,
    updateQuestion,
    reset,
  } = useActivityEditor();
  const sectionsEditor = useActivitySections();
  const pathParams = useParams<{ activityId: string }>();
  const studyId = useSelectedStudyId();
  const networkState = useNetworkState();
  const history = useHistory();
  const dispatch = useAppDispatch();
  const activityList = useActivitiesListData();
  const { width: windowWidth } = useWindowSize();
  const { isSending } = usePublishTaskSlice();

  useHistoryChangeOnce(async () => {
    if (lastTouchedOn) {
      !isSending && (await dispatch(saveActivityIfRequired({ force: true })));
      activityList.data && activityList.refetch();
    }
    reset();
  }, [isSending, dispatch, activityList, lastTouchedOn, history, reset]);

  useEffect(() => {
    const snackbarOnLoadError = () =>
      showSnackbar({
        text: GENERIC_SERVER_ERROR_TEXT,
        duration: 0,
        actionLabel: 'back',
        showErrorIcon: true,
        onAction: () => history.push(Path.StudyManagement),
      });

    studyId &&
      pathParams.activityId &&
      loadActivity({ studyId, activityId: pathParams.activityId, onError: snackbarOnLoadError });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studyId, pathParams.activityId]);

  const layoutContentRef = useLayoutContentRef();

  const handleSaveActivity = useCallback(() => {
    const errors = validateActivity();

    if (!hasSomeActivityErrors(errors)) {
      saveActivity();
    }
  }, [saveActivity, validateActivity]);

  const showOfflineSnackbar = useCallback(() => {
    showSnackbar({
      id: 'activity-editor-unsafe-changes-error',
      text: 'This page has unsaved changes. Please try again.',
      duration: 0,
      actionLabel: 'retry',
      showCloseIcon: true,
      showErrorIcon: true,
      onAction: (settings) => {
        settings.hideAfterCall = false;
        handleSaveActivity();
      },
    });
  }, [handleSaveActivity, showSnackbar]);

  useUpdateEffect(() => {
    if (!lastTouchedOn || isSaving || !isFailedConnection) {
      return;
    }

    if (networkState.online) {
      handleSaveActivity();
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

  const shouldPreviewOpen = useCallback(() => !isLoading, [isLoading]);

  const shouldPublish = useCallback(() => {
    if (isLoading) {
      return false;
    }

    const errors = validateActivity();
    if (!hasSomeActivityErrors(errors)) {
      saveActivity();
      return true;
    }

    const errorTargets = [
      ...errors.items.map((i) => ({
        selector: `[data-id="${i.id}"]`,
        hasError: hasActivityItemsErrors(i),
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
  }, [isLoading, validateActivity, saveActivity, layoutContentRef]);

  const onExitPromptCb = useCallback(() => {
    dispatch(hideSnackbar());
  }, [dispatch]);

  const hasSavingError = useMemo(
    () => !!isFailedConnection && !!lastTouchedOn,
    [isFailedConnection, lastTouchedOn]
  );

  const isStudySwitching = useMemo(
    () => !activity.studyId || !_isEqual(studyId, activity.studyId),
    [studyId, activity.studyId]
  );

  const loadingState = (!activity.id && isLoading) || isStudySwitching;

  const titleTooltip = useMemo(() => {
    let separator = '';
    if (windowWidth < 1440) {
      separator = '\n';
    }
    const hasNumber = /\d+/;
    const showTooltip = hasNumber.test(activity?.title);
    return showTooltip
      ? [
          'The number is here for portal reference only ',
          'and does not appear in the activity title ',
          'on the app screen.',
        ].join(separator)
      : '';
  }, [activity?.title, windowWidth]);

  return (
    <Editor
      shouldPublish={shouldPublish}
      shouldPreviewOpen={shouldPreviewOpen}
      hasSavingError={hasSavingError}
      savedOn={savedOn}
      isSaving={isSaving}
      onRequestSavingErrorExit={onExitPromptCb}
      items={activity.items}
      sectionsEditor={sectionsEditor}
      showSectionActions={false}
      minCardHeight={ACTIVITY_CARD_HEIGHT}
      backTitle="TASK MANAGEMENT"
      renderHeadEditor={() => (
        <EditorTitle
          title={activity.title}
          titleTooltip={titleTooltip}
          description={activity.description}
          descriptionPlaceholder="Description text goes here (optional)"
          onChangeDescription={(evt) => updateActivity({ description: evt.target.value })}
          loading={!activity.title ? loadingState : false}
          disableInput={loadingState}
          maxDescriptionLength={60}
        />
      )}
      renderItemsEditor={({ ...editorProps }) => (
        <ItemListEditor
          {...editorProps}
          draggable={false}
          isLoading={loadingState}
          originalItems={activity.items}
          rowGap={16}
          updateItems={(items) => updateActivity({ items })}
          renderLoadingItem={() => (
            <CardSvgLoader
              minHeight={ACTIVITY_CARD_HEIGHT}
              titleLoaderWidth={ACTIVITY_CARD_LOADER_TITLE_WIDTH}
            />
          )}
          loadingRows={6}
          renderItem={({ item, index }) => (
            <ActivityCard
              item={item}
              index={index}
              errors={activityErrors?.items.find((q) => q.id === item.id)}
              onChange={updateQuestion}
            />
          )}
        />
      )}
      renderSectionTitle={(p) => `Part ${p.current} of ${p.total}`}
      renderPublish={({ isOpened, close }) => (
        <PublishTask type="activity" open={isOpened} onClose={close} />
      )}
      renderPreview={() => (
        <ActivityTaskPreview
          type={activity.type}
          itemValues={activity.items
            .map((s) => s.children)
            .flat()
            .map(({ value }) => value || {})}
        />
      )}
      floatButton={{
        href: DOCUMENTATION_URL,
      }}
    />
  );
};

export default ActivityEditor;
