import React, { FC, useMemo, useRef, useState } from 'react';
import useToggle from 'react-use/lib/useToggle';
import styled from 'styled-components';
import TransitionGroup from 'react-transition-group/TransitionGroup';
import CSSTransition, { CSSTransitionProps } from 'react-transition-group/CSSTransition';
import _uniqueId from 'lodash/uniqueId';
import _range from 'lodash/range';

import { animation, colors, px, typography } from 'src/styles';
import Button from 'src/common/components/Button';
import SimpleGrid, {
  SimpleGridSchema,
  getValuesByMatchedDevice,
  matchDeviceScreen,
  GRID_GAP,
} from 'src/common/components/SimpleGrid';

import Badge from './common/Badge';
import SurveyCard, { SurveyCardLoading } from './SurveyCard';
import { SurveyListItem } from './surveyList.slice';

const CARD_HEIGHT = 160;
const CARD_SHADOW_SIZE = 4;
const CARD_SHADOW_DOUBLE_SIZE = CARD_SHADOW_SIZE * 2;
const ANIMATION_DURATION = 800;
const FADE_CLASS_NAME = _uniqueId('fade');

const calculateCollapseHeight = (maxRowsCount: number) =>
  (CARD_HEIGHT + GRID_GAP) * maxRowsCount - GRID_GAP + CARD_SHADOW_DOUBLE_SIZE;

const CardsGridContainer = styled.div`
  margin-bottom: ${px(16)};
`;

const SurveyCardsTitleContainer = styled.div`
  display: flex;
  align-items: center;
  height: ${px(48)};
  margin-top: ${px(8)};

  ${Badge} {
    margin-left: ${px(8)};
  }
`;

const SurveyCardsHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SurveyCardsTitle = styled.h3`
  ${typography.bodySmallSemibold};
  color: ${colors.textPrimary};
  padding: 0;
  margin: 0;
`;

const SurveyCardsSwitchViewButton = styled(Button).attrs({
  fill: 'text',
  rippleOff: true,
})`
  width: ${px(116)};

  > div:first-child {
    display: flex;
    justify-content: end;
    ${typography.bodySmallSemibold};
    color: ${colors.primary};
  }
`;

const SurveyCardsGrid = styled.div`
  min-height: ${px(calculateCollapseHeight(1))};
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

const FadeAnimation: FC<FadeAnimationProps> = ({ in: inProp, children }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <FadeContainer
      nodeRef={containerRef}
      key={123}
      in={inProp}
      classNames={FADE_CLASS_NAME}
      timeout={ANIMATION_DURATION}
    >
      <div ref={containerRef}>{children}</div>
    </FadeContainer>
  );
};

const CollapseContainer = styled.div<{ open: boolean; $maxRowsCount: number }>`
  overflow: hidden;
  margin: ${px(-CARD_SHADOW_SIZE)};
  padding: ${px(CARD_SHADOW_SIZE)};
  transition: height ${ANIMATION_DURATION}ms ${animation.defaultTiming};
  height: ${({ open, $maxRowsCount }) => px(calculateCollapseHeight(open ? $maxRowsCount : 1))};
`;

type CollapseAnimationProps = React.PropsWithChildren<{ open: boolean; maxRowsCount: number }>;

const CollapseAnimation: FC<CollapseAnimationProps> = ({ open, maxRowsCount, children }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <CollapseContainer open={open} $maxRowsCount={maxRowsCount}>
      <div ref={containerRef}>{children}</div>
    </CollapseContainer>
  );
};

interface SurveyCardsViewProps extends React.PropsWithChildren<unknown> {
  title: string;
  list: SurveyListItem[];
  isLoading?: boolean;
}

const SurveyCardsView: FC<SurveyCardsViewProps> = ({ title, list, isLoading }) => {
  const [showAll, toggleShowAll] = useToggle(false);
  const [grid, setGrid] = useState<Pick<SimpleGridSchema, 'columnsCount' | 'matchedDevice'>>({
    columnsCount: 0,
    matchedDevice: matchDeviceScreen(),
  });

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

  return (
    <CardsGridContainer>
      <SurveyCardsHead>
        <SurveyCardsTitleContainer>
          <SurveyCardsTitle>{title}</SurveyCardsTitle>
          {list.length > cellsPerRow && <Badge $isLoading={isLoading}>{list.length || ' '}</Badge>}
        </SurveyCardsTitleContainer>
        {list.length > cellsPerRow && (
          <SurveyCardsSwitchViewButton onClick={toggleShowAll}>
            {showAll ? 'Show less' : 'Show all'}
          </SurveyCardsSwitchViewButton>
        )}
      </SurveyCardsHead>
      <SurveyCardsGrid>
        <CollapseAnimation open={showAll} maxRowsCount={maxRowsCount}>
          <SimpleGrid columns={columns} onChange={setGrid} verticalGap>
            {isLoading ? (
              loadingRow
            ) : (
              <TransitionGroup component={null}>
                {preparedList.map((card) => (
                  <FadeAnimation key={card.id}>
                    <SurveyCard item={card} />
                  </FadeAnimation>
                ))}
              </TransitionGroup>
            )}
          </SimpleGrid>
        </CollapseAnimation>
      </SurveyCardsGrid>
    </CardsGridContainer>
  );
};

export default SurveyCardsView;
