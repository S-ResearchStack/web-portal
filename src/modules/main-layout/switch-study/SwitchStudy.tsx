import React, { useCallback, useState } from 'react';
import { push } from 'connected-react-router';

import styled, { css } from 'styled-components';
import { useHistory } from 'react-router-dom';

import _chunk from 'lodash/chunk';
import { useAppDispatch, useAppSelector } from 'src/modules/store';
import {
  selectedStudySelector,
  selectStudy,
  studiesSelector,
} from 'src/modules/studies/studies.slice';
import { Path } from 'src/modules/navigation/store';
import Button from 'src/common/components/Button';
import StudyAvatar from 'src/common/components/StudyAvatar';
import Plus from 'src/assets/icons/plus.svg';
import ArrowLeft from 'src/assets/icons/arrow_left_xxl.svg';
import ArrowRight from 'src/assets/icons/arrow_right_xxl.svg';
import { animation, colors, px, typography } from 'src/styles';

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
  height: ${px(603)};
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
  margin-bottom: ${px(68)};
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
`;

const Title = styled.div`
  ${typography.headingMedium};
  margin: ${px(5)} 0 0 ${px(40)};
`;

const StudyContainer = styled.div<{ $selected: boolean | undefined }>`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: ${px(144)};
  height: ${px(210)};
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
  overflow-x: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StudyCounter = styled.div`
  ${typography.bodySmallRegular};
  color: ${colors.primary};
`;

type Props = {
  onStudySelectionFinished: () => void;
};

const SwitchStudy: React.FC<Props> = ({ onStudySelectionFinished }) => {
  const studies = _chunk(useAppSelector(studiesSelector), MAX_STUDIES_PER_SCREEN);
  const selectedStudy = useAppSelector(selectedStudySelector);
  const dispatch = useAppDispatch();
  const [hoveredItemIdx, setHoveredItemIdx] = useState<number | null>(null);
  const [slideIndex, setSlideIndex] = useState<number>(0);
  const history = useHistory();

  const handleStudySelected = (id: string) => {
    if (id !== selectedStudy?.id) {
      history.replace(Path.Overview);
    }
    dispatch(selectStudy(id));
    onStudySelectionFinished();
  };

  const createStudy = () => {
    dispatch(push(Path.CreateStudy));
  };

  const isHovered = Number.isFinite(hoveredItemIdx);

  const Counter = useCallback(
    (index: number) => {
      let counter = <>&nbsp;</>;
      if (studies.length > 1) {
        counter = (
          <>
            {Math.abs(index) * MAX_STUDIES_PER_SCREEN + studies[index].length} of{' '}
            {studies.flat().length}
          </>
        );
      }
      return counter;
    },
    [studies]
  );

  return (
    <Container>
      <ActionButton
        icon={<ArrowLeft />}
        fill="text"
        width={80}
        onClick={() => setSlideIndex(slideIndex - 1)}
        disabled={slideIndex === 0}
        visible={studies.length > 1}
      />
      <Content>
        <Header>
          <Title>Study Collection</Title>
          <Button fill="text" width={246} icon={<Plus />} onClick={createStudy}>
            Create new study
          </Button>
        </Header>
        <CarouselWrapper>
          <StyledCarousel>
            <Inner index={slideIndex} total={studies.length}>
              {studies.map((studiesChunk, index) => (
                // eslint-disable-next-line react/no-array-index-key
                <Studies key={index}>
                  {studiesChunk.map(({ id, name, color }, idx) => {
                    const isSelected = selectedStudy?.id === id || undefined;
                    const isItemHovered = hoveredItemIdx === idx;
                    return (
                      <StudyContainer
                        $selected={isSelected}
                        onClick={() => handleStudySelected(id)}
                        key={id}
                      >
                        <StudyAvatar
                          color={color}
                          size="xxl"
                          $selected={isSelected}
                          onMouseEnter={() => setHoveredItemIdx(idx)}
                          onMouseLeave={() => setHoveredItemIdx(null)}
                        />
                        <StudyName
                          selected={isSelected}
                          hovered={isItemHovered}
                          dimmed={isSelected && isHovered && !isItemHovered}
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
        <StudyCounter>{Counter(slideIndex)}</StudyCounter>
      </Content>
      <ActionButton
        icon={<ArrowRight />}
        fill="text"
        width={80}
        onClick={() => setSlideIndex(slideIndex + 1)}
        disabled={slideIndex === studies.length - 1}
        visible={studies.length > 1}
      />
    </Container>
  );
};

export default SwitchStudy;
