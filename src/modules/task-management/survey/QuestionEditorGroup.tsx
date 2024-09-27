import React, { ReactElement, useEffect, useMemo, useRef } from 'react';
import { useDragDropManager, useDrop } from 'react-dnd';
import usePrevious from 'react-use/lib/usePrevious';
import useEvent from 'react-use/lib/useEvent';
import useToggle from 'react-use/lib/useToggle';
import { useTranslation } from 'src/modules/localization/useTranslation';

import styled, { css } from 'styled-components';

import Tooltip from 'src/common/components/Tooltip';
import CollapseSectionButton from 'src/common/components/CollapseSectionButton';
import InfoIcon from 'src/assets/icons/info.svg';
import Button from 'src/common/components/Button';
import MoreIcon from 'src/assets/icons/more.svg';
import { colors, px, typography } from 'src/styles';
import { DraggableItem } from './survey-editor/DraggableList';
import type { EditorSections } from './EditorSectionsManager';

export type EditorItem = {
  id: string;
};

export type EditorSection<D extends EditorItem> = {
  id: string;
  children: D[];
};

const SectionContainer = styled.section`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: ${px(16)};
`;

const SectionChild = styled.div<{ minHeight: number; open: boolean }>`
  min-height: ${(p) => (p.open ? px(p.minHeight) : 0)};
  height: ${(p) => (p.open ? 'auto' : 0)};
  ${(p) =>
    !p.open &&
    css`
      overflow: hidden;
    `};
`;

const SectionHead = styled.section`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SectionContent = styled.section``;

const SectionTrigger = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: ${px(8)};
`;

const SectionTriggerInfo = styled.div`
  svg {
    display: block;
    width: ${px(16)};
    height: ${px(16)};
  }
`;

const SectionDropDown = styled.div`
  position: relative;
`;

const SectionDropDownMenuContainer = styled.div<{ open: boolean }>`
  position: absolute;
  top: 0;
  right: 0;
  z-index: 3;
  width: ${px(200)};
  display: ${(p) => (p.open ? 'flex' : 'none')};
  flex-direction: column;
  align-items: stretch;
  border-radius: ${px(4)};
  border: ${px(1)} solid ${colors.primary};
  overflow: hidden;
`;

const SectionDropDownMenuItem = styled.button`
  ${typography.bodySmallRegular};
  color: ${colors.textPrimary};
  background-color: ${colors.background};
  border: none;
  height: ${px(56)};
  display: flex;
  align-items: center;
  padding: ${px(17.5)} ${px(16)};

  &:focus {
    outline: 0;
  }

  &:hover {
    background-color: ${colors.primaryLight};
    cursor: pointer;
  }
`;

const ITEM_CATCHER_OFFSET_Y = 100;

const ItemNewCatcher = styled.div<{ show: boolean }>`
  display: ${(p) => (p.show ? 'block' : 'none')};
  position: absolute;
  width: 300%;
  left: -100%;
  height: ${px(100 + ITEM_CATCHER_OFFSET_Y)};
  z-index: 100;
`;

const TopNewItemCatcher = styled(ItemNewCatcher)`
  top: ${px(-ITEM_CATCHER_OFFSET_Y)};
`;

const BottomNewItemCatcher = styled(ItemNewCatcher)`
  bottom: ${px(-ITEM_CATCHER_OFFSET_Y)};
`;

type SectionDropDownMenuOption<T> = {
  label: string;
  value: T;
};

type SectionDropDownMenuProps<T> = {
  open: boolean;
  onRequestClose: () => void;
  osSelect: (option: SectionDropDownMenuOption<T>) => void;
  options: SectionDropDownMenuOption<T>[];
};

const SectionDropDownMenu = <T,>({
  open,
  onRequestClose,
  osSelect,
  options,
}: SectionDropDownMenuProps<T>) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEvent(
    'click',
    (evt) => {
      if (open && !containerRef.current?.contains(evt.target as Node)) {
        onRequestClose();
      }
    },
    window,
    true
  );

  const handleItemClick = (option: SectionDropDownMenuOption<T>) => {
    osSelect(option);
    onRequestClose();
  };

  return (
    <SectionDropDownMenuContainer ref={containerRef} open={open}>
      {options.map((option) => (
        <SectionDropDownMenuItem key={option.label} onClick={() => handleItemClick(option)}>
          {option.label}
        </SectionDropDownMenuItem>
      ))}
    </SectionDropDownMenuContainer>
  );
};

enum MenuOptions {
  Duplicate,
  Reorder,
  Merge,
  Delete,
}

const QuestionActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${px(24)};
  margin-top: ${px(-8)};
  margin-bottom: ${px(38)};
  z-index: 3;
`;

const InfoIconStyled = styled(InfoIcon)`
  margin-top: ${px(3)};
  display: block;
`;

export type QuestionEditorCounters = {
  sectionsCount?: number;
  questionsCount: number;
};

export type RenderSectionHeaderParams<S> = {
  section?: S;
};

export type RenderSectionTitleParams = {
  current: number;
  total: number;
};

interface QuestionEditorGroupProps<D extends EditorItem, S extends EditorSection<D>>
  extends React.PropsWithChildren,
  QuestionEditorCounters {
  currentSection?: S;
  currentSectionPosition?: number;
  onRemoveSection?: () => void;
  onRequestSectionRemove?: () => void;
  onSectionDuplicate?: () => void;
  onSectionMerge?: () => void;
  onRequestSectionReorder?: () => void;
  acceptTypes?: string[];
  renderActions?: (params: QuestionEditorCounters) => ReactElement;
  renderSectionHeader?: (params: RenderSectionHeaderParams<S>) => ReactElement;
  renderSectionTitle?: (params: RenderSectionTitleParams) => ReactElement | string;
  minCardHeight: number;
  sectionTitleTooltip?: React.ReactNode;
  sectionsEditor?: EditorSections<D, S>;
}

type UseItemCatcherParams<D extends EditorItem, S extends EditorSection<D>> = {
  sectionsEditor?: EditorSections<D, S>;
  acceptTypes?: string[];
  currentSection?: S;
  strategy: 'push' | 'unshift';
};

const useItemCatcher = <D extends EditorItem, S extends EditorSection<D>>({
  sectionsEditor,
  acceptTypes,
  currentSection,
  strategy,
}: UseItemCatcherParams<D, S>) => {
  const dropRef = useRef<HTMLDivElement>(null);
  const [, drop] = useDrop<DraggableItem<D>>(
    {
      accept: acceptTypes || '',
      hover(data) {
        if (
          sectionsEditor?.sections &&
          currentSection &&
          currentSection.children.findIndex((i) => i.id === data.id) === -1
        ) {
          const newSections = sectionsEditor.sections.map((s) => {
            const filteredChildren = s.children.filter((i) => i.id !== data.id);

            if (s.id === currentSection?.id) {
              return {
                ...s,
                children:
                  strategy === 'unshift'
                    ? [{ ...data }, ...filteredChildren]
                    : [...filteredChildren, { ...data }],
              };
            }

            return {
              ...s,
              children: filteredChildren,
            };
          });

          sectionsEditor.setSections(newSections);
        }
      },
    },
    [currentSection, sectionsEditor, strategy]
  );

  useEffect(() => {
    drop(dropRef);
  });

  return dropRef;
};

const QuestionEditorGroup = <D extends EditorItem, S extends EditorSection<D>>({
  currentSection,
  currentSectionPosition,
  sectionsCount,
  questionsCount,
  children,
  onRemoveSection,
  onRequestSectionRemove,
  onSectionDuplicate,
  onSectionMerge,
  onRequestSectionReorder,
  acceptTypes,
  renderActions,
  renderSectionHeader,
  renderSectionTitle,
  sectionTitleTooltip,
  minCardHeight,
  sectionsEditor,
}: QuestionEditorGroupProps<D, S>) => {
  const prevQuestionsCount = usePrevious(questionsCount);
  const { t } = useTranslation();

  const isOnlyOfSections = !sectionsCount;

  const [isCollapsed, toggleCollapsed] = useToggle(false);
  const [isMenuOpen, toggleMenuOpen] = useToggle(false);

  useEffect(() => {
    if (isCollapsed && isOnlyOfSections) {
      toggleCollapsed(false);
    }
  }, [isCollapsed, isOnlyOfSections, toggleCollapsed]);

  const menuOptions = useMemo(
    () =>
      [
        !!onSectionDuplicate && { label: t('LABEL_QUESTION_SECTION_DUPLICATE'), value: MenuOptions.Duplicate },
        !!onRequestSectionReorder && { label: t('LABEL_QUESTION_SECTION_REORDER'), value: MenuOptions.Reorder },
        !!currentSectionPosition && !!onSectionMerge && { label: t('LABEL_QUESTION_SECTION_MERGE'), value: MenuOptions.Merge },
        !!onRequestSectionRemove && { label: t('LABEL_QUESTION_SECTION_DELETE'), value: MenuOptions.Delete },
      ].filter(Boolean) as SectionDropDownMenuOption<MenuOptions>[],
    [
      currentSectionPosition,
      onRequestSectionRemove,
      onRequestSectionReorder,
      onSectionDuplicate,
      onSectionMerge,
      t,
    ]
  );

  const handleMenuSelection = (option: SectionDropDownMenuOption<MenuOptions>) => {
    ({
      [MenuOptions.Delete]: onRequestSectionRemove,
      [MenuOptions.Duplicate]: onSectionDuplicate,
      [MenuOptions.Merge]: onSectionMerge,
      [MenuOptions.Reorder]: onRequestSectionReorder,
    }[option.value]?.());
  };

  useEffect(() => {
    if (prevQuestionsCount && prevQuestionsCount < questionsCount) {
      toggleCollapsed(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionsCount]);

  const renderContent = () => (
    <SectionChild open={!isCollapsed} minHeight={minCardHeight}>
      {children}
    </SectionChild>
  );

  const renderFooter = () =>
    renderActions && (
      <QuestionActions>{renderActions({ sectionsCount, questionsCount })}</QuestionActions>
    );

  const dragDropManager = useDragDropManager();
  const dragMonitor = dragDropManager.getMonitor();
  const isDragging = dragMonitor.isDragging();
  const dragItem = dragMonitor.getItem();
  const isShowCatcher = isDragging && !currentSection?.children.find((i) => i.id === dragItem.id);

  useEffect(() => {
    if (!isDragging && !questionsCount && currentSection) {
      onRemoveSection?.();
    }
  }, [isDragging, currentSection, questionsCount, onRemoveSection]);

  const topItemCatcherRef = useItemCatcher({
    sectionsEditor,
    acceptTypes,
    currentSection,
    strategy: 'unshift',
  });

  const bottomItemCatcherRef = useItemCatcher({
    sectionsEditor,
    acceptTypes,
    currentSection,
    strategy: 'push',
  });

  return isOnlyOfSections ? (
    <>
      {renderContent()}
      {renderFooter()}
    </>
  ) : (
    <SectionContainer>
      <SectionHead>
        <SectionTrigger>
          <CollapseSectionButton
            onClick={toggleCollapsed}
            title={
              renderSectionTitle?.({
                current: (currentSectionPosition || 0) + 1,
                total: sectionsCount,
              }) ?? ''
            }
          />
          {sectionTitleTooltip && (
            <SectionTriggerInfo>
              <Tooltip content={sectionTitleTooltip} position="r" trigger="hover" arrow>
                <InfoIconStyled />
              </Tooltip>
            </SectionTriggerInfo>
          )}
        </SectionTrigger>
        {menuOptions.length > 0 && (
          <SectionDropDown>
            <Button
              width={24}
              rate="icon"
              fill="text"
              icon={<MoreIcon />}
              onClick={toggleMenuOpen}
            />
            <SectionDropDownMenu
              open={isMenuOpen}
              onRequestClose={toggleMenuOpen}
              osSelect={handleMenuSelection}
              options={menuOptions}
            />
          </SectionDropDown>
        )}
      </SectionHead>
      <SectionContent>
        {renderSectionHeader?.({ section: currentSection })}
        <div style={{ position: 'relative' }}>
          <TopNewItemCatcher ref={topItemCatcherRef} show={isShowCatcher} />
          {renderContent()}
          <BottomNewItemCatcher ref={bottomItemCatcherRef} show={isShowCatcher} />
        </div>
        {renderFooter()}
      </SectionContent>
    </SectionContainer>
  );
};

export default QuestionEditorGroup;
