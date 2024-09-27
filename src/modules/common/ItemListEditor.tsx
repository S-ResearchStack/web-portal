import React, { ReactElement, useRef } from 'react';
import styled, { css } from 'styled-components';
import { Identifier, XYCoord } from 'dnd-core';
import _range from 'lodash/range';

import DragTriggerIcon from 'src/assets/icons/drag_trigger.svg';
import { animation, colors, px } from 'src/styles';
import { EditorItem, EditorSection } from '../task-management/survey/QuestionEditorGroup';
import DraggableList, {
  DraggableItemRenderer,
  DraggableListContainer,
} from '../task-management/survey/survey-editor/DraggableList';

type DraggableItemContainerProps = React.PropsWithChildren<{
  isDragging?: boolean;
  isPreview?: boolean;
  position?: XYCoord;
  $draggable: boolean;
}>;

const draggableItemContainerHoverShadow = css`
  box-shadow: 0 0 ${px(2)} ${colors.black15},
    ${px(10.9232)} ${px(3.64106)} ${px(31.8592)} rgba(1, 38, 116, 0.1);
`;

const getOptionContainerStyles = ({
  isPreview,
  position,
}: DraggableItemContainerProps): React.CSSProperties =>
  isPreview
    ? {
      opacity: position ? 0.7 : 0,
      transform: position ? `translate(${px(position.x)}, ${px(position.y)})` : 'none',
    }
    : {};

const DraggableItemContainer = styled.div.attrs<DraggableItemContainerProps>((props) => ({
  style: getOptionContainerStyles(props),
})) <DraggableItemContainerProps>`
  background-color: ${colors.surface};
  box-shadow: 0 0 ${px(2)} ${colors.black15}, 0 0 0 rgba(1, 38, 116, 0.1); // TODO: unknown color
  transition: box-shadow 300ms ${animation.defaultTiming};
  border-radius: ${px(4)};
  display: flex;
  align-items: stretch;
  opacity: ${({ isDragging }) => (isDragging ? 0 : 1)};

  ${({ isPreview }) =>
    isPreview &&
    css`
      ${draggableItemContainerHoverShadow};
      opacity: 0.7;
    `}

  ${(p) =>
    p.$draggable &&
    css`
      &:hover {
        ${draggableItemContainerHoverShadow};
      }
    `}
`;

const ItemListEditorContainer = styled.div<{ rowGap?: number }>`
  margin-bottom: ${px(40)};
  ${DraggableItemContainer}:not(:last-child) {
    margin-bottom: ${(p) => px(p.rowGap ?? 0)};
  }
`;

const DraggableItemDragTrigger = styled.div.attrs({
  children: <DragTriggerIcon />,
})`
  min-width: ${px(40)};
  background-color: ${colors.primaryLight};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: move;

  > svg {
    fill: ${colors.primary};
  }
`;

const DraggableItemBody = styled.div`
  flex: 1;
`;

type RenderItemParams<D extends EditorItem> = {
  compactCardView: boolean;
  item: D;
  index: number;
  items: D[];
};

type RenderLoadingItemParams = {
  compactCardView: boolean;
};

type ItemListEditorProps<D extends EditorItem, S extends EditorSection<D>> = {
  items: D[];
  originalItems: S[];
  currentSectionId?: string;
  startQuestionsNumber?: number;
  dndType: Identifier;
  dndAcceptTypes?: Identifier[];
  compactCardView: boolean;
  renderItem: (params: RenderItemParams<D>) => ReactElement;
  renderLoadingItem: (params: RenderLoadingItemParams) => ReactElement;
  updateItems: (items: S[]) => void;
  isLoading?: boolean;
  draggable?: boolean;
  rowGap?: number;
  loadingRows?: number;
};

const ItemListEditor = <D extends EditorItem, S extends EditorSection<D>>({
  currentSectionId,
  startQuestionsNumber,
  dndType,
  dndAcceptTypes,
  items,
  compactCardView,
  renderItem,
  updateItems,
  isLoading,
  originalItems,
  draggable = true,
  renderLoadingItem,
  loadingRows = 2,
  rowGap,
}: ItemListEditorProps<D, S>) => {
  const clientY = useRef<number>(0);

  const updateSurveyQuestions = (qs: D[], sectionId?: string) => {
    const excludedIds = qs.map((i) => i.id);

    updateItems(
      originalItems.map((s) => {
        if (s.id === sectionId) {
          return {
            ...s,
            children: qs,
          };
        }

        return {
          ...s,
          children: s.children.filter((i) => !excludedIds.includes(i.id)),
        };
      })
    );
  };

  const renderListItem: DraggableItemRenderer<D> = ({
    item,
    index,
    dropRef,
    dragRef,
    isDragging,
    isPreview,
    currentOffset,
    items: itms,
  }) => {
    const coords =
      isPreview && currentOffset
        ? {
          y: currentOffset.y - clientY.current - 12,
          x: 0,
        }
        : undefined;

    return (
      <DraggableItemContainer
        ref={dropRef as React.RefObject<HTMLDivElement>}
        $draggable={draggable}
        onMouseDown={(evt) => {
          if (dragRef.current && dropRef.current) {
            const dragRect = dragRef.current?.getBoundingClientRect();
            const dropRect = dropRef.current?.getBoundingClientRect();
            const diff = dragRect.y - dropRect.y;

            clientY.current = evt.clientY - dropRect.y - diff;
          }
        }}
        isDragging={isDragging}
        isPreview={isPreview}
        position={coords}
      >
        {draggable && <DraggableItemDragTrigger ref={dragRef as React.RefObject<HTMLDivElement>} />}
        <DraggableItemBody>
          {renderItem({
            compactCardView,
            item,
            index,
            items: itms,
          })}
        </DraggableItemBody>
      </DraggableItemContainer>
    );
  };

  return (
    <ItemListEditorContainer rowGap={rowGap}>
      {isLoading ? (
        <DraggableListContainer>
          {_range(loadingRows).map((idx) => (
            <DraggableItemContainer $draggable={false} key={idx}>
              {renderLoadingItem({ compactCardView })}
            </DraggableItemContainer>
          ))}
        </DraggableListContainer>
      ) : (
        <DraggableList
          type={dndType}
          acceptTypes={dndAcceptTypes}
          items={items}
          startPosition={startQuestionsNumber}
          renderItem={renderListItem}
          keyExtractor={(item) => item.id}
          onChange={(qs) => updateSurveyQuestions(qs, currentSectionId)}
        />
      )}
    </ItemListEditorContainer>
  );
};

export default React.memo(ItemListEditor) as typeof ItemListEditor;
