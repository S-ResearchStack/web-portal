import React, { FC, useMemo } from 'react';

import _range from 'lodash/range';
import styled from 'styled-components';

import { colors, px, typography } from 'src/styles';

const POINTER_SIZE = 12;

const SliderContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  position: relative;
  height: ${px(70)};
`;

const SliderBar = styled.div`
  width: 100%;
  background-color: ${colors.primaryLight};
  height: ${px(2)};
`;

const ScaleWrapper = styled.div`
  width: 100%;
  height: fit-content;
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0 ${px(POINTER_SIZE / 2)};
`;

const SliderScalePointWrapper = styled.div<{ index: number; areasNumber: number }>`
  cursor: pointer;
  height: ${px(36)};
  position: relative;
  top: ${px(-5)};
  display: flex;
  justify-content: ${({ index, areasNumber }) => {
    switch (index) {
      case 0:
        return 'flex-start';
      case areasNumber - 1:
        return 'flex-end';
      default:
        return 'center';
    }
  }};
  width: ${({ areasNumber, index }) => {
    if (index === 0 || index === areasNumber - 1) {
      return `calc((100% / ${areasNumber - 1}) / 2)`;
    }
    return `calc(100% / ${areasNumber - 1})`;
  }};
`;

const SliderScalePoint = styled.div`
  cursor: pointer;
  width: ${px(2)};
  position: relative;
  top: ${px(20)};
  height: ${px(6)};
  background-color: ${colors.primary};
`;

const ValuesContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  ${typography.labelRegular};
  line-height: ${px(13)};
  color: ${colors.textPrimary};
  position: absolute;
  top: ${px(28)};
  left: 0;
`;

const LabelsContainer = styled(ValuesContainer)`
  color: ${colors.textSecondaryGray};
  text-transform: uppercase;
  letter-spacing: ${px(1)};
  top: ${px(45)};
`;

const Pointer = styled.div<{ index?: number; areasNumber: number }>`
  position: absolute;
  width: ${px(16)};
  height: ${px(16)};
  background-color: ${colors.primary};
  border-radius: 50%;
  box-shadow: 0 0 ${px(8)} rgba(32, 87, 213, 0.25); // TODO unknown color
  top: ${px(-8)};
  left: ${({ index, areasNumber }) => {
    if (index === 0) {
      return '0';
    }
    if (index === areasNumber - 1) {
      return `calc(100% - ${px(POINTER_SIZE)} - ${px(4)})`;
    }
    return `calc(((100% - ${px(POINTER_SIZE)} - ${px(4)}) / (${areasNumber} - 1) * ${index || 0}))`;
  }};
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
    <SliderContainer data-testid="survey-preview-slider">
      <ScaleWrapper>
        {_range(0, areasNumber).map((i) => (
          <SliderScalePointWrapper
            data-testid="survey-preview-slider-point"
            index={i}
            areasNumber={areasNumber}
            onClick={() => onChange(i + minIndex)}
            key={i}
          >
            <SliderScalePoint />
          </SliderScalePointWrapper>
        ))}
      </ScaleWrapper>
      <SliderBar />
      <Pointer index={selectedPoint} areasNumber={areasNumber} />
      <ValuesContainer>
        <div data-testid="survey-preview-slider-min-value">{minIndex}</div>
        <div data-testid="survey-preview-slider-max-value">{maxIndex}</div>
      </ValuesContainer>
      <LabelsContainer>
        <div data-testid="survey-preview-slider-min-label">{minLabel}</div>
        <div data-testid="survey-preview-slider-max-label">{maxLabel}</div>
      </LabelsContainer>
    </SliderContainer>
  );
};

export default PreviewSlider;
