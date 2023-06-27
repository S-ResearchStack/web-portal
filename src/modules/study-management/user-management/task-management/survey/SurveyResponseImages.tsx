import React, { useRef, useState } from 'react';
import useScrolling from 'react-use/lib/useScrolling';

import styled from 'styled-components';

import Tooltip from 'src/common/components/Tooltip/Tooltip';
import ProgressBar from 'src/common/components/ProgressBar';
import { withCustomScrollBar } from 'src/common/components/CustomScrollbar';
import { NO_RESPONSES_LABEL } from 'src/modules/charts/common-helpers';
import { px } from 'src/styles';
import { NoResponses } from './SurveyResponsesList';
import { SurveyResultsResponse } from './surveyPage.slice';

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  align-items: flex-end;
  display: flex;
  justify-content: center;
  flex-direction: column;
  > div {
    height: ${px(389)};
  }
  margin-bottom: ${px(16)};
`;

const ProgressData = withCustomScrollBar(styled.div<{ rightPadding: boolean }>`
  width: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: ${({ rightPadding }) => rightPadding && px(12)}};
`)`
  &::-webkit-scrollbar-track {
    background: transparent;
  }`;

const TooltipsWrapper = styled.div`
  width: fit-content;
  height: 0;
  max-height: 0;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  position: relative;
  top: ${px(8)};
`;

const Anchor = styled.div`
  position: relative;
  width: ${px(56)};
  height: ${px(0)};
`;

const Image = styled.div<{ url?: string }>`
  width: ${px(48)};
  height: ${px(48)};
  border-radius: ${px(4)};
  background-image: ${({ url }) => (url ? `url(${url})` : 'none')};
  background-size: cover;
  background-position: center;
  margin-bottom: ${px(15)};
  flex-shrink: 0;
`;

const ImageContent = ({ url }: { url?: string }) => <Image url={url} />;

const SurveyResponseImages = ({ qResponse }: { qResponse: SurveyResultsResponse }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isContentScrolling = useScrolling(containerRef);
  const [isRespondentsHovered, setRespondentsHovered] = useState<boolean>(false);
  const [isPercentageHovered, setIsPercentageHovered] = useState<boolean>(false);

  return (
    <Wrapper>
      <TooltipsWrapper>
        <Tooltip static content="Number of answers" position="tl" show={isRespondentsHovered} arrow>
          <Anchor />
        </Tooltip>
        <Tooltip
          static
          content="Completion percentage"
          position="tl"
          show={isPercentageHovered}
          arrow
        >
          <Anchor />
        </Tooltip>
      </TooltipsWrapper>
      {qResponse.answers.length ? (
        <ProgressData rightPadding={qResponse.answers.length > 6} ref={containerRef}>
          {qResponse.answers.map((r, idx) => (
            <ProgressBar
              setRespondentsHovered={setRespondentsHovered}
              setIsPercentageHovered={setIsPercentageHovered}
              name={r.label || `Option ${idx + 1}`}
              percent={r.percentage || 0}
              total={r.total || 0}
              color="secondarySkyBlue"
              responded={r.count || 0}
              image={<ImageContent url={r.image} />}
              key={r.id}
              isContentScrolling={isContentScrolling}
            />
          ))}
        </ProgressData>
      ) : (
        <NoResponses>{NO_RESPONSES_LABEL}</NoResponses>
      )}
    </Wrapper>
  );
};

export default SurveyResponseImages;
