import React, { FC } from 'react';
import styled from 'styled-components';

import ChevronLeftIcon from 'src/assets/icons/chevron_left.svg';
import { colors, px, typography } from 'src/styles';

const Container = styled.div`
  display: flex;
  align-items: center;

  svg {
    fill: ${colors.updTextPrimary};
    margin-right: ${px(8)};
  }
`;

const ClickableOpacity = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin: 0;
  border: none;
  background: transparent;
`;

const Title = styled.h4`
  ${typography.labelRegular};
  color: ${colors.updTextPrimary};
  padding: 0;
  margin: 0;
  letter-spacing: 0.03em;
  text-transform: uppercase;
`;

interface BreadcrumbsProps {
  $title: string;
}

const Breadcrumbs: FC<BreadcrumbsProps> = ({ $title }) => (
  <Container>
    <ClickableOpacity>
      <ChevronLeftIcon />
      <Title>{$title}</Title>
    </ClickableOpacity>
  </Container>
);

export default Breadcrumbs;
