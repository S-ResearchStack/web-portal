import React, { useEffect, useRef, useState } from 'react';

import { XYCoord } from 'dnd-core';
import _omit from 'lodash/omit';
import styled, { css } from 'styled-components';

import Modal from 'src/common/components/Modal';
import DragTriggerIcon from 'src/assets/icons/drag_trigger.svg';
import { withCustomScrollBar } from 'src/common/components/CustomScrollbar';
import { boxShadow, colors, px, typography } from 'src/styles';
import DraggableList, {
  DraggableItemRenderer,
  DraggableLayer,
} from './survey-editor/DraggableList';
import type { EditorItem, EditorSection } from './QuestionEditorGroup';

type SectionItemContainerProps = React.PropsWithChildren<{
  isDragging?: boolean;
  isPreview?: boolean;
  position?: XYCoord;
}>;

const getOptionContainerStyles = ({
  isPreview,
  position,
}: SectionItemContainerProps): React.CSSProperties =>
  isPreview
    ? {
        opacity: position ? 0.7 : 0,
        transform: position ? `translate(${px(position.x)}, ${px(position.y)})` : 'none',
      }
    : {};

const SECTION_ITEM_HEIGHT = 82;
const MAX_VISIBLE_SECTIONS_ITEMS = 6;

const SectionItemContainer = styled.div.attrs<SectionItemContainerProps>((props) => ({
  style: getOptionContainerStyles(props),
}))<SectionItemContainerProps>`
  display: flex;
  align-items: stretch;
  height: ${px(SECTION_ITEM_HEIGHT)};
  background-color: ${colors.surface};
  box-shadow: ${boxShadow.card};
  opacity: ${(p) => (p.isDragging ? 0 : 1)};

  ${(p) =>
    p.isPreview &&
    css`
      opacity: 0.7;
    `}
`;

const SectionItemBody = styled.div<{ accent: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
  gap: ${px(8)};
  padding: 0 ${px(24)};
  border-left: ${px(2)} solid transparent;
  flex: 1;

  ${(p) =>
    p.accent &&
    css`
      border-left: ${px(2)} solid ${colors.primary};
      background-color: ${colors.primaryLight};
    `}
`;

const SectionItemTitle = styled.div`
  ${typography.headingXSmall};
  color: ${colors.textPrimary};
`;

const SectionItemDescription = styled.div`
  ${typography.bodySmallRegular};
  color: ${colors.textSecondaryGray};
`;

const DraggableItemDragTrigger = styled.div.attrs({
  children: <DragTriggerIcon />,
})`
  width: ${px(40)};
  background-color: ${colors.primaryLight};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: move;

  > svg {
    fill: ${colors.primary};
  }
`;

const ModalBody = withCustomScrollBar(styled.div`
  margin-top: ${px(24)};
  max-height: ${px(SECTION_ITEM_HEIGHT * MAX_VISIBLE_SECTIONS_ITEMS)};
  overflow-y: auto;

  ${DraggableLayer} {
    top: 0;
  }
`)``;

const DRAGGABLE_ITEM_TYPE = 'SECTIONS_ITEMS';

type ReorderSectionsProps<D extends EditorItem, S extends EditorSection<D>> = {
  open: boolean;
  accentSectionId?: string;
  onRequestClose: () => void;
  onChange: (sections: S[]) => void;
  sections: S[];
};

const ReorderSectionsModal = <D extends EditorItem, S extends EditorSection<D>>({
  open,
  onRequestClose,
  onChange,
  accentSectionId,
  sections: originalSections,
}: ReorderSectionsProps<D, S>) => {
  const [sections, setSections] = useState<S[] | undefined>(originalSections);

  const clientY = useRef<number>(0);

  useEffect(() => {
    setSections(originalSections);
  }, [originalSections, open]);

  const renderItem: DraggableItemRenderer<S> = ({
    item,
    dropRef,
    dragRef,
    index,
    isDragging,
    isPreview,
    currentOffset,
  }) => {
    const coords =
      isPreview && currentOffset
        ? {
            y: currentOffset.y - clientY.current,
            x: 0,
          }
        : undefined;

    return (
      <SectionItemContainer
        ref={dropRef as React.RefObject<HTMLDivElement>}
        isDragging={isDragging}
        isPreview={isPreview}
        position={coords}
        onMouseDown={(evt) => {
          if (dragRef.current && dropRef.current) {
            const dragRect = dragRef.current?.getBoundingClientRect();
            const dropRect = dropRef.current?.getBoundingClientRect();
            const diff = dragRect.y - dropRect.y;

            clientY.current = evt.clientY - dropRect.y - diff;
          }
        }}
      >
        <DraggableItemDragTrigger ref={dragRef as React.RefObject<HTMLDivElement>} />
        <SectionItemBody accent={item.id === accentSectionId}>
          <SectionItemTitle>
            {/* TODO: rewrite to generic solution */}
            {'title' in item && item.title ? (item.title as string) : 'Untitled'}
          </SectionItemTitle>
          <SectionItemDescription>{`Section ${index + 1} of ${
            sections?.length || 0
          }`}</SectionItemDescription>
        </SectionItemBody>
      </SectionItemContainer>
    );
  };

  const handleAcceptChanges = () => {
    if (!sections) {
      return;
    }

    onChange(sections.map((s) => _omit(s, ['index']) as S));
  };

  const handleModalExited = () => setSections(undefined);

  return (
    <Modal
      open={open}
      title="Reorder Sections"
      description="If you want to move sections, use the drag handle on the left"
      onAccept={handleAcceptChanges}
      onDecline={onRequestClose}
      declineLabel="Cancel"
      acceptLabel="Save changes"
      onExited={handleModalExited}
    >
      <ModalBody>
        <DraggableList
          type={DRAGGABLE_ITEM_TYPE}
          items={sections ?? []}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          onChange={setSections}
        />
      </ModalBody>
    </Modal>
  );
};

export default ReorderSectionsModal;
