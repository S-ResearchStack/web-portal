import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useIntersection } from 'react-use';
import { push } from 'connected-react-router';
import _range from 'lodash/range';

import styled, { css } from 'styled-components';
import { useHistory } from 'react-router-dom';
import _chunk from 'lodash/chunk';

import { useAppDispatch, useAppSelector } from 'src/modules/store';
import {
  selectedStudySelector,
  selectStudy,
  studiesIsLoadingSelector,
  studiesSelector,
} from 'src/modules/studies/studies.slice';
import { Path } from 'src/modules/navigation/store';
import Button from 'src/common/components/Button';
import StudyAvatar from 'src/common/components/StudyAvatar';
import Plus from 'src/assets/icons/plus.svg';
import ArrowLeft from 'src/assets/icons/arrow_left_xxl.svg';
import ArrowRight from 'src/assets/icons/arrow_right_xxl.svg';
import { animation, colors, px, typography } from 'src/styles';
import SkeletonLoading, { SkeletonRect, SkeletonPath } from 'src/common/components/SkeletonLoading';
import ResultMessage from 'src/modules/auth/common/ResultMessage';
import EmptyStateImg from 'src/assets/illustrations/empty_state.svg';
import { SWITCH_STUDY_SEARCH_PARAM } from 'src/modules/main-layout/constants';

const MAX_STUDIES_PER_SCREEN = 10;
const componentWidth = css`
  min-width: ${px(1120)};
  max-width: ${px(1120)};
`;

const Container = styled.div`
  width: 100%;
  height: 100%;
  background-color: ${colors.background};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto;
`;

const ActionButton = styled(Button)<{ visible: boolean }>`
  margin-top: ${px(95)};
  height: ${({ visible }) => (visible ? px(80) : 0)};
`;

const Content = styled.div`
  ${componentWidth};
  color: ${colors.textPrimary};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding-top: ${px(34)};
`;

const Header = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${px(68)};
  padding-top: ${px(5)};
`;

const CarouselWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
`;

const StyledCarousel = styled.div`
  ${componentWidth};
  display: flex;
  overflow-x: hidden;
  margin-bottom: ${px(30)};
`;

const Inner = styled.div<{ index: number; total: number }>`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  white-space: nowrap;
  transform: ${({ index, total }) => `translateX(${(-100 * index) / total}%)`};
  transition: transform 0.3s ${animation.defaultTiming};
`;

const Studies = styled.div`
  ${componentWidth};
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  margin: auto;
  min-height: ${px(436)};
  row-gap: ${px(16)};
`;

const Title = styled.div`
  ${typography.headingMedium};
  margin-left: ${px(40)};
`;

const StudyContainer = styled.div<{ $selected: boolean | undefined }>`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: ${px(144)};
  height: ${px(227)};
  padding-top: ${({ $selected }) => ($selected ? 0 : px(4))};
  margin: 0 ${px(40)} ${px(8)};
`;

const StudyName = styled.div<{
  selected?: boolean;
  dimmed?: boolean;
  hovered?: boolean;
}>`
  ${({ selected, hovered }) =>
    !hovered && !selected ? typography.headingXMediumRegular : typography.headingXMedium};
  margin-top: ${px(26)};
  text-align: center;
  opacity: ${({ dimmed }) => dimmed && 0.75};
  max-width: ${px(144)};
  display: block;
  display: -webkit-box;
  height: fit-content;
  word-wrap: break-word;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: break-spaces;
`;

const StudyCounter = styled.div`
  ${typography.bodySmallRegular};
  color: ${colors.primary};
`;

const EmptyContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: ${px(12)};
`;

export type SwitchStudyProps = {
  onStudySelectionFinished?: () => void;
  canCreate: boolean;
};

const SwitchStudy: React.FC<SwitchStudyProps> = ({ canCreate, onStudySelectionFinished }) => {
  const isLoading = useAppSelector(studiesIsLoadingSelector);
  const studies = useAppSelector(studiesSelector);
  const selectedStudy = useAppSelector(selectedStudySelector);
  const dispatch = useAppDispatch();
  const [hoveredItemIdx, setHoveredItemIdx] = useState<number | null>(null);
  const [slideIndex, setSlideIndex] = useState<number>(0);
  const [selectedId, setSelectedId] = useState<string>('');
  const history = useHistory();
  const ref = useRef<HTMLDivElement>(null);
  const isVisible = !!useIntersection(ref, {})?.isIntersecting;

  useEffect(() => {
    if (!isVisible) {
      setSelectedId('');
    }
  }, [isVisible]);

  const studyPages = useMemo(
    () =>
      _chunk(
        studies.map((s) => ({ ...s, selected: selectedId ? s.id === selectedId : undefined })),
        MAX_STUDIES_PER_SCREEN
      ).map((ss, idx) => ({
        id: idx,
        studies: ss,
      })),
    [selectedId, studies]
  );

  const handleStudySelected = (id: string) => {
    if (id !== selectedStudy?.id) {
      history.replace(Path.Overview);
    }

    if (history.location.search.includes(SWITCH_STUDY_SEARCH_PARAM)) {
      history.replace(history.location.pathname);
    }

    dispatch(selectStudy(id));
    onStudySelectionFinished?.();
  };

  const createStudy = () => {
    dispatch(push(Path.CreateStudy));
  };

  const isHovered = Number.isFinite(hoveredItemIdx);

  const Counter = useCallback(
    (index: number) => {
      let counter = <>&nbsp;</>;
      if (studyPages.length > 1) {
        counter = (
          <>
            {Math.abs(index) * MAX_STUDIES_PER_SCREEN + studyPages[index].studies.length} of{' '}
            {studies.length}
          </>
        );
      }
      return counter;
    },
    [studyPages, studies.length]
  );

  const loadingRow = useMemo(
    () =>
      _range(0, MAX_STUDIES_PER_SCREEN).map((idx) => (
        <StudyContainer key={idx} $selected={false}>
          <SkeletonLoading>
            <SkeletonPath
              x="0"
              y="0"
              d="M141.23 100.118C135.335 127.551 120.189 144 72.2835 144C23.5103 144 9.07086 127.811 2.85704 100.119C1.18261 92.6562 0.0788032 81.4557 0 72.7101C0 63.5616 1.11855 51.6301 2.85704 43.8817C9.07086 16.1894 23.5103 0 72 0C120.189 0 135.335 16.4487 141.23 43.8817C143.042 52.3163 144 62.0734 144 72.426C143.941 82.6929 142.984 91.9541 141.23 100.118Z"
            />
            <SkeletonRect x="0" y="168" rx={0} ry={0} width={144} height={27} />
          </SkeletonLoading>
        </StudyContainer>
      )),
    []
  );

  return (
    <Container>
      <ActionButton
        icon={<ArrowLeft />}
        fill="text"
        width={80}
        onClick={() => setSlideIndex(slideIndex - 1)}
        disabled={slideIndex === 0}
        visible={studyPages.length > 1}
        aria-label="Previous Study"
      />
      <Content>
        <Header>
          <Title>Study Collection</Title>
          {canCreate && (
            <Button fill="text" width={246} icon={<Plus />} onClick={createStudy} rippleOff>
              Create new study
            </Button>
          )}
        </Header>
        {/* eslint-disable-next-line no-nested-ternary */}
        {studyPages.length ? (
          <CarouselWrapper ref={ref}>
            <StyledCarousel>
              <Inner index={slideIndex} total={studyPages.length}>
                {studyPages.map((page) => (
                  <Studies key={page.id}>
                    {page.studies.map(({ id, name, color, selected }, idx) => {
                      const isItemHovered = hoveredItemIdx === idx;
                      return (
                        <StudyContainer
                          $selected={selected}
                          onMouseUp={() => handleStudySelected(id)}
                          onMouseDown={() => setSelectedId(id)}
                          key={id}
                        >
                          <StudyAvatar
                            color={color}
                            size="xxl"
                            $selected={selected}
                            onMouseEnter={() => setHoveredItemIdx(idx)}
                            onMouseLeave={() => setHoveredItemIdx(null)}
                          />
                          <StudyName
                            selected={selected}
                            hovered={isItemHovered}
                            dimmed={selected && isHovered && !isItemHovered}
                          >
                            {name}
                          </StudyName>
                        </StudyContainer>
                      );
                    })}
                  </Studies>
                ))}
              </Inner>
            </StyledCarousel>
          </CarouselWrapper>
        ) : !isLoading ? (
          <EmptyContainer>
            <ResultMessage
              moreSpace
              picture={<EmptyStateImg />}
              title="No studies yet"
              description="Access studies you have been invited to here."
            />
          </EmptyContainer>
        ) : (
          <CarouselWrapper>
            <StyledCarousel>
              <Studies>{loadingRow}</Studies>
            </StyledCarousel>
          </CarouselWrapper>
        )}
        <StudyCounter>{Counter(slideIndex)}</StudyCounter>
      </Content>
      <ActionButton
        icon={<ArrowRight />}
        fill="text"
        width={80}
        onClick={() => setSlideIndex(slideIndex + 1)}
        disabled={slideIndex === studyPages.length - 1}
        visible={studyPages.length > 1}
        aria-label="Next Study"
      />
    </Container>
  );
};

export default SwitchStudy;
