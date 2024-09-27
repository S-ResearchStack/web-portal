import React from 'react';
import styled from 'styled-components';
import { px, typography } from 'src/styles';
import Card from 'src/common/components/Card';
import { RowContainer } from 'src/common/styles/layout';
import SubjectManagement from './SubjectManagement/SubjectManagement';

const MainContainer = styled.div`
  padding-left: ${px(48)};
  padding-right: ${px(48)};
  min-height: ${px(872)};
`;

const Header = styled.div`
  ${typography.labelSemibold};
  color: ${({ theme }) => theme.colors.textPrimary};
  letter-spacing: 0.03em;
  text-transform: uppercase;
  min-height: ${px(24)};
  margin-top: ${px(36)};
`;

const BodyContainer = styled.div`
  display: flex;
  flex-direction: row;
`;
const CardContainer = styled(Card)<{ flex?: number; width?: string }>`
  flex: ${(p) => p.flex ?? 1};
  padding-top: 16px;
  padding-left: 8px !important;
  padding-right: 8px !important;
  height: 45vh;
  width: ${(p) => p.width};
  flex-shrink: 0;
`;

export interface StudyManagementProps {
  children?: React.ReactNode;
}

const StudyManagement: React.FC<StudyManagementProps> = () => {
  return (
    <MainContainer>
      <Header>Study Management</Header>
      <BodyContainer>
        <CardContainer style={{ height: 'calc(100vh - 128px)' }}>
          <RowContainer style={{ flex: 1 }}>
            <SubjectManagement />
          </RowContainer>
        </CardContainer>
      </BodyContainer>
    </MainContainer>
  );
};

export default StudyManagement;
