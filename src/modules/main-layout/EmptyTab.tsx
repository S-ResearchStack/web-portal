import React from 'react';

import styled from 'styled-components';
import NoDataIcon from 'src/assets/icons/no_data.svg';
import { px, typography } from 'src/styles';

const Container = styled.div`
  width: 100%;
  height: auto;
  min-height: 100%;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const Title = styled.div`
  margin-top: ${px(36)};
  ${typography.headingXMedium};
`;

const EmptyTab = () => (
  <Container>
    <NoDataIcon />
    <Title>You have no data yet.</Title>
  </Container>
);

export default EmptyTab;
