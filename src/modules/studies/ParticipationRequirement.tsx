import React, { useState } from 'react';
import styled from 'styled-components';
import Button from 'src/common/components/Button';
import { colors, px, typography } from 'src/styles';
import { useTranslation } from '../localization/useTranslation';
import LabelForm from 'src/common/components/LabelForm';
import Plus from 'src/assets/icons/plus.svg';
import StudyDataTypeGroup from 'src/common/components/StudyDataTypeGroup';
import { StudyObject, useCreateStudy } from './studies.slice';
import { StudyRequirementObject, dataTypesSelector, setStudyRequirementFunc } from './ParticipationRequirement.slice';
import { useAppDispatch, useAppSelector } from '../store';
import { Path } from '../navigation/store';
import { push } from 'connected-react-router';
import { tabIndex } from './CreateStudyScreen';
import { StudyStage } from 'src/modules/api';

const Content = styled.div`
  height: fit-content;
  width: calc(100% / 3);
  margin: 50px 0;
`;

const StyledText = styled.div`
  ${typography.bodySmallRegular};
  color: ${colors.textSecondaryGray};
  line-height: ${px(25)};
`;

const CommonFormFieldWrapper = styled.div`
  margin: 15px 0;
  display: flex;
  flex-direction: column;
  row-gap: 8px;
  .button-add__image {
    width: fit-content;
  }
`;
const DataTypeCollectWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`

const MainButtonWrapper = styled.div`
  padding: ${px(20)} ${px(5)} ${px(100)} ${px(5)};
  border-top: 2px solid ${colors.black08};
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  .main-button {
    &__cancel  {
      width: 20%;
    }
  }
`

const RightButtonGroup = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 40%;
  &__continue  {
      width: 20%;
  }
  column-gap: 10px;
`
type Props = {
  studyInfo: StudyObject
  setActiveTab: React.Dispatch<React.SetStateAction<tabIndex>>;
  participantRequirement: StudyRequirementObject;
  setParticipantRequirement: React.Dispatch<React.SetStateAction<StudyRequirementObject>>;
};

const ParticipationRequirement = ({ studyInfo, setActiveTab,participantRequirement, setParticipantRequirement}: Props) => {
  const {t} = useTranslation();
  const [requirements, setRequirements] = useState<StudyRequirementObject>(participantRequirement);
  const dispatch = useAppDispatch();
  const  healthDataList = useAppSelector(dataTypesSelector);
  const { isLoading } = useCreateStudy();
  const [consentImage, setConsentImage] = useState<string>('');

  const isSelectAllDataType = healthDataList.every(group => 
    group.types.every(type => requirements.healthDataTypeList.includes(type)));

  const isAllSet = requirements.healthDataTypeList.length > 0

  const handleChangeRequirement = (key: keyof StudyRequirementObject, value: unknown) => {
    const newRequirement = {
      ...requirements,
      [key]: value,
    }
    setRequirements(newRequirement);
    setParticipantRequirement(newRequirement);
  }

  const handleUploadConsentFile = (value: any) => {
    if (!!value) {
      const consentUrl = URL.createObjectURL(value);
      handleChangeRequirement("informedConsent", {imagePath: consentUrl});
    }
  }
  const handleSelectAllDataType = () => {
    let newDataTypeList:string[] = [];
    if(isSelectAllDataType)
      newDataTypeList = [];
    else
      healthDataList.forEach(group => {newDataTypeList = [...newDataTypeList, ...group.types]});
    handleChangeRequirement("healthDataTypeList", newDataTypeList);
  }

  const handleClickContinueButton = () => {
    const transformedStudyInfo = {
      name: studyInfo.studyName,
      id: studyInfo.studyID,
      participationCode: studyInfo.participationCode,
      description: studyInfo.description || "",
      participationApprovalType: studyInfo.participationApprovalType,
      scope: studyInfo.studyScope,
      stage: "STARTED_OPEN" as StudyStage,
      startDate: new Date().toISOString(),
      logoUrl: studyInfo.studyLogo,
      imageUrl: studyInfo.studyImage || "",
      organization: studyInfo.orgName,
      duration: studyInfo.duration.amount + " " 
        + studyInfo.duration.durationUnitFirst + "/" 
        + studyInfo.duration.durationUnitSecond,
      period: studyInfo.period.amount + " " + studyInfo.period.periodUnit,
      requirements: [studyInfo.studyRequirements],
      irbDecisionType: studyInfo.irbDecision,
      irbDecidedAt: studyInfo.irbDecidedAt ? new Date(studyInfo.irbDecidedAt) : new Date(),
      irbExpiredAt: studyInfo.irbExpiredAt ? new Date(studyInfo.irbExpiredAt) : new Date(),
    }
    dispatch(setStudyRequirementFunc(transformedStudyInfo, requirements));
  }

  return (
      <Content>
        <CommonFormFieldWrapper>
          <LabelForm 
            label={t("LABEL_CONSENT_FORM")} 
            required={true} 
            />
          <StyledText>{t("CAPTION_CONSENT_FORM")}</StyledText>
          {consentImage ? (
            <StyledText >{consentImage} is uploaded</StyledText>
          ) : (
            <StyledText>No file is uploaded</StyledText>
          )}
          <Button fill="text" width={246} icon={<Plus />} onClick={() => {}} rippleOff className='button-add__image'>
            <label htmlFor="studyImage">{t("TITLE_ADD_STUDY_IMAGE")}</label>
            <input data-testid="create-study-consent-image" type="file" accept='.jpg, .jpeg, .png' id="studyImage" hidden onChange={(e) => {handleUploadConsentFile(e.target.files?.[0]); setConsentImage(e.target.files?.[0].name || '')}}/>
          </Button>
        </CommonFormFieldWrapper>
        <CommonFormFieldWrapper>
          <DataTypeCollectWrapper>
            <LabelForm label={t("LABEL_DATA_TYPE_TO_COLLECT")} required={true} />
            <Button data-testid='select-all-type' fill='text' width={100} onClick={handleSelectAllDataType}>
              {isSelectAllDataType ? t("TITLE_UNSELECT_ALL") : t("TITLE_SELECT_ALL")}
            </Button>
          </DataTypeCollectWrapper>
            {healthDataList.map(dataType => (
              <StudyDataTypeGroup
                key={dataType.name}
                groupTitle={dataType.name}
                groupTypes={dataType.types}
                onChangeDataType={handleChangeRequirement}
                requirements={requirements}
              />
            ))}
        </CommonFormFieldWrapper>

        <MainButtonWrapper>
          <Button
            data-testid="create-study-cancel"
            onClick={() => {dispatch(push(Path.Overview))}}
            fill="text"
            className='main-button__cancel'
          >
            {t("TITLE_CANCEL_BUTTON")}
          </Button>
          <RightButtonGroup>
            <Button
              data-testid="create-study-back"
              onClick={() => setActiveTab(0)}
              fill="bordered"
              className='main-button__continue'
              $loading={isLoading}
            >
              {t("TITLE_BACK_BUTTON")}
            </Button>
            <Button
              data-testid="create-study-send"
              disabled={!isAllSet}
              onClick={handleClickContinueButton}
              fill="solid"
              className='main-button__continue'
              $loading={isLoading}
            >
              {t("TITLE_CONTINUE_BUTTON")}
            </Button>
          </RightButtonGroup>
        </MainButtonWrapper>
      </Content>
  );
};

export default ParticipationRequirement;
