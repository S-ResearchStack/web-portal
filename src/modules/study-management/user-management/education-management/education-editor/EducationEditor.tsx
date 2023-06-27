import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDragLayer } from 'react-dnd';
import { useHistory, useParams } from 'react-router-dom';
import useNetworkState from 'react-use/lib/useNetworkState';
import usePrevious from 'react-use/lib/usePrevious';
import useUpdateEffect from 'react-use/lib/useUpdateEffect';

import _isEqual from 'lodash/isEqual';

import { PublicationContentItem } from 'src/modules/api';
import { useAppDispatch } from 'src/modules/store';
import { Path } from 'src/modules/navigation/store';
import { useSelectedStudyId } from 'src/modules/studies/studies.slice';
import { useLayoutContentRef } from 'src/modules/main-layout/LayoutContentCtx';
import { useShowSnackbar } from 'src/modules/snackbar';
import { hideSnackbar } from 'src/modules/snackbar/snackbar.slice';
import CardSvgLoader from 'src/modules/study-management/user-management/common/CardSvgLoader';
import useHistoryChangeOnce from 'src/modules/study-management/user-management/common/useHistoryChangeOnce';
import ItemListEditor from 'src/modules/study-management/user-management/common/ItemListEditor';
import Editor from 'src/modules/study-management/user-management/common/Editor';

import EducationCard, {
  EDUCATION_CARD_HEIGHT,
  EDUCATION_CARD_LOADER_TITLE_WIDTH,
} from './EducationCard';
import EducationHeadEditor from './EducationHeadEditor';
import EducationSectionActions from './EducationSectionActions';
import RemoveItemModal from './RemoveItemModal';
import PublishEducationalContent from './PublishEducationalContent';
import EducationPreview from './preview/EducationPreview';
import { usePublishEducationSlice } from './publishEducation.slice';
import {
  hasPublicationItemsErrors,
  hasSomePublicationErrors,
  savePublicationIfRequired,
  useEducationEditor,
} from './educationEditor.slice';
import { useEducationListData } from '../educationList.slice';

const EducationEditor = () => {
  const showSnackbar = useShowSnackbar();

  useDragLayer((monitor) => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    isDragging: monitor.isDragging(),
  }));

  const {
    publication,
    loadPublication,
    savedOn,
    validatePublication,
    savePublication,
    isFailedConnection,
    isSaving,
    lastTouchedOn,
    educationErrors,
    updatePublication,
    isLoading,
    updateItem,
    reset,
    addItem,
    removeItem,
  } = useEducationEditor();

  const pathParams = useParams<{ educationId: string }>();
  const studyId = useSelectedStudyId();
  const networkState = useNetworkState();
  const history = useHistory();
  const dispatch = useAppDispatch();
  const educationList = useEducationListData();
  const { isSending } = usePublishEducationSlice();

  useHistoryChangeOnce(async () => {
    if (lastTouchedOn) {
      !isSending && (await dispatch(savePublicationIfRequired({ force: true })));
      educationList.data && educationList.refetch();
    }
    reset();
  }, [reset, isSending, reset, dispatch, educationList, lastTouchedOn, history]);

  useEffect(() => {
    const snackbarOnLoadError = () =>
      showSnackbar({
        text: "Can't get publication data.",
        duration: 0,
        actionLabel: 'back',
        showErrorIcon: true,
        onAction: () => history.push(Path.StudyManagement),
      });

    studyId &&
      pathParams.educationId &&
      loadPublication({
        studyId,
        educationId: pathParams.educationId,
        onError: snackbarOnLoadError,
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studyId, pathParams.educationId]);

  const layoutContentRef = useLayoutContentRef();

  const handleSavePublication = useCallback(() => {
    const errors = validatePublication();

    if (!hasSomePublicationErrors(errors)) {
      savePublication();
    }
  }, [savePublication, validatePublication]);

  const showOfflineSnackbar = useCallback(() => {
    showSnackbar({
      id: 'education-editor-unsafe-changes-error',
      text: 'This page has unsaved changes. Please try again.',
      duration: 0,
      actionLabel: 'retry',
      showCloseIcon: true,
      showErrorIcon: true,
      onAction: (settings) => {
        settings.hideAfterCall = false;
        handleSavePublication();
      },
    });
  }, [handleSavePublication, showSnackbar]);

  useUpdateEffect(() => {
    if (!lastTouchedOn || isSaving || !isFailedConnection) {
      return;
    }

    if (networkState.online) {
      handleSavePublication();
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
    const errors = validatePublication();

    if (!hasSomePublicationErrors(errors)) {
      savePublication();
      return true;
    }

    const errorTargets = [
      ...errors.items.map((i) => ({
        selector: `[data-id="${i.id}"]`,
        hasError: hasPublicationItemsErrors(i),
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
  }, [validatePublication, savePublication, layoutContentRef]);

  const onExitPromptCb = useCallback(() => {
    dispatch(hideSnackbar());
  }, [dispatch]);

  const hasSavingError = useMemo(
    () => !!isFailedConnection && !!lastTouchedOn,
    [isFailedConnection, lastTouchedOn]
  );

  const isStudySwitching = useMemo(
    () => !publication.studyId || !_isEqual(studyId, publication.studyId),
    [studyId, publication.studyId]
  );

  const loadingState = (!publication.id && isLoading) || isStudySwitching;

  const [itemToDelete, setItemToDelete] = useState<PublicationContentItem | undefined>(undefined);

  const tryRemoveItem = useCallback(
    (item: PublicationContentItem) => {
      const isEmpty =
        item.type === 'IMAGE'
          ? item.images.every((i) => !i.image && !i.caption)
          : !item.text.length;

      if (!isEmpty) {
        setItemToDelete(item);
      } else {
        removeItem(item);
      }
    },
    [removeItem]
  );

  const cancelDeleteItem = useCallback(() => setItemToDelete(undefined), []);

  const acceptDeleteItem = useCallback(() => {
    if (itemToDelete) {
      removeItem(itemToDelete);
      cancelDeleteItem();
    }
  }, [cancelDeleteItem, removeItem, itemToDelete]);

  const isEnabledDnd = !['PDF', 'VIDEO'].includes(publication.source);

  const shouldPreviewOpen = useCallback(() => !isLoading, [isLoading]);

  return (
    <>
      <Editor
        shouldPreviewOpen={shouldPreviewOpen}
        hasSavingError={hasSavingError}
        savedOn={savedOn}
        isSaving={isSaving}
        onRequestSavingErrorExit={onExitPromptCb}
        items={publication.educationContent}
        showSectionActions={false}
        minCardHeight={EDUCATION_CARD_HEIGHT}
        backTitle="EDUCATIONAL CONTENT MANAGEMENT"
        renderHeadEditor={() => (
          <EducationHeadEditor
            type={publication.source}
            title={publication.title}
            category={publication.category ?? ''}
            attachment={publication.attachment}
            loading={!publication.title ? loadingState : false}
            onChange={updatePublication}
            errors={educationErrors}
            disableInput={loadingState}
          />
        )}
        renderItemsEditor={({ ...editorProps }) => (
          <ItemListEditor
            {...editorProps}
            isLoading={loadingState}
            originalItems={publication.educationContent}
            rowGap={16}
            draggable={isEnabledDnd}
            updateItems={(educationContent) => updatePublication({ educationContent })}
            renderLoadingItem={() => (
              <CardSvgLoader
                minHeight={EDUCATION_CARD_HEIGHT}
                titleLoaderWidth={EDUCATION_CARD_LOADER_TITLE_WIDTH}
              />
            )}
            loadingRows={1}
            renderItem={({ item, index, compactCardView }) => (
              <EducationCard
                item={item as PublicationContentItem}
                index={index}
                errors={educationErrors?.items.find((q) => q.id === item.id)}
                onChange={updateItem}
                onRemove={
                  publication.educationContent.map((s) => s.children).flat().length > 1
                    ? tryRemoveItem
                    : undefined
                }
                compact={compactCardView}
              />
            )}
          />
        )}
        renderSectionActions={
          !loadingState && !['VIDEO', 'PDF'].includes(publication.source)
            ? () => (
                <EducationSectionActions
                  onAddImage={() => addItem('IMAGE')}
                  onAddText={() => addItem('TEXT')}
                />
              )
            : undefined
        }
        shouldPublish={shouldPublish}
        renderPublish={({ isOpened, close }) => (
          <PublishEducationalContent open={isOpened} onClose={close} />
        )}
        renderPreview={() => <EducationPreview />}
      />
      <RemoveItemModal
        data={itemToDelete}
        onRequestClose={cancelDeleteItem}
        onRequestAccept={acceptDeleteItem}
      />
    </>
  );
};

export default EducationEditor;
