import React, { useCallback, useEffect, useMemo, useState } from 'react';
import usePrevious from 'react-use/lib/usePrevious';

import { Identifier } from 'dnd-core';
import differenceWith from 'lodash/differenceWith';

import Modal from 'src/common/components/Modal';
import QuestionEditorGroup from './QuestionEditorGroup';
import ReorderSections from './ReorderSections';
import type {
  EditorItem,
  EditorSection,
  QuestionEditorCounters,
  RenderSectionHeaderParams,
  RenderSectionTitleParams,
} from './QuestionEditorGroup';
import { MIN_SURVEY_SECTIONS } from './survey-editor/surveyEditor.slice';

const DRAGGABLE_ITEM_TYPE = 'DRAGGABLE_ITEM';

const makeDndItemType = (suffix?: string) => `${DRAGGABLE_ITEM_TYPE}-${suffix || ''}`;

export type EditorSections<D extends EditorItem, S extends EditorSection<D>> = {
  sections: S[] | undefined;
  setSections: (sections: S[]) => void;
  updateSection: (section: Partial<Omit<S, 'id'>> & Pick<S, 'id'>) => void;
  removeSection?: (section: Pick<S, 'id'>) => void;
  duplicateSection?: (section: Pick<S, 'id'>) => void;
  mergeSection?: (section: Pick<S, 'id'>) => void;
  addSection?: (parentSectionId?: string, questions?: D[]) => void;
};

export type EditorItemProps<T extends EditorItem> = {
  items: T[];
  currentSectionId?: string;
  startQuestionsNumber?: number;
  dndType: Identifier;
  dndAcceptTypes?: Identifier[];
  compactCardView: boolean;
};

export type RenderSectionActionsParams<
  D extends EditorItem,
  S extends EditorSection<D>
> = QuestionEditorCounters & {
  section: S;
};

interface EditorSectionsManagerProps<D extends EditorItem, S extends EditorSection<D>> {
  compactCardView: boolean;
  sectionsEditor?: EditorSections<D, S>;
  items: S[];
  renderEditor: (item: EditorItemProps<D>) => JSX.Element;
  renderSectionActions?: (params: RenderSectionActionsParams<D, S>) => JSX.Element;
  renderSectionHeader?: (params: RenderSectionHeaderParams<S>) => JSX.Element;
  sectionTitleTooltip?: React.ReactNode;
  renderSectionTitle?: (params: RenderSectionTitleParams) => JSX.Element | string;
  showSectionActions?: boolean;
  minCardHeight: number;
  checkIfShowMergeConfirmNeeds?: (section: S, idx: number, sections: S[]) => boolean;
}

const useDataModal = <T,>() => {
  const [value, setValue] = useState<T | undefined>(undefined);

  return {
    value,
    open: useCallback((id: T) => setValue(id), []),
    cancel: useCallback(() => setValue(undefined), []),
  };
};

const useRemoveSectionModal = <D extends EditorItem, S extends EditorSection<D>>(
  editor: EditorSections<D, S> | undefined
) => {
  const { removeSection } = editor ?? {};
  const dataModal = useDataModal<string>();

  return {
    sectionId: dataModal.value,
    cancel: dataModal.cancel,
    open: dataModal.open,
    accept: useCallback(() => {
      if (dataModal.value) {
        removeSection?.({ id: dataModal.value });
        dataModal.cancel();
      }
    }, [dataModal, removeSection]),
  };
};

const useReorderSectionModal = <D extends EditorItem, S extends EditorSection<D>>(
  editor: EditorSections<D, S> | undefined
) => {
  const { setSections } = editor ?? {};
  const dataModal = useDataModal<string>();

  return {
    sectionId: dataModal.value,
    cancel: dataModal.cancel,
    open: dataModal.open,
    accept: useCallback(
      (s: S[]) => {
        if (dataModal.value) {
          setSections?.(s);
          dataModal.cancel();
        }
      },
      [dataModal, setSections]
    ),
  };
};

const useMergeSectionModal = <D extends EditorItem, S extends EditorSection<D>>(
  editor: EditorSections<D, S> | undefined
) => {
  const { mergeSection } = editor ?? {};
  const dataModal = useDataModal<string>();

  return {
    sectionId: dataModal.value,
    cancel: dataModal.cancel,
    open: dataModal.open,
    accept: useCallback(() => {
      if (dataModal.value) {
        mergeSection?.({ id: dataModal.value });
        dataModal.cancel();
      }
    }, [dataModal, mergeSection]),
  };
};

const useScrollToNewItem = <D extends EditorItem, S extends EditorSection<D>>(sections: S[]) => {
  const items = useMemo(() => sections.map((s) => s.children).flat(), [sections]);

  const prevItems = usePrevious(items);
  const itemsDiff = useMemo(
    () => (prevItems ? differenceWith(items, prevItems, (a, b) => a.id === b.id) : []),
    [items, prevItems]
  );

  useEffect(() => {
    if (prevItems?.length && itemsDiff.length) {
      const elementSelector = `[data-id="${itemsDiff[itemsDiff.length - 1].id}"]`;
      const element = document.querySelector(elementSelector);
      element?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [prevItems, itemsDiff]);
};

const EditorSectionsManager = <D extends EditorItem, S extends EditorSection<D>>({
  compactCardView,
  sectionsEditor,
  renderEditor,
  items,
  renderSectionActions,
  renderSectionHeader,
  renderSectionTitle,
  showSectionActions = true,
  minCardHeight,
  sectionTitleTooltip,
  checkIfShowMergeConfirmNeeds,
}: EditorSectionsManagerProps<D, S>) => {
  const { removeSection, duplicateSection, mergeSection } = sectionsEditor ?? {};

  useScrollToNewItem(items);

  // TODO: need refactor
  const sections = items;

  const removeModal = useRemoveSectionModal<D, S>(sectionsEditor);
  const reorderModal = useReorderSectionModal<D, S>(sectionsEditor);
  const mergeModal = useMergeSectionModal<D, S>(sectionsEditor);

  const acceptTypes = sections?.map((s) => makeDndItemType(s.id));

  const sectionsQuestionCount = useMemo(() => sections.map((s) => s.children.length), [sections]);

  const startQuestionsNumber = (currentSectionPosition: number) =>
    Array.isArray(sectionsQuestionCount)
      ? sectionsQuestionCount
          .slice(0, currentSectionPosition)
          .reduce((counter, value) => counter + value, 0)
      : 0;

  const content =
    sections.length >= MIN_SURVEY_SECTIONS && acceptTypes ? (
      sections.map((s, idx) => {
        const questionsCount = s.children.length;
        const isShowMergeConfirm = checkIfShowMergeConfirmNeeds?.(s, idx, sections);

        return (
          <QuestionEditorGroup
            key={s.id}
            acceptTypes={acceptTypes}
            currentSection={s}
            sectionsEditor={sectionsEditor}
            currentSectionPosition={idx}
            sectionsCount={sections.length}
            onRemoveSection={
              showSectionActions && removeSection ? () => removeSection(s) : undefined
            }
            onRequestSectionRemove={
              showSectionActions && removeSection ? () => removeModal.open(s.id) : undefined
            }
            onSectionDuplicate={
              showSectionActions && duplicateSection ? () => duplicateSection(s) : undefined
            }
            onSectionMerge={
              showSectionActions && mergeSection
                ? () => {
                    isShowMergeConfirm ? mergeModal.open(s.id) : mergeSection(s);
                  }
                : undefined
            }
            onRequestSectionReorder={showSectionActions ? () => reorderModal.open(s.id) : undefined}
            questionsCount={questionsCount}
            renderSectionHeader={renderSectionHeader}
            minCardHeight={minCardHeight}
            sectionTitleTooltip={sectionTitleTooltip}
            renderSectionTitle={renderSectionTitle}
            renderActions={
              renderSectionActions
                ? () =>
                    renderSectionActions({
                      questionsCount,
                      sectionsCount: sections.length,
                      section: s,
                    })
                : undefined
            }
          >
            {React.cloneElement(
              renderEditor({
                compactCardView,
                items: s.children,
                dndType: makeDndItemType(s.id),
                dndAcceptTypes: acceptTypes,
                currentSectionId: s.id,
                startQuestionsNumber: startQuestionsNumber(idx),
              }),
              { key: s.id }
            )}
          </QuestionEditorGroup>
        );
      })
    ) : (
      <QuestionEditorGroup
        minCardHeight={minCardHeight}
        renderSectionTitle={renderSectionTitle}
        questionsCount={items.length}
        renderSectionHeader={renderSectionHeader}
        renderActions={
          renderSectionActions
            ? () =>
                renderSectionActions({
                  questionsCount: sections[0]?.children.length,
                  sectionsCount: sections.length,
                  section: sections[0],
                })
            : undefined
        }
      >
        {renderEditor({
          compactCardView,
          items: sections[0]?.children ?? [],
          dndType: makeDndItemType(),
          currentSectionId: sections[0]?.id,
        })}
      </QuestionEditorGroup>
    );

  return (
    <>
      {content}
      <Modal
        open={!!removeModal.sectionId}
        title="Delete Section"
        description="All questions within this section and all skip logic and rules associated with this section will be deleted. Are you sure do you want to delete it?"
        onAccept={removeModal.accept}
        onDecline={removeModal.cancel}
        declineLabel="Cancel"
        acceptLabel="Delete section"
      />
      <ReorderSections
        open={!!reorderModal.sectionId}
        accentSectionId={reorderModal.sectionId}
        onRequestClose={reorderModal.cancel}
        onChange={reorderModal.accept}
        sections={sections}
      />
      <Modal
        open={!!mergeModal.sectionId}
        title="Merge Sections"
        description="Are you sure you want to merge sections? By doing this, you will lose any associated skip logic."
        onAccept={mergeModal.accept}
        onDecline={mergeModal.cancel}
        declineLabel="Cancel"
        acceptLabel="Merge sections"
      />
    </>
  );
};

export default EditorSectionsManager;
