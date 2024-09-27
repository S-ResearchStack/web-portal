import * as React from "react"
import styled from "styled-components"

import {useSelectedStudyId} from "src/modules/studies/studies.slice"
import Card from "src/common/components/Card"
import {px, theme, typography} from "src/styles"
import {studyDataTheme} from "src/modules/study-data/StudyData.style"

import {ThemeProvider} from "@mui/material"
import StudyDataViewer from "src/modules/study-data/viewer/StudyDataViewer";

const MainContainer = styled.div`
  padding-left: ${px(48)};
  padding-right: ${px(48)};
  min-height: ${px(872)};
`

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
`

const CardContainer = styled(Card)<{ flex?: number, width?: string }>`
  flex: ${p => p.flex ?? 1};
  padding-top: 16px;
  padding-left: 8px !important;
  padding-right: 8px !important;
  height: 45vh;
  width: ${p => p.width};
  flex-shrink: 0;
`

export interface StudyDataProps {
  children?: React.ReactNode
}

const StudyData: React.FC<StudyDataProps> = () => {
  const studyId = useSelectedStudyId()

  return (
    // <SimpleGrid fullScreen>
    <MainContainer>
      <Header theme={theme}>
        Study Data
      </Header>
      <ThemeProvider theme={studyDataTheme}>
        <BodyContainer>
          <CardContainer style={{flex: 3, height: "calc(100vh - 128px)"}}>
            <StudyDataViewer studyId={studyId} />
          </CardContainer>
        </BodyContainer>
      </ThemeProvider>
    </MainContainer>
  )
}

export default StudyData
