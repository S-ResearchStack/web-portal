import React, { FC, useMemo, useRef, useState } from 'react';
import useToggle from 'react-use/lib/useToggle';
import styled, { css, keyframes } from 'styled-components';
import spring, { toString } from 'css-spring';
import TransitionGroup from 'react-transition-group/TransitionGroup';
import CSSTransition, { CSSTransitionProps } from 'react-transition-group/CSSTransition';
import _uniqueId from 'lodash/uniqueId';
import _range from 'lodash/range';

import { colors, px, typography } from 'src/styles';
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
const CARD_COMPUTED_HEIGHT = CARD_HEIGHT + CARD_SHADOW_DOUBLE_SIZE;
const ANIMATION_DURATION = 800;
const FADE_CLASS_NAME = _uniqueId('fade');
const COLLAPSE_CLASS_NAME = _uniqueId('collapse');
const SPRING_CONFIG = { stiffness: 177.8, damping: 20, precision: 6 };

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
  color: ${colors.updTextPrimary};
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
    color: ${colors.updPrimary};
  }
`;

const SurveyCardsGrid = styled.div`
  min-height: ${px(CARD_HEIGHT)};
`;

const FadeContainer = styled(CSSTransition)`
  animation-duration: ${ANIMATION_DURATION}ms;
  animation-fill-mode: forwards;

  &.${FADE_CLASS_NAME}-enter {
    opacity: 0;
  }

  &.${FADE_CLASS_NAME}-enter-active {
    opacity: 1;
    animation-name: ${keyframes`${toString(
      spring({ opacity: 0 }, { opacity: 1 }, SPRING_CONFIG)
    )}`};
  }

  &.${FADE_CLASS_NAME}-exit {
    opacity: 1;
  }

  &.${FADE_CLASS_NAME}-exit-active {
    opacity: 0;
    animation-name: ${keyframes`${toString(
      spring({ opacity: 1 }, { opacity: 0 }, SPRING_CONFIG)
    )}`};
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

const calculateCollapseHeight = (maxRowsCount: number) =>
  (CARD_HEIGHT + GRID_GAP) * maxRowsCount - GRID_GAP + CARD_SHADOW_DOUBLE_SIZE;

const getStartCollapseStyles = () => ({ height: px(CARD_COMPUTED_HEIGHT) });

const getEndCollapseStyles = (maxRowsCount: number) => ({
  height: px(calculateCollapseHeight(maxRowsCount)),
});

// TODO: fix animation (probably due to size changes)
const CollapseContainer = styled(CSSTransition)<{ $maxRowsCount: number }>`
  animation-duration: ${ANIMATION_DURATION}ms;
  animation-fill-mode: forwards;
  overflow: hidden;
  // see TODO: above. This causes shadow to be cut, but animation looks better
  // margin: ${px(-CARD_SHADOW_SIZE)};
  padding: ${px(CARD_SHADOW_SIZE)};
  height: ${({ in: inProp, $maxRowsCount }) =>
    inProp ? getEndCollapseStyles($maxRowsCount).height : getStartCollapseStyles().height};

  &.${COLLAPSE_CLASS_NAME}-enter {
    height: ${px(CARD_COMPUTED_HEIGHT)};
  }

  &.${COLLAPSE_CLASS_NAME}-enter-active {
    ${({ $maxRowsCount }) => {
      const start = getStartCollapseStyles();
      const end = getEndCollapseStyles($maxRowsCount);

      return css`
        height: ${end.height};
        animation-name: ${keyframes`${toString(spring(start, end, SPRING_CONFIG))}`};
      `;
    }};
  }

  &.${COLLAPSE_CLASS_NAME}-enter-done, &.${COLLAPSE_CLASS_NAME}-exit {
    height: ${({ $maxRowsCount }) => px(calculateCollapseHeight($maxRowsCount))};
  }

  &.${COLLAPSE_CLASS_NAME}-exit-active {
    ${({ $maxRowsCount }) => {
      const start = getStartCollapseStyles();
      const end = getEndCollapseStyles($maxRowsCount);

      return css`
        height: ${start.height};
        animation-name: ${keyframes`${toString(spring(end, start, SPRING_CONFIG))}`};
      `;
    }};
  }

  &.${COLLAPSE_CLASS_NAME}-exit-done {
    height: ${px(CARD_COMPUTED_HEIGHT)};
  }
`;

type CollapseAnimationProps = React.PropsWithChildren<
  Partial<CSSTransitionProps & { maxRowsCount: number }>
>;

const CollapseAnimation: FC<CollapseAnimationProps> = ({ in: inProp, maxRowsCount, children }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <CollapseContainer
      nodeRef={containerRef}
      in={inProp}
      classNames={COLLAPSE_CLASS_NAME}
      $maxRowsCount={maxRowsCount}
      timeout={ANIMATION_DURATION}
    >
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
          <Badge $isLoading={isLoading}>{list.length || ' '}</Badge>
        </SurveyCardsTitleContainer>
        <SurveyCardsSwitchViewButton onClick={toggleShowAll}>
          {showAll ? 'Show less' : 'Show all'}
        </SurveyCardsSwitchViewButton>
      </SurveyCardsHead>
      <SurveyCardsGrid>
        <CollapseAnimation in={showAll} maxRowsCount={maxRowsCount}>
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
