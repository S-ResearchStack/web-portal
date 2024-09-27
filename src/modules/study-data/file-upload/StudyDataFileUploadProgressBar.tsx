import React, { useRef } from 'react';

import styled from 'styled-components';

import { colors, typography } from 'src/styles';
import { SpecColorType } from 'src/styles/theme';
import {humanFileProgressSize} from "src/common/utils/file";

const UploadProgressBarContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  overflow: visible;
  height: 44px;
`;

const ImageStatusContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72px;
`

const ImageContainer = styled.div<{ opacity?: number }>`
  opacity: ${p => p.opacity};
`

const TaskProgress = styled.div<{ marginBottom?: number }>`
  display: flex;
  flex-direction: column;
  padding-left: 8px;
  width: 100%;
  row-gap: 4px;
`;

const TitleContainer = styled.div`
  ${typography.bodySmallSemibold};
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.div`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  align-items: center;
  width: fit-content;
`;

const Progress = styled.div`
  ${typography.bodySmallRegular};
  align-items: center;
  white-space: nowrap;
  padding-left: 12px;
  width: fit-content;
`;

const Respondents = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
`;

const BarContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`

const Track = styled.div<{color?: SpecColorType}>`
  width: 100%;
  height: 8px;
  border-radius: 50px;
  background-color: ${p => p.color && colors[p.color]};
  position: relative;
`;

const PercentageContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: end;
  width: 72px;
`

const Percentage = styled(Respondents)`
  ${typography.headingXMedium};
  align-items: center;
  text-align: end;
`

const PercentageLabel = styled.div`
  ${typography.bodySmallRegular};
  padding-top: 4px;
`

const IconContainer = styled.div`
  position: absolute;
`

type ThumbProps = { $color: SpecColorType; progress: number };

const Thumb = styled.div.attrs<ThumbProps>(({ progress }) => ({
  style: {
    width: `${progress}%`,
  },
}))<ThumbProps>`
  height: 8px;
  right: 0;
  border-radius: 50px;
  background-color: ${({ $color }) => colors[$color]};
  position: relative;
`;

const Bar = ({ baseColor, color, progress }: { baseColor: SpecColorType; color: SpecColorType; progress: number }) => (
  <Track color={baseColor}>
    <Thumb $color={color} progress={progress} />
  </Track>
);


const StudyDataFileUploadProgressBar = ({
  name,
  loaded,
  total,
  baseColor,
  progressColor,
  image,
  statusIcon,
  marginBottom,
}: {
  name: string;
  loaded: number;
  total: number;
  baseColor: SpecColorType;
  progressColor: SpecColorType;
  image?: React.ReactNode;
  statusIcon?: React.ReactNode;
  marginBottom?: number;
}) => {
  const titleContainerRef = useRef<HTMLDivElement>(null)
  const percentageRef = useRef<HTMLDivElement>(null)

  const progress = humanFileProgressSize(loaded, total)

  const percent = total === 0 ? 0 : (loaded / total * 100)
  const completed = percent === 100

  return <UploadProgressBarContainer>
    <ImageStatusContainer>
      <ImageContainer opacity={completed ? .5 : 1}>{image}</ImageContainer>
      {statusIcon && <IconContainer>{statusIcon}</IconContainer>}
    </ImageStatusContainer>
    <TaskProgress marginBottom={marginBottom}>
      <TitleContainer ref={titleContainerRef}>
        <Title>{name}</Title>
        <Progress>{progress}</Progress>
      </TitleContainer>
      <BarContainer>
        <Bar baseColor={baseColor} color={progressColor} progress={percent} />
      </BarContainer>
    </TaskProgress>
    <PercentageContainer>
      <Percentage ref={percentageRef}>{percent.toFixed(0)}</Percentage>
      <PercentageLabel>%</PercentageLabel>
    </PercentageContainer>
  </UploadProgressBarContainer>
};

export default StudyDataFileUploadProgressBar;
