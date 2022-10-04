import React from 'react';

import styled from 'styled-components';

import { px, typography } from 'src/styles';

const InfoWrapper = styled.div`
  height: ${px(84)};
`;

const Title = styled.div`
  ${typography.headingXSmall};
  line-height: ${px(24)};
  margin-bottom: ${px(8)};
`;

const Content = styled.div`
  ${typography.bodySmallRegular};
  line-height: ${px(26)};
`;

type SubjectInfoProps = {
  infoTitle: string;
  content: React.ReactNode;
};

const SubjectInfo = ({ infoTitle, content }: SubjectInfoProps) => (
  <InfoWrapper>
    <Title>{infoTitle}</Title>
    <Content>{content}</Content>
  </InfoWrapper>
);

export default SubjectInfo;
