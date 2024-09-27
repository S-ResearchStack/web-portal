import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import Editor from '../../common/Editor';
import EducationHeaderEditSection from './EducationHeadEditor';
import ItemListEditor from '../../common/ItemListEditor';
import CardSvgLoader from '../../common/CardSvgLoader';
import EducationSectionActions from './EducationSectionActions';
import PublishEducationalContent from './PublishEducation';
import RemoveItemModal from './RemoveItemModal';
import useHistoryChangeOnce from 'src/common/hooks/useHistoryChangeOnce';
import { useSelectedStudyId } from 'src/modules/studies/studies.slice';
import { useLayoutContentRef } from 'src/modules/main-layout/LayoutContentCtx';
import { useShowSnackbar } from 'src/modules/snackbar';
import { useAppDispatch } from 'src/modules/store';
import { hideSnackbar } from 'src/modules/snackbar/snackbar.slice';
import { Path } from 'src/modules/navigation/store';
import EducationCardView, {
  EDUCATION_CARD_HEIGHT,
  EDUCATION_CARD_LOADER_TITLE_WIDTH,
} from './EducationCardView';
import {
  PublicationContentSection,
  useEducationEditor,
  hasSomeEducationErrors,
  EducationItem,
} from './educationEditor.slice';
import {
  EducationalContentType,
  ItemType,
  ScratchContent,
  ImageBlock,
} from 'src/modules/api';

function isEducationType(value: EducationalContentType) {
  const educationalContentTypeList = Object.values(EducationalContentType);
  return educationalContentTypeList.includes(value);
}

export default function EducationEditor() {
  const {
    education,
    errors,
    isSaving,
    isLoading,
    savedOn,
    lastTouchedOn,
    isFailedConnection,
    addItem,
    updateBlock,
    removeBlock,
    updateEducation,
    loadEducation,
    generateEducation,
    validateEducation,
    saveEducation,
    reset,
  } = useEducationEditor();

  const dispatch = useAppDispatch();
  const showSnackbar = useShowSnackbar();
  const history = useHistory();
  const studyId = useSelectedStudyId() || '';
  const layoutContentRef = useLayoutContentRef();

  const { educationType: sourceType } = useParams<{ educationType: EducationalContentType }>();
  const { educationId } = useParams<{ educationId: string }>();

  const [itemToDelete, setItemToDelete] = useState<ItemType | undefined>(undefined);

  const loadingState = !education.id && isLoading || !education.studyId;
  const hasSavingError = useMemo(
    () => !!isFailedConnection && !!lastTouchedOn,
    [isFailedConnection, lastTouchedOn]
  );
  const isEnabledDnd = education.type === EducationalContentType.SCRATCH && (education.content[0].children[0] as ScratchContent)?.blocks?.length > 1;

  useEffect(() => {
    if (!studyId) return;

    const snackbarOnLoadError = () =>
      showSnackbar({
        duration: 0,
        showErrorIcon: true,
        actionLabel: 'back',
        text: "Can't get education data.",
        onAction: () => history.push(Path.EducationalManagement),
      });

    if (!!educationId) loadEducation({ studyId, educationId, onError: snackbarOnLoadError });
    else if (!!sourceType && isEducationType(sourceType)) generateEducation({ studyId, sourceType });
    else history.push(Path.EducationalManagement);
  }, [studyId, sourceType, educationId]);

  useHistoryChangeOnce(async () => {
    reset();
  }, [reset]);

  const handleSave = () => {
    const errors = validateEducation();
    if (hasSomeEducationErrors(errors)) return;

    saveEducation();
  };

  const onExitPromptCb = useCallback(() => {
    dispatch(hideSnackbar());
  }, [dispatch]);

  const shouldPublish = useCallback(() => {
    const errors = validateEducation({ isPublish: true });

    if (!hasSomeEducationErrors(errors)) {
      return true;
    }
    return false;
  }, [validateEducation, layoutContentRef]);

  const tranformIfScratchType = useCallback((education: EducationItem) => {
    if (education.type !== EducationalContentType.SCRATCH)
      return education.content;
    else {
      const content = education.content[0];
      const transformChildren = content?.children[0] as ScratchContent;
      return [{
        ...content,
        children: transformChildren?.blocks || []
      }] as PublicationContentSection[];
    }
  },
    [education, educationId]
  );

  const tryRemoveItem = useCallback(
    (item: ItemType) => {
      const isEmpty =
        item.type === 'IMAGE'
          ? (item as ImageBlock).images.every((i) => !i.url)
          : item.type === 'VIDEO'
            ? !item.url
            : !item.text;

      if (!isEmpty) {
        setItemToDelete(item);
      } else {
        removeBlock(item);
      }
    },
    [removeBlock]
  );

  const cancelDeleteItem = useCallback(() => setItemToDelete(undefined), []);

  const acceptDeleteItem = useCallback(() => {
    if (itemToDelete) {
      removeBlock(itemToDelete);
      cancelDeleteItem();
    }
  }, [cancelDeleteItem, removeBlock, itemToDelete]);

  return (
    <>
      <Editor
        shouldPreviewOpen={() => false}
        showSectionActions={false}
        savedOn={savedOn}
        isSaving={isSaving}
        hasSavingError={hasSavingError}
        shouldPublish={shouldPublish}
        onSave={handleSave}
        onRequestSavingErrorExit={onExitPromptCb}
        items={tranformIfScratchType(education)}
        minCardHeight={EDUCATION_CARD_HEIGHT}
        backTitle="EDUCATIONAL CONTENT MANAGEMENT"
        renderHeadEditor={() => (
          <EducationHeaderEditSection
            type={education.type}
            title={education.title}
            category={education.category}
            loading={!education.title ? loadingState : false}
            onChange={updateEducation}
            errors={errors}
            attachment={education.attachment?.url}
            disableInput={loadingState}
          />
        )}
        renderItemsEditor={({ ...editorProps }) => (
          <ItemListEditor
            {...editorProps}
            isLoading={loadingState}
            originalItems={education.content}
            rowGap={16}
            draggable={isEnabledDnd}
            updateItems={(content) => updateEducation({ content })}
            renderLoadingItem={() => (
              <CardSvgLoader
                minHeight={EDUCATION_CARD_HEIGHT}
                titleLoaderWidth={EDUCATION_CARD_LOADER_TITLE_WIDTH}
              />
            )}
            loadingRows={1}
            renderItem={({ item, index, compactCardView }) => (
              <EducationCardView
                item={item as ItemType}
                index={index}
                errors={errors?.items.find((q) => q.id === item.id)}
                onChange={(item: ItemType) => updateBlock(item)}
                onRemove={isEnabledDnd
                  ? tryRemoveItem
                  : undefined
                }
                compact={compactCardView}
              />
            )}
          />
        )}
        renderSectionActions={
          !loadingState && !['VIDEO', 'PDF'].includes(education.type)
            ? () => (
              <EducationSectionActions
                onAddImage={() => addItem('IMAGE')}
                onAddText={() => addItem('TEXT')}
                onAddVideo={() => addItem('VIDEO')}
              />
            )
            : undefined
        }
        renderPublish={({ isOpened, close }) => (
          <PublishEducationalContent open={isOpened} onClose={close} />
        )}
        renderPreview={() => <></>}
      />
      <RemoveItemModal
        data={itemToDelete}
        onRequestClose={cancelDeleteItem}
        onRequestAccept={acceptDeleteItem}
      />
    </>
  );
}
