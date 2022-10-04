import styled from 'styled-components';
import React, { FC, useMemo } from 'react';
import _range from 'lodash/range';

import { colors, px, typography } from 'src/styles';

const SliderContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  position: relative;
`;

const SliderBar = styled.div`
  width: 100%;
  background-color: ${colors.updPrimaryLight};
  height: ${px(2)};
`;

const SliderScalePointWrapper = styled.div<{ index: number; areasNumber: number }>`
  cursor: pointer;
  width: ${({ areasNumber }) => `calc(100% / ${areasNumber})`};
  height: ${px(6)};
  position: absolute;
  left: ${({ index, areasNumber }) => `calc(100% / ${areasNumber} * ${index})`};
  top: ${px(14)};
  display: flex;
  justify-content: center;
`;

const SliderScalePoint = styled.div`
  cursor: pointer;
  width: ${px(2)};
  height: ${px(6)};
  background-color: ${colors.updPrimary};
`;

const ValuesContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  ${typography.labelRegular};
  line-height: ${px(13)};
  color: ${colors.updTextPrimary};
  position: absolute;
  top: ${px(28)};
  left: 0;
`;

const LabelsContainer = styled(ValuesContainer)`
  color: ${colors.updTextSecondaryGray};
  text-transform: uppercase;
  letter-spacing: ${px(1)};
  top: ${px(45)};
`;

const SelectedPoint = styled.div<{ index?: number; areasNumber: number }>`
  position: absolute;
  width: ${px(16)};
  height: ${px(16)};
  background-color: ${colors.updPrimary};
  border-radius: ${px(25)};
  box-shadow: 0 0 ${px(8)} rgba(32, 87, 213, 0.25);
  top: ${px(-8)};
  left: ${({ index, areasNumber }) =>
    `calc((100% / ${areasNumber} * ${index || 0}) + (100% / ${areasNumber} / 2) - ${px(8)})`};
  opacity: ${({ index }) => (index !== undefined ? 1 : 0)};
`;

interface PreviewSliderProps {
  maxIndex: number;
  minIndex: number;
  maxLabel: string;
  minLabel: string;
  activeIndex?: number;
  onChange: (index: number) => void;
}

const PreviewSlider: FC<PreviewSliderProps> = ({
  maxIndex,
  minIndex,
  maxLabel,
  minLabel,
  activeIndex,
  onChange,
}: PreviewSliderProps) => {
  const areasNumber = maxIndex - minIndex + 1;

  const selectedPoint = useMemo(() => {
    if (minIndex === 0) {
      return activeIndex;
    }

    if (activeIndex) {
      return activeIndex - 1;
    }

    return undefined;
  }, [activeIndex, minIndex]);

  return (
    <SliderContainer>
      <SliderBar />
      {_range(0, areasNumber).map((i) => (
        <SliderScalePointWrapper
          index={i}
          areasNumber={areasNumber}
          onClick={() => onChange(i + minIndex)}
        >
          <SliderScalePoint />
        </SliderScalePointWrapper>
      ))}
      <ValuesContainer>
        <div>{minIndex}</div>
        <div>{maxIndex}</div>
      </ValuesContainer>
      <LabelsContainer>
        <div>{minLabel}</div>
        <div>{maxLabel}</div>
      </LabelsContainer>
      <SelectedPoint index={selectedPoint} areasNumber={areasNumber} />
    </SliderContainer>
  );
};

export default PreviewSlider;
