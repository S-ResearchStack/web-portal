import React, { useCallback, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import _isEqual from 'lodash/isEqual';

import InputImage from 'src/common/components/InputImage';
import Editor from 'src/modules/common/Editor';
import CardSvgLoader from 'src/modules/common/CardSvgLoader';
import ItemListEditor from 'src/modules/common/ItemListEditor';
import PublishTask from '../../publish-task/PublishTask';

import useHistoryChangeOnce from 'src/common/hooks/useHistoryChangeOnce';
import { Path } from 'src/modules/navigation/store';
import { useAppDispatch } from 'src/modules/store';
import { useLayoutContentRef } from 'src/modules/main-layout/LayoutContentCtx';
import { hideSnackbar } from 'src/modules/snackbar/snackbar.slice';
import { useSelectedStudyId } from 'src/modules/studies/studies.slice';
import { useTranslation } from 'src/modules/localization/useTranslation';

import EditorTitle from './EditorTitle';
import ActivityCard, { ACTIVITY_CARD_HEIGHT, ACTIVITY_CARD_LOADER_TITLE_WIDTH } from './ActivityCard';
import { hasActivityItemsErrors, hasSomeActivityErrors, useActivityEditor, useActivitySections } from './activityEditor.slice';
import { ActivityTaskType, ActivityTaskTypeList } from 'src/modules/api';

const DOCUMENTATION_URL = 'https://developer.samsung.com/health/stack/portal-guide/activities-types/creating-motor-activity.html';

function isActivityTaskType(value: ActivityTaskType) {
  return ActivityTaskTypeList.includes(value);
}

const ActivityCreator = () => {
  const {
    isLoading,
    activity,
    activityErrors,
    reset,
    generateActivity,
    updateActivity,
    updateActivityItem,
    validateActivity,
  } = useActivityEditor();

  const history = useHistory();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const studyId = useSelectedStudyId();
  const sectionsEditor = useActivitySections();
  const layoutContentRef = useLayoutContentRef();
  const { activityType } = useParams<{ activityType: ActivityTaskType }>();

  useHistoryChangeOnce(async () => {
    reset();
  }, [reset]);

  useEffect(() => {
    if (isActivityTaskType(activityType)) {
      studyId && generateActivity({ studyId, activityType });
    } else {
      history.push(Path.TaskManagement);
    }
  }, [studyId, activityType]);

  const onExitPromptCb = useCallback(() => {
    dispatch(hideSnackbar());
  }, [dispatch]);

  const shouldPreviewOpen = useCallback(() => !isLoading, [isLoading]);

  const shouldPublish = useCallback(() => {
    const errors = validateActivity();
    if (!hasSomeActivityErrors(errors)) {
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
  }, [isLoading, layoutContentRef, validateActivity]);

  return (
    <Editor
      backTitle="TASK MANAGEMENT"
      showSectionActions={false}
      hasSavingError={false}
      isSaving={false}
      items={activity.items}
      sectionsEditor={sectionsEditor}
      minCardHeight={ACTIVITY_CARD_HEIGHT}
      shouldPublish={shouldPublish}
      shouldPreviewOpen={shouldPreviewOpen}
      onRequestSavingErrorExit={onExitPromptCb}
      renderHeadEditor={() => (
        <>
          <EditorTitle
            maxDescriptionLength={120}
            title={activity.title}
            description={activity.description}
            errorTitle={activityErrors?.title.empty}
            errorDescription={activityErrors?.description.empty}
            titlePlaceholder={t('PLACEHOLDER_ENTER_ACTIVITY_TITLE')}
            descriptionPlaceholder={t('PLACEHOLDER_ENTER_ACTIVITY_DESCRIPTION')}
            onChangeTitle={(evt) => updateActivity({ title: evt.target.value })}
            onChangeDescription={(evt) => updateActivity({ description: evt.target.value })}
          />
          <InputImage onChange={async (file, url) => updateActivity({ iconUrl: url })} />
        </>
      )}
      renderItemsEditor={({ ...editorProps }) => (
        <ItemListEditor
          {...editorProps}
          rowGap={16}
          loadingRows={6}
          draggable={false}
          isLoading={isLoading}
          originalItems={activity.items}
          updateItems={(items) => updateActivity({ items })}
          renderLoadingItem={() => (
            <CardSvgLoader
              minHeight={ACTIVITY_CARD_HEIGHT}
              titleLoaderWidth={ACTIVITY_CARD_LOADER_TITLE_WIDTH}
            />
          )}
          renderItem={({ item, index }) => (
            <ActivityCard
              item={item}
              index={index}
              errors={activityErrors?.items.find((q) => q.id === item.id)}
              onChange={updateActivityItem}
            />
          )}
        />
      )}
      renderSectionTitle={(p) => `Part ${p.current} of ${p.total}`}
      renderPublish={({ isOpened, close }) => (
        <PublishTask type="activity" open={isOpened} onClose={close} />
      )}
      renderPreview={() => <></>}
      floatButton={{
        tooltip: 'Here you can find the documentation for activity creation!',
        href: DOCUMENTATION_URL,
      }}
    />
  );
};

export default ActivityCreator;
