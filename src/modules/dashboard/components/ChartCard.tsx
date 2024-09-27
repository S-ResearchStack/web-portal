import React, { ForwardedRef, forwardRef, ReactElement } from 'react';
import styled from 'styled-components';

import { boxShadow, colors, px, typography } from 'src/styles';

export const MIN_CARD_HEIGHT = 412;

type BaseCardProps = React.PropsWithChildren<Omit<React.HTMLAttributes<HTMLDivElement>, 'title'>>;
interface ChartCardProps extends BaseCardProps, React.RefAttributes<HTMLDivElement> {
  loading?: boolean;
  title?: string;
  cardAction?: React.ReactNode;
}
const ChartCard = forwardRef(
  (
    { loading, title, cardAction, children }: ChartCardProps,
    ref: ForwardedRef<HTMLDivElement>
  ): ReactElement => {
    return (
      <CardContainer ref={ref}>
        <Title>
          <TitleText title={title}>{title}</TitleText>
          {cardAction && <TitleAction>{cardAction}</TitleAction>}
        </Title>
        <Content contentLoading={loading}>{children}</Content>
      </CardContainer>
    );
  }
);

const CardContainer = styled.div`
  display: flex;
  overflow: visible;
  position: relative;
  flex-direction: column;
  box-sizing: border-box;
  border-radius: ${px(4)};
  box-shadow: ${boxShadow.card};
  background-color: ${colors.surface};
  padding: ${px(24)} ${px(24)} ${px(16)};
  min-height: ${px(MIN_CARD_HEIGHT)};
  > * {
    min-width: 0;
    min-height: 0;
    overflow: visible;
  }
`;

const Title = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Content = styled.div<{ contentLoading?: boolean }>`
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  opacity: ${({ contentLoading }) => (contentLoading ? 0.6 : 1)};
`;

const TitleText = styled.p`
  ${typography.headingXSmall};
  color: ${colors.textPrimaryDark};
  display: inline-block;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TitleAction = styled.div`
  overflow: visible;
  position: relative;
`;

export default ChartCard;
