import type { Identifier, XYCoord } from 'dnd-core';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useDrag, useDragLayer, useDrop } from 'react-dnd';
import styled from 'styled-components';

export type DraggableItem<T> = T & {
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

export interface DraggableItemProps<T> extends React.PropsWithChildren {
  position: number;
  item: DraggableItem<T>;
  items: DraggableItem<T>[];
  renderItem: DraggableItemRenderer<T>;
  type: Identifier;
  moveRow?: (dragIndex: number, hoverIndex: number) => void;
  isPreview?: boolean;
}

interface DragCollection {
  initialOffset?: XYCoord;
  currentOffset?: XYCoord;
  differentOffset?: XYCoord;
  isDragging: boolean;
}

export const DraggableElement = <T,>({
  position,
  item,
  moveRow,
  isPreview,
  items,
  renderItem,
  type,
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
    hover(data, monitor) {
      if (!dropRef.current || !moveRow) {
        return;
      }

      const hoverBoundingRect = dropRef.current.getBoundingClientRect();
      data.rect = hoverBoundingRect;

      const dragIndex = data.index;
      const hoverIndex = position;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverMiddleY = hoverBoundingRect.top + hoverBoundingRect.height / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset?.y || 0;

      if (
        (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) ||
        (dragIndex > hoverIndex && hoverClientY > hoverMiddleY)
      ) {
        return;
      }

      moveRow(dragIndex, hoverIndex);

      data.index = hoverIndex;
    },
  });

  useEffect(() => {
    if (moveRow) {
      drop(dropRef);
      drag(dragRef);
    }
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

export const DraggableListContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  position: relative;
`;

export interface DraggableListProps<T>
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  type: Identifier;
  items: T[];
  renderItem: DraggableItemRenderer<T>;
  keyExtractor: (item: T) => React.Key;
  onChange?: (items: T[]) => void;
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

export interface DragLayerCollection<T> {
  item: T | null;
  itemType: Identifier | null;
  isDragging: boolean;
}

export const DraggableScene = <T,>({
  items,
  renderItem,
  type,
  onChange,
  keyExtractor,
  ...props
}: DraggableListProps<T>) => {
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

  const draggableListContainerRef = useRef<HTMLDivElement>(null);

  const style = useMemo<React.CSSProperties | undefined>(() => {
    if (!isDragging || !draggableListContainerRef.current) {
      return undefined;
    }

    const draggableListContainerRect = draggableListContainerRef.current.getBoundingClientRect();

    return draggableListContainerRect
      ? {
          left: draggableListContainerRect.left,
          width: draggableListContainerRect.width,
        }
      : undefined;
  }, [isDragging]);

  return (
    <>
      {isDragging ? <DraggableLayer style={style}>{renderPreviewItem()}</DraggableLayer> : null}
      <DraggableListContainer ref={draggableListContainerRef} {...props}>
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
      </DraggableListContainer>
    </>
  );
};

const DraggableList = <T,>({ ...props }: DraggableListProps<T>) => <DraggableScene {...props} />;

export default DraggableList;
