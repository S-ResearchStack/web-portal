import React, { FC, useMemo, useRef, useState } from 'react';
import { useScrollbarWidth } from 'react-use/lib/useScrollbarWidth';
import useUpdateEffect from 'react-use/lib/useUpdateEffect';

import { XYCoord } from 'dnd-core';
import styled, { css } from 'styled-components';

import Reorder from 'src/assets/icons/reorder.svg';
import ReorderSelected from 'src/assets/icons/reorder_selected.svg';
import { colors, px } from 'src/styles';
import { PREVIEW_SCALE } from 'src/styles/GlobalStyles';
import { usePreviewScreenRef } from 'src/modules/study-management/user-management/common/PreviewScreenCtx';
import { DraggableItemRendererProps } from 'src/modules/study-management/user-management/common/DraggableGrid';
import DraggableList, { DraggableLayer } from '../DraggableList';
import { RankAnswer } from '../questions/common/types';
import { getPreviewEmptyValue } from '../questions/common';

const DRAGGABLE_ITEM_TYPE = 'RANK_PREVIEW';
const OPTION_ITEM_WIDTH = 312;
const OPTION_ITEM_HEIGHT = 56;

const PreviewDraggableListContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  margin-bottom: auto;
  & ${DraggableLayer} {
    top: 0;
  }
`;

const Icon = styled.div`
  width: ${px(40)};
  height: ${px(40)};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const OptionActions = styled.div`
  width: ${px(OPTION_ITEM_WIDTH)};
  height: ${px(OPTION_ITEM_HEIGHT)};
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex: 1;
  padding: 0 ${px(16)};
  cursor: move;
`;

const TextEllipsis = styled.div`
  white-space: nowrap;
  width: ${px(175 / PREVIEW_SCALE)};
  overflow-x: hidden;
  text-overflow: ellipsis;
`;

interface OptionContainerProps {
  isDragging?: boolean;
  isPreview?: boolean;
}

const OptionContainer = styled.div<OptionContainerProps>`
  min-height: ${px(OPTION_ITEM_HEIGHT)};
  height: ${px(OPTION_ITEM_HEIGHT)};
  display: flex;
  justify-content: stretch;
  align-items: center;
  opacity: ${({ isDragging, isPreview }) => (!isPreview && isDragging ? 0 : 1)};
  background-color: ${colors.surface};
  flex: 1;
  box-sizing: content-box;
  border-bottom: ${px(1)} solid ${colors.disabled}};
  ${({ isDragging }) =>
    isDragging &&
    css`
      border-bottom: none;
    `};

  ${OptionActions} {
    ${({ isPreview, theme }) =>
      isPreview &&
      css`
        opacity: 1;
        background-color: ${theme.colors.primary05};
        filter: drop-shadow(0 0 ${px(8)} rgba(32, 87, 213, 0.25)); // TODO unknown color
        color: ${theme.colors.primary};
        font-weight: 600;
      `}
  }
`;

const Option: React.FC<DraggableItemRendererProps<RankAnswer> & { answers: RankAnswer[] }> = ({
  item,
  dragRef,
  dropRef,
  isDragging,
  isPreview,
  currentOffset,
  answers,
}) => {
  const coords: XYCoord = { x: 0, y: 0 };

  const sbw = useScrollbarWidth();

  const xShift = window.scrollbars.visible ? sbw : 0;
  const xPos = -window.innerWidth + OPTION_ITEM_WIDTH + (xShift || 0);

  const previewScreenRef = usePreviewScreenRef();

  if (currentOffset) {
    coords.x = xPos;
    coords.y =
      ((currentOffset?.y || 0) + (previewScreenRef.current?.scrollTop || 0)) / PREVIEW_SCALE - 290;
  }

  const draggedOptionWith = OPTION_ITEM_WIDTH - (sbw || 0);
  const style = isPreview
    ? {
        transform: `translate(${px(coords.x)}, ${px(coords.y)})`,
        minWidth: `${px(draggedOptionWith)}`,
        maxWidth: `${px(draggedOptionWith)}`,
      }
    : {};

  const storedIndex = useMemo(() => {
    const idx = answers.findIndex((a) => a.id === item.id);
    return idx === -1 ? 0 : idx;
  }, [answers, item.id]);

  return (
    <OptionContainer
      ref={dropRef as React.RefObject<HTMLDivElement>}
      isDragging={isDragging}
      isPreview={isPreview}
      style={style}
    >
      <OptionActions ref={dragRef as React.RefObject<HTMLDivElement>}>
        <TextEllipsis>{getPreviewEmptyValue(item.value, storedIndex)}</TextEllipsis>
        <Icon>{isPreview ? <ReorderSelected /> : <Reorder />}</Icon>
      </OptionActions>
    </OptionContainer>
  );
};

type PreviewDraggableListProps = {
  answers: RankAnswer[];
  containerRef?: React.RefObject<HTMLElement>;
};

const PreviewDraggableList: FC<PreviewDraggableListProps> = ({ containerRef, answers }) => {
  const [previewAnswers, setPreviewAnswers] = useState<RankAnswer[]>(answers);
  const boundingContainerRef = useRef<HTMLDivElement>(null);

  useUpdateEffect(() => setPreviewAnswers(answers), [answers]);

  return (
    <PreviewDraggableListContainer ref={boundingContainerRef}>
      <DraggableList
        key="rank_draggable_list"
        data-id="rank_draggable_list"
        type={DRAGGABLE_ITEM_TYPE}
        items={previewAnswers}
        renderItem={(props) => <Option {...props} answers={answers} />}
        keyExtractor={(item) => item.id}
        onChange={setPreviewAnswers}
        autoScroll={{
          scrollContainer: containerRef,
          intersectionContainer: boundingContainerRef,
          scrollRegionHeight: 42,
          maxSpeed: 500,
        }}
      />
    </PreviewDraggableListContainer>
  );
};

export default PreviewDraggableList;
