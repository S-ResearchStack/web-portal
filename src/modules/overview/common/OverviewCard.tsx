import React from 'react';
import styled from 'styled-components';

import { px, colors, boxShadow, typography } from 'src/styles';
import Link from 'src/common/components/Link';
import Tooltip from 'src/common/components/Tooltip';

import InfoIconSvg from 'src/assets/icons/info.svg';

type Props = {
  title: string;
  detailPath?: string;
  titleTooltip?: string;
  children?: React.ReactNode;
}
const OverviewCard = ({ title, titleTooltip, detailPath, children }: Props) => {
  return (
    <CardContainer>
      <CardTitle>
        <Title>
          <TitleText>
            {title}
          </TitleText>
          {titleTooltip && (
            <Tooltip
              arrow
              position="r"
              trigger="hover"
              horizontalPaddings="l"
              content={titleTooltip}
              styles={{
                maxWidth: px(333),
              }}
            >
              <InfoIconSvg />
            </Tooltip>
          )}
        </Title>
        <Action>
          {detailPath && (
            <Link to={detailPath}>
              View detail
            </Link>
          )}
        </Action>
      </CardTitle>
      <CardContent>
        {children}
      </CardContent>
    </CardContainer>
  );
};

export default OverviewCard;

const CardContainer = styled.div`
  height: 100%;
  box-sizing: border-box;
  border-radius: ${px(4)};
  box-shadow: ${boxShadow.card};
  background-color: ${colors.surface};
  padding: ${px(24)} ${px(24)} ${px(16)};
`;

const CardTitle = styled.div`
  display: flex;
  align-items: center;
  align-content: center;
  justify-content: space-between;
`
const Title = styled.div`
  svg {
    margin-left: ${px(4)};
    margin-bottom: ${px(-4)};
  }
`
const Action = styled.div`
`
const TitleText = styled.p`
  ${typography.headingSmall};
  color: ${colors.textPrimaryDark};
  display: inline-block;
  margin: 0;
`;

const CardContent = styled.div`
  padding-top: ${px(24)};
`
