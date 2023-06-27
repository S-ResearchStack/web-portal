import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useDrag, useDragLayer, useDrop } from 'react-dnd';

import styled from 'styled-components';
import type { Identifier, XYCoord } from 'dnd-core';

import { px } from 'src/styles';
import { useLayoutContentRef } from 'src/modules/main-layout/LayoutContentCtx';
import {
  useAutoScroll,
  UseAutoScrollParams,
} from 'src/modules/study-management/user-management/task-management/survey/survey-editor/useAutoScroll';

type DraggableItem<T> = T & {
  index: number;
  rect?: DOMRect;
};

export interface DraggableItemRendererProps<T> {
  dragRef: React.RefObject<HTMLElement>;
  dropRef: React.RefObject<HTMLElement>;
  item: T;
  items: T[];
  index: number;
  isDragging: boolean;
  isPreview: boolean;
  initialOffset?: XYCoord;
  currentOffset?: XYCoord;
  differentOffset?: XYCoord;
}

export type DraggableItemRenderer<T> = (options: DraggableItemRendererProps<T>) => JSX.Element;

interface DraggableItemProps<T> extends React.PropsWithChildren {
  position: number;
  item: DraggableItem<T>;
  items: DraggableItem<T>[];
  renderItem: DraggableItemRenderer<T>;
  type: Identifier;
  moveRow?: (dragIndex: number, hoverIndex: number) => void;
  isPreview?: boolean;
  autoScroll?: Partial<Omit<UseAutoScrollParams, 'active'>>;
}

interface DragCollection {
  initialOffset?: XYCoord;
  currentOffset?: XYCoord;
  differentOffset?: XYCoord;
  isDragging: boolean;
}

const DraggableElement = <T,>({
  position,
  item,
  moveRow,
  isPreview,
  items,
  renderItem,
  type,
  autoScroll,
}: DraggableItemProps<T>) => {
  const dropRef = useRef<HTMLElement>(null);
  const dragRef = useRef<HTMLElement>(null);

  const [{ isDragging, initialOffset, currentOffset, differentOffset }, drag] = useDrag<
    DraggableItem<T>,
    void,
    DragCollection
  >({
    type,
    item: { ...item, index: position },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
      initialOffset: monitor.getInitialClientOffset() || undefined,
      currentOffset: monitor.getClientOffset() || undefined,
      differentOffset: monitor.getDifferenceFromInitialOffset() || undefined,
    }),
  });

  const [, drop] = useDrop<DraggableItem<T>>({
    accept: type,
    options: {
      dropEffect: 'move', // TODO: bug: cursor changing to default
    },
    hover(data) {
      if (!dropRef.current || !moveRow) {
        return;
      }

      const dragIndex = data.index;
      const hoverIndex = position;

      if (dragIndex === hoverIndex) {
        return;
      }

      moveRow(dragIndex, hoverIndex);

      data.rect = dropRef.current.getBoundingClientRect();
      data.index = hoverIndex;
    },
  });

  useEffect(() => {
    if (moveRow) {
      drop(dropRef);
      drag(dragRef);
    }
  });

  const scrollContainer = useLayoutContentRef();

  useAutoScroll({
    active: isDragging,
    scrollContainer,
    ...autoScroll,
  });

  return renderItem({
    dropRef,
    dragRef,
    isDragging,
    isPreview: !!isPreview,
    initialOffset,
    currentOffset,
    differentOffset,
    item,
    items,
    index: position,
  });
};

const DraggableGridContainer = styled.div<
  React.HTMLAttributes<HTMLDivElement> & { columns: number; gap?: number }
>`
  display: grid;
  grid-template-columns: repeat(${(p) => p.columns}, ${px(182)});
  gap: ${(p) => px(p.gap ?? 24)};
  position: relative;
`;

interface DraggableGridProps<T> extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  type: Identifier;
  items: T[];
  columns: number;
  renderItem: DraggableItemRenderer<T>;
  keyExtractor: (item: T) => React.Key;
  onChange?: (items: T[]) => void;
  gap?: number;
  autoScroll?: Partial<Omit<UseAutoScrollParams, 'active'>>;
}

const DraggableLayer = styled.div`
  position: fixed;
  pointer-events: none;
  z-index: 100;
  left: 0;
  top: 100%;
  width: 100%;
  height: 100%;
`;

interface DragLayerCollection<T> {
  item: T | null;
  itemType: Identifier | null;
  isDragging: boolean;
}

const DraggableScene = <T,>({
  items,
  renderItem,
  type,
  onChange,
  keyExtractor,
  autoScroll,
  ...props
}: DraggableGridProps<T>) => {
  const itemsEditable = useMemo(() => items.map((it, index) => ({ ...it, index })), [items]);

  const { itemType, isDragging, item } = useDragLayer<DragLayerCollection<DraggableItem<T>>>(
    (monitor) => ({
      item: monitor.getItem(),
      itemType: monitor.getItemType(),
      isDragging: monitor.isDragging(),
    })
  );

  const renderPreviewItem = () => {
    if (type === itemType && item) {
      return (
        <DraggableElement
          type={type}
          isPreview
          position={item.index}
          items={itemsEditable}
          item={item}
          key={keyExtractor(item)}
          renderItem={renderItem}
          autoScroll={autoScroll}
        />
      );
    }

    return null;
  };

  const moveRow = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      const dragItem = itemsEditable[dragIndex];
      const newItemsList = [...itemsEditable];

      dragItem.index = hoverIndex;
      newItemsList[hoverIndex] = { ...newItemsList[hoverIndex], index: dragIndex };

      newItemsList.splice(dragIndex, 1);
      newItemsList.splice(hoverIndex, 0, dragItem);

      onChange?.(newItemsList);
    },
    [itemsEditable, onChange]
  );

  const draggableGridContainerRef = useRef<HTMLDivElement>(null);

  const style = useMemo<React.CSSProperties | undefined>(() => {
    if (!isDragging || !draggableGridContainerRef.current) {
      return undefined;
    }

    const draggableGridContainerRect = draggableGridContainerRef.current.getBoundingClientRect();

    return draggableGridContainerRect
      ? {
          left: 0,
          width: draggableGridContainerRect.width,
        }
      : undefined;
  }, [isDragging]);

  return (
    <>
      {isDragging && <DraggableLayer style={style}>{renderPreviewItem()}</DraggableLayer>}
      <DraggableGridContainer ref={draggableGridContainerRef} {...props}>
        {itemsEditable.map((listItem, idx) => (
          <DraggableElement
            type={type}
            position={idx}
            item={listItem}
            items={itemsEditable}
            moveRow={moveRow}
            key={keyExtractor(listItem)}
            renderItem={renderItem}
          />
        ))}
      </DraggableGridContainer>
    </>
  );
};

const DraggableGrid = <T,>({ ...props }: DraggableGridProps<T>) => <DraggableScene {...props} />;

export default DraggableGrid;
