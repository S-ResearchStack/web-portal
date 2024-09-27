import React, { ReactElement, useCallback, useMemo, useState } from 'react';
import CreateStudyCard from 'src/modules/studies/CreateStudyCard';
import styled from 'styled-components';

import { px, typography } from 'src/styles';
import StudyLayout from 'src/modules/studies/StudyLayout';
import Tabs from 'src/common/components/Tabs';
import { useTranslation } from '../localization/useTranslation';
import ParticipationRequirement from 'src/modules/studies/ParticipationRequirement';
import { IRBDecision, ParticipationApprovalType, StudyObject, StudyScope, durationUnitFirstKey, durationUnitSecondKey, periodUnitKey } from './studies.slice';
import { SnackbarContainer } from '../snackbar';
import { StudyRequirementObject } from './ParticipationRequirement.slice';

const MainWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: auto;
  height: 100vh;
  width: 100%;
  overflow-y: scroll;
  @media (max-height: ${px(475)}) {
    overflow-y: scroll;
  }
  @media (max-width: ${px(665)}) {
    overflow-x: scroll;
  }
`;
const Header = styled.div`
  ${typography.headingLargeSemibold};
  margin-top: ${px(100)};
`;

export enum tabIndex {
  BASIC_INFO = 0,
  REQUIREMENT = 1
}
const CreateStudyScreen: React.FC = () => {

  const initialStudyObject = {
    studyName: "",
    studyID: "",
    description: "",
    orgName: "",
    studyLogo: "secondarySkyblue",
    studyScope: StudyScope.PUBLIC,
    participationCode: "",
    participationApprovalType: ParticipationApprovalType.AUTOMATIC,
    duration: {
      amount: 10,
      durationUnitFirst: durationUnitFirstKey.MINUTE,
      durationUnitSecond: durationUnitSecondKey.DAY
    },
    period: {
      amount: 10,
      periodUnit: periodUnitKey.DAY,
    },
    studyRequirements: "",
    irbDecision: IRBDecision.EXEMPT,
    stage: "STARTED_OPEN"
  }

  const initialRequirement : StudyRequirementObject = {
    informedConsent: {imagePath: ""},
    healthDataTypeList: [],
  }

  const [activeTab, setActiveTab] = useState<tabIndex>(tabIndex.BASIC_INFO);
  const [studyInfo, setStudyInfo] = useState<StudyObject>(initialStudyObject);
  const [participantRequirement, setParticipantRequirement] = useState<StudyRequirementObject>(initialRequirement);

  const {t} = useTranslation()

  const handleSetStudyParams = useCallback(() => {
    setActiveTab(1);
  }, []);


  const tabs = useMemo(
    () =>
      [
        {
          id: tabIndex.BASIC_INFO,
          title: t("TITLE_BASIC_INFOR_TAB"),
          content: <CreateStudyCard onClick={handleSetStudyParams} studyInfo={studyInfo} setStudyInfo={setStudyInfo} />,
        },
        {
          id: tabIndex.REQUIREMENT,
          title: t("TITLE_PARTICIPATION_REQUIREMENTS_TAB"),
          content: <ParticipationRequirement studyInfo={studyInfo} setActiveTab={setActiveTab} participantRequirement={participantRequirement} setParticipantRequirement={setParticipantRequirement}></ParticipationRequirement>,
        },
      ] as const,
    [activeTab, studyInfo, participantRequirement]
  );

  const tabsLabels = useMemo(() => tabs.map((tab) => tab.title), [tabs]);
  const tabsContent = useMemo(() => tabs.find(tab => tab.id === activeTab), [activeTab, tabs]);

  return (
    <StudyLayout>
      <MainWrapper data-testid="create-study">
        <Header>{t("TITLE_CREATE_STUDY")}</Header>
        <Tabs items={tabsLabels} activeItemIdx={activeTab} onTabChange={() => { }} />
        {tabsContent?.content as ReactElement}
      </MainWrapper>
      <SnackbarContainer useSimpleGrid/>   
    </StudyLayout>
  );
};

export default CreateStudyScreen;
