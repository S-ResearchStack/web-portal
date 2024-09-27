import React from "react";
import {colors, typography} from "src/styles";
import styled from "styled-components";
import {StudyDataText} from "src/modules/study-data/StudyData.style";


const Title = styled(StudyDataText)<{color?: string}>`
  ${typography.bodyLargeRegular};
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  color: ${p => p.color ?? colors.black60};
  width: 100%;
  height: 42px;
  background-color: rgba(0, 0, 0, .04);
  flex-shrink: 0;
`

interface StudyDataListTitleProps {
  title: string
  fontSize?: number
  fontColor?: string
}

const StudyDataTitle = ({ title, fontSize, fontColor }: StudyDataListTitleProps) =>
  <Title data-testid='study-data-title'>{title}</Title>

export default StudyDataTitle
