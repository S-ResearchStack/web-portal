import React, { useEffect, useMemo, useRef, useState } from 'react';
import useWindowSize from 'react-use/lib/useWindowSize';

import styled, { css } from 'styled-components';

import { CardProps, RefreshIconStyled, Action, TitleContainer } from 'src/common/components/Card';
import Tooltip from 'src/common/components/Tooltip/Tooltip';
import OverviewCard from 'src/modules/overview/OverviewCard';
import {
  calculateLines,
  createHiddenCloneOfElement,
} from 'src/modules/study-management/user-management/common/utils';
import { colors, px, typography } from 'src/styles';

const twoLineText = css`
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

const oneLineText = css`
  display: block;
  overflow-x: clip;
  white-space: nowrap;
  text-overflow: ellipsis;
  word-wrap: break-word;
`;

export const CardStyled = styled(OverviewCard)<{ hasSubtitle: boolean }>`
  height: ${px(528)};
  padding-bottom: ${px(8)} !important;
  ${TitleContainer} {
    height: ${({ hasSubtitle }) => (hasSubtitle ? px(70) : px(30))};
  }
`;

const Title = styled.div<{ hasSubtitle: boolean; bottomAction?: boolean }>`
  display: flex;
  justify-content: space-between;
  height: fit-content;
  width: 100%;

  ${({ bottomAction }) =>
    bottomAction &&
    css`
      flex-direction: column;
      row-gap: ${px(5)};
    `};
`;

const TitleText = styled.div`
  ${typography.headingXSmall};
  color: ${colors.textPrimaryDark};
  margin: 0;
  width: fit-content;
  max-width: 100%;
  ${twoLineText};
`;

const SubtitleText = styled.div<{ subtitle?: string | boolean; twoLinesSubtitle?: boolean }>`
  ${typography.bodySmallRegular};
  color: ${colors.textSecondaryGray};
  min-height: ${({ subtitle }) => (subtitle === true ? px(0) : px(17))};
  min-width: ${px(50)};
  margin-top: ${px(8)};
  width: fit-content;
  max-width: 100%;
  height: 100%;

  ${({ twoLinesSubtitle }) =>
    typeof twoLinesSubtitle === 'boolean' && (twoLinesSubtitle ? twoLineText : oneLineText)};
`;

const getTextLinesCount = (element: HTMLElement, content: string) => {
  if (!content.length) {
    return 0;
  }

  const node = createHiddenCloneOfElement(element);
  document.body.appendChild(node);
  node.style.webkitLineClamp = '1000';
  node.style.overflowX = 'visible';
  node.style.whiteSpace = 'normal';
  node.innerText = content;

  const resultCount = calculateLines(node);
  node.remove();

  return resultCount;
};

const SurveyResponsesCard = ({
  title,
  subtitle,
  bottomAction,
  loading,
  action,
  error,
  ...props
}: CardProps) => {
  const [titleTextCount, setTitleTextCount] = useState<number>(1);
  const [titleTooltipOn, setTitleTooltipOn] = useState<boolean>(false);
  const [subtitleTooltipOn, setSubtitleTooltipOn] = useState<boolean>(false);

  const ref = useRef<HTMLDivElement>(null);

  const { width } = useWindowSize();

  useEffect(() => {
    const titleEl = ref.current?.querySelector(String(TitleText));
    if (titleEl && typeof title === 'string') {
      const titleLinesCount = getTextLinesCount(titleEl as HTMLElement, title as string);
      setTitleTextCount(titleLinesCount);
      setTitleTooltipOn(titleLinesCount > 2);
    }
  }, [title, width]);

  useEffect(() => {
    const subtitleEl = ref.current?.querySelector(String(SubtitleText));
    if (subtitleEl && typeof subtitle === 'string') {
      const subtitleLinesCount = getTextLinesCount(subtitleEl as HTMLElement, subtitle as string);
      setSubtitleTooltipOn(
        (titleTextCount > 1 && subtitleLinesCount > 1) ||
          (titleTextCount === 1 && subtitleLinesCount > 2)
      );
    }
  }, [subtitle, titleTextCount, width]);

  const titleWithTooltip = useMemo(
    () =>
      titleTooltipOn ? (
        <Tooltip
          content={title}
          trigger="hover"
          position="abl"
          arrow
          styles={{
            maxWidth: px(447),
            transform: `translate(0, ${px(-4)})`,
            pointerEvents: 'all',
          }}
        >
          <Title hasSubtitle={!!subtitle} bottomAction={bottomAction}>
            <TitleText data-testid="title">{title}</TitleText>
            {loading && <RefreshIconStyled data-testid="loader" />}
            {action && !error && <Action loading={loading}>{action}</Action>}
          </Title>
        </Tooltip>
      ) : (
        <Title hasSubtitle={!!subtitle} bottomAction={bottomAction}>
          <TitleText data-testid="title">{title}</TitleText>
          {loading && <RefreshIconStyled data-testid="loader" />}
          {action && !error && <Action loading={loading}>{action}</Action>}
        </Title>
      ),
    [titleTooltipOn, subtitle, title, bottomAction, loading, action, error]
  );

  const subtitleWithTooltip = useMemo(
    () =>
      subtitleTooltipOn ? (
        <Tooltip
          content={subtitle}
          trigger="hover"
          position="abl"
          arrow
          styles={{
            maxWidth: px(447),
            transform: `translate(0, ${px(-4)})`,
            pointerEvents: 'all',
          }}
        >
          <SubtitleText
            subtitle={subtitle as string | boolean}
            twoLinesSubtitle={titleTextCount === 1}
            data-testid="subtitle"
          >
            {subtitle}
          </SubtitleText>
        </Tooltip>
      ) : (
        <SubtitleText
          subtitle={subtitle as string | boolean}
          twoLinesSubtitle={titleTextCount === 1}
          data-testid="subtitle"
        >
          {subtitle}
        </SubtitleText>
      ),
    [titleTextCount, subtitleTooltipOn, subtitle]
  );

  return (
    <CardStyled
      ref={ref}
      title={titleWithTooltip}
      subtitle={subtitleWithTooltip}
      bottomAction={bottomAction}
      loading={loading}
      action={action}
      error={error}
      hasSubtitle={!!subtitle}
      {...props}
    />
  );
};

export default SurveyResponsesCard;
