import React, { useEffect, useMemo, useRef, useState } from 'react';
import useScrolling from 'react-use/lib/useScrolling';

import styled from 'styled-components';

import Tooltip from 'src/common/components/Tooltip/Tooltip';
import { NO_RESPONSES_LABEL } from 'src/modules/charts/common-helpers';
import { withCustomScrollBar } from 'src/common/components/CustomScrollbar';
import { colors, px, typography } from 'src/styles';

const ADDITIONAL_INFO_WIDTH = 110;

const TooltipsWrapper = styled.div`
  width: fit-content;
  height: 0;
  max-height: 0;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  position: relative;
  top: ${px(5)};
`;

const Anchor = styled.div`
  position: relative;
  width: ${px(110)};
  height: ${px(0)};
`;

const Container = styled.div`
  margin-top: ${px(24)};
  margin-bottom: ${px(16)};
  height: 100%;
  width: 100%;
  align-items: flex-end;
  display: flex;
  justify-content: center;
  flex-direction: column;
  > div {
    height: ${px(389)};
  }
`;

const ScrollableContainer = withCustomScrollBar(styled.div<{ hasScroll: boolean }>`
  height: 100%;
  width: 100%;
  overflow-y: auto;
  padding-right: ${({ hasScroll }) => hasScroll && px(12)};
`)`
  &::-webkit-scrollbar-track {
    background: transparent;
  }
`;

export const ResponseCard = styled.div`
  background-color: ${colors.background};
  padding: ${px(8)};

  &:not(:last-child) {
    margin-bottom: ${px(8)};
  }
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const MainInfo = styled.div<{ withAdditionalInfo: boolean }>`
  height: 100%;
  width: ${({ withAdditionalInfo }) =>
    withAdditionalInfo ? `calc(100% - ${px(ADDITIONAL_INFO_WIDTH)})` : '100%'};
`;

export const TopBlock = styled.div`
  ${typography.bodyXSmallRegular};
  color: ${colors.textPrimary};
`;

export const Answer = styled.div`
  ${typography.bodySmallSemibold};
  margin-top: ${px(4)};
  color: ${colors.textPrimary};
`;

const AdditionalInfo = styled.div`
  ${typography.bodyXSmallRegular};
  color: ${colors.textPrimary};
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: ${px(ADDITIONAL_INFO_WIDTH)};
  flex-shrink: 0;
`;

export const NoResponses = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  background-color: ${colors.background};
  justify-content: center;
  align-items: center;
  ${typography.bodyLargeRegular};
  color: ${colors.textPrimary};
`;

type Props = {
  responses: {
    id: string;
    label: string;
    answer?: string;
    index?: number;
    total?: string;
    rank?: string;
    extraLabel?: string;
  }[];
};

const SurveyResponsesList = ({ responses }: Props) => {
  const isRankResponse = useMemo(() => responses.some((r) => r.extraLabel), [responses]);
  const [hasScroll, setHasScroll] = useState<boolean>(false);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const scref = useRef<HTMLDivElement>(null);
  const isContentScrolling = useScrolling(scref);

  useEffect(
    () => setHasScroll((scref.current?.scrollHeight || 0) > (scref.current?.clientHeight || 0)),
    [scref.current?.scrollHeight, scref.current?.clientHeight]
  );

  const handleShowTooltip = () => setShowTooltip(true);
  const handleHideTooltip = () => setShowTooltip(false);

  return (
    <Container>
      {isRankResponse && (
        <TooltipsWrapper>
          <Tooltip
            content="Ranking score"
            position="tl"
            show={showTooltip && !isContentScrolling}
            arrow
            static
          >
            <Anchor />
          </Tooltip>
        </TooltipsWrapper>
      )}
      <ScrollableContainer ref={scref} hasScroll={hasScroll}>
        {responses.length ? (
          responses.map((r) => (
            <ResponseCard key={r.id}>
              <MainInfo withAdditionalInfo={!!r.extraLabel}>
                <TopBlock>{r.label}</TopBlock>
                <Answer>{r.answer}</Answer>
              </MainInfo>
              {r.extraLabel && (
                <AdditionalInfo onMouseEnter={handleShowTooltip} onMouseLeave={handleHideTooltip}>
                  {r.extraLabel}
                </AdditionalInfo>
              )}
            </ResponseCard>
          ))
        ) : (
          <NoResponses>{NO_RESPONSES_LABEL}</NoResponses>
        )}
      </ScrollableContainer>
    </Container>
  );
};

export default SurveyResponsesList;
