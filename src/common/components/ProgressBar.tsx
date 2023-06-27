import React, { useEffect, useRef } from 'react';
import useHoverDirty from 'react-use/lib/useHoverDirty';

import styled from 'styled-components';

import Tooltip from 'src/common/components/Tooltip/Tooltip';
import { colors, px, typography } from 'src/styles';
import { SpecColorType } from 'src/styles/theme';

const Respondents = styled.div`
  width: ${px(72)};
  min-width: ${px(72)};
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: right;
`;

const Percentage = styled(Respondents)`
  width: ${px(52)};
  min-width: ${px(52)};
`;

const ProgressContent = styled.div`
  ${typography.bodySmallRegular};
  height: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  column-gap: ${px(12)};
`;

const TitleName = styled.div`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  max-width: 100%;
`;

const Subtitle = styled(TitleName)`
  ${typography.bodyXSmallRegular};
  color: ${colors.textSecondaryGray};
`;

const Content = styled.div`
  ${typography.bodySmallSemibold};
  column-gap: ${px(12)};
  width: 100%;
  max-height: ${px(21)};
  height: ${px(21)};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TitleWrapper = styled.div`
  width: 100%;
  max-width: 100%;
  max-height: ${px(39)};
  height: fit-content;
  display: flex;
  flex-direction: column;
  text-transform: capitalize;
`;

const CommonWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  column-gap: ${px(8)};
  max-width: 100%;
  flex-shrink: 0;
  overflow-x: hidden;
`;

const TaskProgress = styled.div<{ marginBottom?: number }>`
  width: 100%;
  max-width: 100%;
  max-height: ${px(59)};
  height: fit-content;
  display: flex;
  flex-direction: column;
  row-gap: ${px(16)};
  margin-bottom: ${({ marginBottom }) => (marginBottom ? px(marginBottom) : px(24))};
`;

const Track = styled.div`
  width: 100%;
  height: ${px(4)};
  border-radius: ${px(50)};
  background-color: ${colors.primaryLight};
  position: relative;
`;

type ThumbProps = { $color: SpecColorType; progress: number };

const Thumb = styled.div.attrs<ThumbProps>(({ progress }) => ({
  style: {
    width: `${progress}%`,
  },
}))<ThumbProps>`
  height: ${px(4)};
  right: 0;
  border-radius: ${px(50)};
  background-color: ${({ $color }) => colors[$color]};
  position: relative;
`;

const Bar = ({ color, progress }: { color: SpecColorType; progress: number }) => (
  <Track>
    <Thumb $color={color} progress={progress} />
  </Track>
);

const ProgressBar = ({
  name,
  description,
  responded,
  total,
  percent,
  color,
  isContentScrolling,
  tooltipContent,
  image,
  setRespondentsHovered,
  setIsPercentageHovered,
  marginBottom,
}: {
  name: string;
  description?: string;
  responded: number;
  total: number;
  percent: number;
  color: SpecColorType;
  isContentScrolling?: boolean;
  tooltipContent?: [string, string];
  image?: React.ReactNode;
  setRespondentsHovered?: (isNumberOfAnswersHovered: boolean) => void;
  setIsPercentageHovered?: (isNumberOfAnswersHovered: boolean) => void;
  marginBottom?: number;
}) => {
  const numberOfAnswersRef = useRef<HTMLDivElement>(null);
  const percentageRef = useRef<HTMLDivElement>(null);
  const isRespondentsHovered = useHoverDirty(numberOfAnswersRef);
  const isPercentageHovered = useHoverDirty(percentageRef);

  useEffect(() => {
    setRespondentsHovered?.(isRespondentsHovered);
    setIsPercentageHovered?.(isPercentageHovered);
  }, [isRespondentsHovered, setRespondentsHovered, isPercentageHovered, setIsPercentageHovered]);

  return (
    <CommonWrapper>
      {image}
      <TaskProgress marginBottom={marginBottom}>
        <TitleWrapper>
          <Content>
            <TitleName>{name}</TitleName>
            <ProgressContent>
              <Respondents>
                {tooltipContent ? (
                  <Tooltip
                    show={isContentScrolling ? false : undefined}
                    content={tooltipContent?.[0]}
                    trigger="hover"
                    arrow
                    position="tl"
                    delay={0}
                  >
                    {responded}/{total}
                  </Tooltip>
                ) : (
                  <div ref={numberOfAnswersRef}>
                    {responded}/{total}
                  </div>
                )}
              </Respondents>
              <Percentage>
                {tooltipContent ? (
                  <Tooltip
                    content={tooltipContent?.[1]}
                    trigger="hover"
                    arrow
                    position="tl"
                    delay={0}
                    show={isContentScrolling ? false : undefined}
                  >
                    {percent}%
                  </Tooltip>
                ) : (
                  <div ref={percentageRef}>{percent}%</div>
                )}
              </Percentage>
            </ProgressContent>
          </Content>
          <Subtitle>{description}</Subtitle>
        </TitleWrapper>
        <Bar color={color} progress={percent} />
      </TaskProgress>
    </CommonWrapper>
  );
};

export default ProgressBar;
