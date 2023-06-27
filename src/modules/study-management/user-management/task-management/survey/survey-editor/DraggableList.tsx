import React, { useEffect, useMemo, useRef } from 'react';
import { useDrag, useDragLayer, useDrop } from 'react-dnd';

import type { Identifier, XYCoord } from 'dnd-core';
import styled from 'styled-components';

import { useLayoutContentRef } from 'src/modules/main-layout/LayoutContentCtx';
import { useAutoScroll, UseAutoScrollParams } from './useAutoScroll';

export type DraggableItem<T> = T & {
  id: string;
  index: number;
  rect?: DOMRect;
};

interface DraggableItemRendererProps<T> {
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
  startPosition?: number;
  item: DraggableItem<T>;
  items: DraggableItem<T>[];
  renderItem: DraggableItemRenderer<T>;
  type: Identifier;
  acceptTypes?: Identifier[];
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
  acceptTypes,
  autoScroll,
}: DraggableItemProps<T>) => {
  const dropRef = useRef<HTMLElement>(null);
  const dragRef = useRef<HTMLElement>(null);

  const [{ isDragging, initialOffset, currentOffset, differentOffset }, drag] = useDrag<
    DraggableItem<T>,
    void,
    DragCollection
  >(
    {
      type,
      item: { ...item, index: position },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
        initialOffset: monitor.getInitialClientOffset() || undefined,
        currentOffset: monitor.getClientOffset() || undefined,
        differentOffset: monitor.getDifferenceFromInitialOffset() || undefined,
      }),
    },
    [item]
  );

  const [{ itm, itmType }, drop] = useDrop<
    DraggableItem<T>,
    unknown,
    { itm: DraggableItem<T>; itmType: Identifier | null }
  >(
    {
      accept: acceptTypes || type,
      options: {
        dropEffect: 'move', // TODO: bug: cursor changing to default
      },
      canDrop: (i, monitor) => i.id !== monitor.getItem().id,
      collect: (monitor) => ({
        itm: monitor.getItem(),
        itmType: monitor.getItemType(),
      }),
      hover(data, monitor) {
        if (!dropRef.current || !moveRow) {
          return;
        }

        const hoverBoundingRect = dropRef.current.getBoundingClientRect();

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
    },
    [items]
  );

  useEffect(() => {
    if (moveRow) {
      drop(dropRef);
      drag(dragRef);
    }
  });

  const scrollContainer = useLayoutContentRef();

  // TODO: needs a better solution
  const isDragActive =
    (isDragging || itm?.id === item?.id) &&
    (!!acceptTypes?.includes(itmType || '') || itmType === type);

  useAutoScroll({
    active: !isPreview && isDragActive,
    scrollContainer,
    ...autoScroll,
  });

  return renderItem({
    dropRef,
    dragRef,
    isDragging: isDragActive,
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

interface DraggableListProps<T> extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  type: Identifier;
  acceptTypes?: Identifier[];
  startPosition?: number;
  items: T[];
  renderItem: DraggableItemRenderer<T>;
  keyExtractor: (item: T) => React.Key;
  onChange?: (items: T[]) => void;
  autoScroll?: Partial<Omit<UseAutoScrollParams, 'active'>>;
}

export const DraggableLayer = styled.div`
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
  acceptTypes,
  onChange,
  keyExtractor,
  startPosition,
  autoScroll,
  ...props
}: DraggableListProps<T>) => {
  const itemsEditable = useMemo(
    () => items.map((it, index) => ({ ...it, index } as DraggableItem<T>)),
    [items]
  );

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

  const moveRow = (dragIndex: number, hoverIndex: number) => {
    const dragItem = itemsEditable[dragIndex];
    const newItemsList = [...itemsEditable];

    if (dragItem) {
      dragItem.index = hoverIndex;

      if (newItemsList[hoverIndex]) {
        newItemsList[hoverIndex] = { ...newItemsList[hoverIndex], index: dragIndex };
      }

      if (dragIndex > -1) {
        newItemsList.splice(dragIndex, 1);
        newItemsList.splice(hoverIndex, 0, dragItem);

        onChange?.(newItemsList);
      }
    }
  };

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

  const startPos = startPosition || 0;

  return (
    <>
      {isDragging ? <DraggableLayer style={style}>{renderPreviewItem()}</DraggableLayer> : null}
      <DraggableListContainer ref={draggableListContainerRef} {...props}>
        {itemsEditable.map((listItem, idx) => (
          <DraggableElement
            key={keyExtractor(listItem)}
            type={type}
            acceptTypes={acceptTypes}
            position={(startPosition ?? 0) + idx}
            item={listItem}
            items={itemsEditable}
            moveRow={(dragIdx, hoverIdx) => moveRow(dragIdx - startPos, hoverIdx - startPos)}
            renderItem={renderItem}
            autoScroll={autoScroll}
          />
        ))}
      </DraggableListContainer>
    </>
  );
};

const DraggableList = <T,>({ ...props }: DraggableListProps<T>) => <DraggableScene {...props} />;

export default DraggableList;
