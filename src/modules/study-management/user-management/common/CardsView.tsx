import React, { FC, useMemo, useRef, useState } from 'react';
import useToggle from 'react-use/lib/useToggle';
import TransitionGroup from 'react-transition-group/TransitionGroup';
import CSSTransition, { CSSTransitionProps } from 'react-transition-group/CSSTransition';

import styled from 'styled-components';
import _uniqueId from 'lodash/uniqueId';
import _range from 'lodash/range';

import { animation, colors, px, typography } from 'src/styles';
import Button from 'src/common/components/Button';
import SimpleGrid, {
  SimpleGridSchema,
  getValuesByMatchedDevice,
  createEmptyGridSchema,
} from 'src/common/components/SimpleGrid';

import Badge from '../task-management/survey/Badge';
import { SurveyCardLoading } from '../task-management/survey/SurveyCard';

const CARD_HEIGHT = 160;
const CARD_SHADOW_SIZE = 4;
const CARD_SHADOW_DOUBLE_SIZE = CARD_SHADOW_SIZE * 2;
const ANIMATION_DURATION = 800;
const FADE_CLASS_NAME = _uniqueId('fade');

const calculateCollapseHeight = (maxRowsCount: number, gridSchema: SimpleGridSchema) =>
  (CARD_HEIGHT + gridSchema.gridGap) * maxRowsCount - gridSchema.gridGap + CARD_SHADOW_DOUBLE_SIZE;

const CardsGridContainer = styled.div`
  margin-bottom: ${px(16)};
`;

const CardsTitleContainer = styled.div`
  display: flex;
  align-items: center;
  height: ${px(48)};
  margin-top: ${px(8)};

  ${Badge} {
    margin-left: ${px(8)};
  }
`;

const CardsHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const CardsTitle = styled.h3`
  ${typography.bodySmallSemibold};
  color: ${colors.textPrimary};
  padding: 0;
  margin: 0;
`;

const CardsSwitchViewButton = styled(Button)<{ showAll: boolean }>`
  width: ${({ showAll }) => (showAll ? px(69) : px(56))};

  > div:first-child {
    display: flex;
    justify-content: end;
    ${typography.bodySmallSemibold};
    color: ${colors.primary};
  }
`;

const CardsGrid = styled.div<{ minHeight: number }>`
  min-height: ${(p) => px(p.minHeight)};
`;

const FadeContainer = styled(CSSTransition)`
  transition: opacity ${ANIMATION_DURATION}ms ${animation.defaultTiming};

  &.${FADE_CLASS_NAME}-enter {
    opacity: 0;
  }

  &.${FADE_CLASS_NAME}-enter-active {
    opacity: 1;
  }

  &.${FADE_CLASS_NAME}-exit {
    opacity: 1;
  }

  &.${FADE_CLASS_NAME}-exit-active {
    opacity: 0;
  }
`;

type FadeAnimationProps = React.PropsWithChildren<Partial<CSSTransitionProps>>;

const FadeAnimation: FC<FadeAnimationProps> = ({ key, in: inProp, children }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <FadeContainer
      nodeRef={containerRef}
      key={key}
      in={inProp}
      classNames={FADE_CLASS_NAME}
      timeout={ANIMATION_DURATION}
      unmountOnExit
      mountOnEnter
    >
      <div ref={containerRef}>{children}</div>
    </FadeContainer>
  );
};

const CollapseContainer = styled.div<{ maxHeight: number }>`
  overflow: hidden;
  margin: ${px(-CARD_SHADOW_SIZE)};
  padding: ${px(CARD_SHADOW_SIZE)};
  transition: height ${ANIMATION_DURATION}ms ${animation.defaultTiming};
  height: ${(p) => px(p.maxHeight)};
`;

interface CardsViewProps<T> extends React.PropsWithChildren {
  title: string;
  list: T[];
  isLoading?: boolean;
  renderItem: (item: T) => React.ReactElement;
  keyExtractor: (item: T) => React.Key;
}

const CardsView = <T,>({ title, list, isLoading, renderItem, keyExtractor }: CardsViewProps<T>) => {
  const [showAll, toggleShowAll] = useToggle(false);
  const [grid, setGrid] = useState<SimpleGridSchema>(createEmptyGridSchema());

  const columns = { tablet: 2, laptop: 3, desktop: 4 };
  const cellsPerRow = getValuesByMatchedDevice(columns, grid.matchedDevice);
  const maxRowsCount = Math.ceil(list.length / cellsPerRow) || 1;

  const preparedList = useMemo(
    () => (showAll ? list : list.slice(0, cellsPerRow)),
    [showAll, list, cellsPerRow]
  );

  const loadingRow = useMemo(
    () => _range(0, cellsPerRow).map((idx) => <SurveyCardLoading key={idx} />),
    [cellsPerRow]
  );

  const minHeight = useMemo(() => calculateCollapseHeight(1, grid), [grid]);
  const maxHeight = useMemo(
    () => calculateCollapseHeight(showAll ? maxRowsCount : 1, grid),
    [grid, showAll, maxRowsCount]
  );

  return (
    <CardsGridContainer>
      <CardsHead>
        <CardsTitleContainer>
          <CardsTitle>{title}</CardsTitle>
          {!!list.length && <Badge $isLoading={isLoading}>{list.length || ' '}</Badge>}
        </CardsTitleContainer>
        {list.length > cellsPerRow && (
          <CardsSwitchViewButton onClick={toggleShowAll} showAll={showAll} fill="text" rippleOff>
            {showAll ? 'Show less' : 'Show all'}
          </CardsSwitchViewButton>
        )}
      </CardsHead>
      <CardsGrid minHeight={minHeight}>
        <CollapseContainer maxHeight={maxHeight}>
          <SimpleGrid columns={columns} onChange={setGrid} verticalGap>
            {isLoading ? (
              loadingRow
            ) : (
              <TransitionGroup component={null}>
                {preparedList.map((card) => (
                  <FadeAnimation key={keyExtractor(card)}>{renderItem(card)}</FadeAnimation>
                ))}
              </TransitionGroup>
            )}
          </SimpleGrid>
        </CollapseContainer>
      </CardsGrid>
    </CardsGridContainer>
  );
};

export default CardsView;
