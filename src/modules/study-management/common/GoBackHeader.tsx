import React, { FC, useCallback } from 'react';
import { useHistory } from 'react-router-dom';

import styled from 'styled-components';

import { colors, px, typography } from 'src/styles';
import ChevronLeftIcon from 'src/assets/icons/chevron_left.svg';
import { ExtendProps } from 'src/common/utils/types';

const Title = styled.div`
  ${typography.labelRegular};
  color: ${colors.textPrimary};
  padding: 0;
  margin: 0;
  letter-spacing: 0.03em;
  text-transform: uppercase;
`;

const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;

  svg {
    fill: ${colors.textPrimary};
    margin-right: ${px(6)};
  }
`;

const Container = styled.div`
  display: flex;
  align-items: center;
`;

type GoBackHeaderProps = ExtendProps<
  React.HTMLAttributes<HTMLDivElement>,
  {
    title: string;
    fallbackUrl?: string;
  }
>;

const HISTORY_MIN_LENGTH = 2;

const GoBackHeader: FC<GoBackHeaderProps> = ({ title, fallbackUrl, ...rest }) => {
  const history = useHistory();

  const handleBack = useCallback(() => {
    if (history.length <= HISTORY_MIN_LENGTH && fallbackUrl) {
      history.replace(fallbackUrl);
    } else {
      history.goBack();
    }
  }, [history, fallbackUrl]);

  return (
    <Container {...rest}>
      <TitleContainer onClick={handleBack}>
        <ChevronLeftIcon />
        <Title>{title}</Title>
      </TitleContainer>
    </Container>
  );
};

export default GoBackHeader;
