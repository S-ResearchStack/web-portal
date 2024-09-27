import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import styled from 'styled-components';

import Button from 'src/common/components/Button';
import InputField, { InputFieldShell } from 'src/common/components/InputField';
import StudyAvatar from 'src/common/components/StudyAvatar';
import { SpecColorType } from 'src/styles/theme';
import { colors, px, typography } from 'src/styles';

import { useTranslation } from '../localization/useTranslation';
import TextArea from '../../common/components/TextArea';
import LabelForm from 'src/common/components/LabelForm';
import Plus from 'src/assets/icons/plus.svg';
import Image from 'src/assets/icons/image.svg';
import Radio from 'src/common/components/Radio';
import Dropdown from 'src/common/components/Dropdown';
import { IRBDecision, ParticipationApprovalType, StudyObject, StudyScope, durationUnitFirstKey, durationUnitSecondKey, periodUnitKey} from './studies.slice';
import DatePicker from 'src/common/components/DatePicker';
import { useAppDispatch, useAppSelector } from '../store';
import {  dataTypesIsLoadingSelector, fetchDataTypes } from './ParticipationRequirement.slice';
import { push } from 'connected-react-router';
import { Path } from '../navigation/store';

const Content = styled.div`
  height: fit-content;
  width: calc(100% / 3);
  margin: 50px 0;
`;

const LogosWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  height: ${px(127)};
  width: 100%;
  margin: ${px(8)} 0 ${px(42)};
  .button-add__image {
    width: fit-content;
  }
`;

const StyledTextHeading = styled.div`
  ${typography.bodySmallRegular};
  color: ${colors.textPrimaryDark};
  height: ${px(42)};
`;

const StyledText = styled.div`
  ${typography.bodySmallRegular};
  color: ${colors.textSecondaryGray};
  line-height: ${px(25)};
`;

const StyledSelectedLogo = styled.div`
  margin-top: ${px(10)};
`
const StyledLogos = styled.div`
  position: relative;
  width: 100%;
  padding: ${px(20)} 0;
  height: ${px(72)};
  gap: 15px;
  display: flex;
  justify-content: flex-start;
`;

const AvatarWrapper = styled.div<{ $selected?: boolean }>`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: ${({ $selected }) => !$selected && px(4)};
`;

const CommonFormFieldWrapper = styled.div`
  margin: 20px 0;
  display: flex;
  flex-direction: column;
  row-gap: 8px;
`;

const StudyImageWrapper = styled.div`
  padding-top: ${px(50)};
  .button-add__image {
    width: fit-content;
  }
`;

const ImageUploadFrame = styled.div`
  width: 100%;
  height: ${px(400)};
  background-color: ${colors.black15};
  border-radius: ${px(10)};
  border: 1px solid ${colors.black08};
  margin: ${px(20)} 0 ${px(10)} 0;
  display: grid;
  place-items: center;
  img {
    width: inherit;
    height: inherit;
    object-fit: contain;
    border-radius: ${px(10)};
  }
`;


const RadioOptionTitle = styled.span`
  ${typography.bodyMediumRegular}
`;

const PeriodWrapper = styled.div`
  display: flex;
  align-items: center;
  column-gap: 10px;
  .custom-input__wrapper {
    margin-top: -5px;
  }
`;

const DurationWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  column-gap: 5px;
  .custom-input__wrapper {
    margin-top: -5px;
  }
`;

const IRBDecisionTimeWrapepr = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  column-gap: ${px(10)};
`

const DateInputShell = styled(InputFieldShell)`
  width: ${px(312)};
`;

const MainButtonWrapper = styled.div`
  padding: ${px(20)} ${px(5)} ${px(100)} ${px(5)};
  border-top: 2px solid ${colors.black08};
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  .main-button {
    &__cancel, &__continue  {
      width: 20%;
    }
  }
`
type AvatarInfo = {
  color: SpecColorType;
  selected?: boolean;
};

type AvatarIdx = number;

export const avatarColors: Array<AvatarInfo> = [
  { color: 'secondarySkyblue' },
  { color: 'secondaryViolet' },
  { color: 'secondaryTangerine' },
  { color: 'secondaryGreen' },
  { color: 'secondaryRed' },
]

type RegexMessage = {
  regex: RegExp;
  errorMessage: string;
}

type Props = {
  onClick: (studyInfo: StudyObject, tabIndex: number) => void;
  studyInfo: StudyObject;
  setStudyInfo: React.Dispatch<React.SetStateAction<StudyObject>>;
};
const CreateStudyCard = ({ onClick, studyInfo, setStudyInfo }: Props) => {
  const [selectedAvatarId, setSelectedAvatarId] = useState<AvatarIdx>(0);
  const [hoveredAvatarId, setHoveredAvatarId] = useState<AvatarIdx>(0);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [participationCode, setParticipationCode] = useState<string>(studyInfo?.participationCode || '');
  const isDataTypeLoading = useAppSelector(dataTypesIsLoadingSelector);
  const studyNameRef = useRef<HTMLInputElement>(null);
  const {t} = useTranslation();
  const dispatch = useAppDispatch();
  const isAllRequiredFieldSet = useMemo(() => 
    studyInfo.studyName && studyInfo.studyName.trim() != ''
    && studyInfo.studyID && studyInfo.studyID.trim() != '' && !(/[^A-Za-z0-9]+/g).test(studyInfo.studyID)
    && studyInfo.orgName && studyInfo.orgName.trim() != ''
    && studyInfo.participationApprovalType 
    && studyInfo.duration.amount && ("" + studyInfo.duration.amount).trim() 
    && !(/[^0-9]+/g).test("" + studyInfo.duration.amount)
    && studyInfo.period.amount && ("" + studyInfo.period.amount).trim() 
    && !(/[^0-9]+/g).test("" + studyInfo.period.amount)
    && studyInfo.studyRequirements && studyInfo.studyRequirements.trim()
  , [studyInfo])
  const isAllSet = useMemo(() => 
    isAllRequiredFieldSet 
    && studyInfo.irbDecision !== IRBDecision.APPROVED
    && studyInfo.studyScope !== StudyScope.PRIVATE 
    || (isAllRequiredFieldSet && studyInfo.irbDecision === IRBDecision.APPROVED 
      && studyInfo.irbDecidedAt && studyInfo.irbExpiredAt)
    || (isAllRequiredFieldSet && studyInfo.studyScope === StudyScope.PRIVATE
       && studyInfo.participationCode)
  , [studyInfo])
  // TODO add hotkeys
  const handleChange = useCallback((key: keyof StudyObject, value: any) => {
    const newStudyInfo = {
      ...studyInfo,
      [key]: value,
    }
    setStudyInfo(newStudyInfo);
  }, [studyInfo]);

  const handleSetSelected = useCallback((color: AvatarIdx) => {
    setHoveredAvatarId(color);
    setSelectedAvatarId(color);
  }, []);

  const handleClickNextButton = async () => {
    await dispatch(fetchDataTypes());
    onClick(studyInfo, 1);
  }

  const studyScopeOptions = useMemo(() => [
    {
      id: StudyScope.PUBLIC,
      value: "PUBLIC",
      content: <div>
        <RadioOptionTitle>
          {t("LABEL_STUDY_SCOPE_PUBLIC")}
        </RadioOptionTitle>
        <StyledText>
          {t("CAPTION_STUDY_SCOPE_PUBLIC")}
        </StyledText>
      </div>
    },
    {
      id: StudyScope.PRIVATE,
      value: "PRIVATE",
      content: <div>
      <RadioOptionTitle>
        {t("LABEL_STUDY_SCOPE_PRIVATE")}
      </RadioOptionTitle>
      <StyledText>
        {t("CAPTION_STUDY_SCOPE_PRIVATE")}
      </StyledText>
    </div>
    }
  ], []);

  const ParticipationTypeOptions = useMemo(() => [
    {
      id: ParticipationApprovalType.AUTOMATIC,
      value: "AUTO",
      content: <div>
        <RadioOptionTitle>
          {t("LABEL_PARTICIPATION_APPROVAL_TYPE_AUTO")}
        </RadioOptionTitle>
        <StyledText>
          {t("CAPTION_PARTICIPATION_APPROVAL_TYPE_AUTO")}
        </StyledText>
      </div>
    },
    {
      id: ParticipationApprovalType.MANUAL,
      value: "MANUAL",
      content: <div>
      <RadioOptionTitle>
        {t("LABEL_PARTICIPATION_APPROVAL_TYPE_MANUAL")}
      </RadioOptionTitle>
      <StyledText>
        {t("CAPTION_PARTICIPATION_APPROVAL_TYPE_MANUAL")}
      </StyledText>
    </div>
    }
  ], []);

  const IRBDecisions = useMemo(() => [
    {
      id: IRBDecision.EXEMPT,
      value: "EXEMPT",
      content: <div>
      <RadioOptionTitle>
        {t("LABEL_IRB_DECISION_EXEMPT")}
      </RadioOptionTitle>
      <StyledText>
        {t("CAPTION_IRB_DECISION_EXEMPT")}
      </StyledText>
    </div>
    },
    {
      id: IRBDecision.APPROVED,
      value: "APPROVED",
      content: <div>
      <RadioOptionTitle>
        {t("LABEL_IRB_DECISION_APPROVED")}
      </RadioOptionTitle>
      <StyledText>
        {t("CAPTION_IRB_DECISION_APPROVED")}
      </StyledText>
    </div>
    }
  ], []);

  const durationUnitFirst = [
    { label: 'minute(s)', key: durationUnitFirstKey.MINUTE},
    { label: 'hours(s)', key: durationUnitFirstKey.HOUR},
  ]
  const durationUnitSecond = [
    { label: 'day', key: durationUnitSecondKey.DAY},
    { label: 'week', key: durationUnitSecondKey.WEEK},
    { label: 'month', key: durationUnitSecondKey.MONTH},
  ]
  const periodUnit = [
    { label: 'day(s)', key: periodUnitKey.DAY},
    { label: 'week(s)', key: periodUnitKey.WEEK},
    { label: 'month(s)', key: periodUnitKey.MONTH},
  ]

  useEffect(() => {
    studyNameRef.current?.focus();
  }, [])

  const handleStudyAvatarsFocus = useCallback(() => setHoveredAvatarId(0), []);

  const handleStudyAvatarsBlur = useCallback(() => setHoveredAvatarId(-1), []);

  const handleAvatarMouseEnter = useCallback(
    (avatarId: AvatarIdx) => setHoveredAvatarId(avatarId),
    []
  );

  const handleAvatarMouseLeave = useCallback(
    () => setHoveredAvatarId(selectedAvatarId),
    [selectedAvatarId]
  );

  const handleSelectLogo = (avatar: AvatarInfo, index: AvatarIdx) => {
    handleSetSelected(index);
    handleChange("studyLogo", avatar.color);
  }
  const handleUploadImage = (value:any) => {
    if (!!value) {
      const imageSrc = URL.createObjectURL(value);
      setImageSrc(imageSrc);
      handleChange("studyImage", imageSrc);
    }
  }

  useEffect(() => 
    handleChange("participationCode", participationCode), 
  [participationCode]);

  const getErrorMessage = useCallback((required: boolean, value: any, regs?: RegexMessage[]) => {
    if (required && ("" + value)?.trim() === '')
      return t("ERROR_REQUIRED_FIELD");
    if(regs?.length) {
      return regs.find((regs) => regs.regex.test(value))?.errorMessage;
    }
  }, []);
  return (
      <Content>
        <InputField
          data-testid="create-study-name"
          ref={studyNameRef}
          type="text"
          label={t("LABEL_STUDY_NAME")}
          value={studyInfo?.studyName}
          onChange={(e) => handleChange("studyName", e.target.value)}
          tabIndex={0}
          placeholder={t("PLACEHOLDER_NAME_YOUR_STUDY")}
          maxLength={30}
          required={true}
          error={getErrorMessage(true, studyInfo?.studyName)}
        />
        <InputField
          data-testid="create-study-id"
          type="text"
          label={t("LABEL_STUDY_ID")}
          value={studyInfo?.studyID}
          onChange={(e) => handleChange("studyID", e.target.value)}
          tabIndex={0}
          placeholder={t("PLACEHOLDER_STUDY_ID")}
          maxLength={30}
          required={true}
          caption={t("CAPTION_STUDY_ID")}
          error={getErrorMessage(
            true,
            studyInfo?.studyID,
            [
              { regex: /(^[^A-Za-z])|[^A-Za-z0-9]+/g, errorMessage: t("ERROR_REGEX_INCLUDE_LETTERS_NUMBERS") },
            ]
          )}
        />
        <CommonFormFieldWrapper>
          <LabelForm label={t("LABEL_DESCRIPTION")} />
          <TextArea
            data-testid="create-study-description"
            appearance='bordered'
            autoHeight={true}
            rows={3}
            placeholder={t("PLACEHOLDER_DESCRIPTION")}
            value={studyInfo?.description}
            onChange={(e) => handleChange("description", e.target.value)}
          />
        </CommonFormFieldWrapper>
        <InputField
          data-testid="create-study-organization"
          type="text"
          label={t("LABEL_ORGANIZATION")}
          value={studyInfo?.orgName}
          onChange={(e) => handleChange("orgName", e.target.value)}
          tabIndex={0}
          placeholder={t("PLACEHOLDER_YOUR_ORGANIZATION")}
          maxLength={30}
          required={true}
          error={getErrorMessage(true, studyInfo?.orgName)}
        />
        <LogosWrapper>
          <StyledTextHeading>
            <LabelForm label={t("LABEL_STUDY_LOGO")}/>
            <StyledText>{t("CAPTION_SELECT_STUDY_LOGO")}</StyledText>
          </StyledTextHeading>
          <StyledSelectedLogo>
            <StudyAvatar
              data-testid="selected-avatar"
              color={studyInfo?.studyLogo as SpecColorType || avatarColors[selectedAvatarId]?.color}
              size="m"
            />
          </StyledSelectedLogo>
          <StyledLogos
            tabIndex={0}
            onFocus={handleStudyAvatarsFocus}
            onBlur={handleStudyAvatarsBlur}
          >
            {avatarColors.map((avatar, idx: AvatarIdx) => (
              <AvatarWrapper $selected={selectedAvatarId === idx} key={avatar.color}>
                <StudyAvatar
                  data-testid="create-study-avatar"
                  key={avatar.color}
                  color={avatar.color}
                  size="s"
                  $selected={selectedAvatarId === -1 ? undefined : selectedAvatarId === idx}
                  faded={selectedAvatarId === idx || hoveredAvatarId === idx}
                  onMouseEnter={() => handleAvatarMouseEnter(idx)}
                  onMouseLeave={handleAvatarMouseLeave}
                  onClick={() => handleSelectLogo(avatar, idx)}
                />
              </AvatarWrapper>
            ))}
          </StyledLogos>
        </LogosWrapper>
        <StudyImageWrapper>
          <StyledTextHeading>
            <LabelForm label={t("LABEL_STUDY_IMAGE")}/>
            <StyledText>{t("CAPTION_SELECT_STUDY_IMAGE")}</StyledText>
          </StyledTextHeading>
          <ImageUploadFrame>
            {studyInfo?.studyImage ? (<img src={studyInfo?.studyImage} alt='study-image'/>) 
              : imageSrc 
                ? (<img src={imageSrc} alt='study-image'/>)
                : <Image/>
            }
          </ImageUploadFrame>
          <Button fill="text" width={246} icon={<Plus />} onClick={() => {}} rippleOff className='button-add__image'>
            <label htmlFor="studyImage">{t("TITLE_ADD_STUDY_IMAGE")}</label>
            <input type="file" id="studyImage" hidden onChange={e => handleUploadImage(e.target.files?.[0])}/>
          </Button>
        </StudyImageWrapper>
        <CommonFormFieldWrapper>
          <LabelForm label={t("LABEL_STUDY_SCOPE")} required={true}/>
          {
            studyScopeOptions.map(scope => (
              <Radio
                data-testid={`${scope.id}-checkbox`}
                key={scope.id}
                checked={scope.id === studyInfo?.studyScope} 
                value={scope.id}
                onChange={(e) => {
                  handleChange("studyScope", e.target.value);
                  setParticipationCode("");
                }}
              >
                {scope.content}
              </Radio>
            ))
          }
        </CommonFormFieldWrapper>
        {studyInfo.studyScope === StudyScope.PRIVATE &&
          <InputField
            data-testid="create-study-code"
            type="text"
            label={t("LABEL_PARTICIPATION_CODE")}
            value={studyInfo?.participationCode}
            onChange={(e) => setParticipationCode(e.target.value)}
            tabIndex={0}
            placeholder={t("PLACEHOLDER_PARTICIPATION_CODE")}
            maxLength={30}
            required={studyInfo.studyScope === StudyScope.PRIVATE}
            error={getErrorMessage(
              studyInfo.studyScope === StudyScope.PRIVATE,
              studyInfo?.participationCode
            )}
          />
        }
        <CommonFormFieldWrapper>
          <LabelForm label={t("LABEL_PARTICIPATION_APPROVAL_TYPE")} required={true} />
          {
            ParticipationTypeOptions.map(type => (
              <Radio
                key={type.id}
                checked={type.id === studyInfo.participationApprovalType}
                value={type.id}
                onChange={(e) => handleChange("participationApprovalType", e.target.value)}
              >
                {type.content}
              </Radio>
            ))
          }
        </CommonFormFieldWrapper>
        <CommonFormFieldWrapper>
          <LabelForm 
            label={t("LABEL_STUDY_DURATION")} 
            required={true}
            error={!studyInfo?.duration.amount || ("" + studyInfo?.duration.amount).trim() === ""}
          />
          <StyledText>{t("CAPTION_STUDY_DURATION")}</StyledText>
          <DurationWrapper>
            <InputField 
              className='custom-input__wrapper'
              data-testid="create-study-duration"
              type="text"
              value={studyInfo?.duration.amount}
              onChange={(e) => handleChange("duration", {...studyInfo?.duration, amount: e.target.value})}
              tabIndex={0}
              error={getErrorMessage(
                true, 
                studyInfo?.duration.amount,
                [{regex: /[^0-9]+/g, errorMessage: t("ERROR_REGEX_INCLUDE_NUMBERS")}]
              )}
            />
            <Dropdown
              activeKey={studyInfo?.duration.durationUnitFirst}
              items={durationUnitFirst}
              onChange={(key) => handleChange("duration", {...studyInfo?.duration, durationUnitFirst: key})}
              maxVisibleMenuItems={4}
              backgroundType='light'
            />
            <span>per</span>
            <Dropdown
              activeKey={studyInfo?.duration.durationUnitSecond}
              items={durationUnitSecond}
              onChange={(key) => handleChange("duration", {...studyInfo?.duration, durationUnitSecond: key})}
              maxVisibleMenuItems={4}
              backgroundType='light'
            />
          </DurationWrapper>
        </CommonFormFieldWrapper>
        <CommonFormFieldWrapper>
          <LabelForm 
            label={t("LABEL_STUDY_PERIOD")} 
            required={true}
            error={!studyInfo?.period.amount || ("" + studyInfo?.period.amount).trim() === ''}
          />
          <StyledText>{t("CAPTION_STUDY_PERIOD")}</StyledText>
          <PeriodWrapper>
            <InputField 
              className='custom-input__wrapper'
              data-testid="create-study-period"
              type="text"
              value={studyInfo?.period.amount}
              onChange={(e) => handleChange("period", {...studyInfo?.period, amount: e.target.value})}
              tabIndex={0}
              error={getErrorMessage(
                true, 
                studyInfo?.period.amount,
                [{regex: /[^0-9]+/g, errorMessage: t("ERROR_REGEX_INCLUDE_NUMBERS")}]
              )}
            />
            <Dropdown
              activeKey={studyInfo?.period.periodUnit}
              items={periodUnit}
              onChange={(key) => handleChange("period", {...studyInfo?.period, periodUnit: key})}
              maxVisibleMenuItems={4}
              backgroundType='light'
            />
          </PeriodWrapper>
        </CommonFormFieldWrapper>
        <CommonFormFieldWrapper>
          <LabelForm 
            label={t("LABEL_STUDY_REQUIREMENT")} 
            required={true} 
            error={!studyInfo.studyRequirements || studyInfo.studyRequirements.trim() === ''}
          />
          <TextArea
            data-testid="create-study-requirements"
            appearance='input'
            autoHeight={true}
            rows={3}
            placeholder={t("PLACEHOLDER_REQUIREMENT")}
            onChange={(e) => handleChange("studyRequirements", e.target.value)}
            value={studyInfo.studyRequirements}
            invalid={!studyInfo.studyRequirements || studyInfo.studyRequirements.trim() === ''}
            error={getErrorMessage(true, studyInfo?.studyRequirements)}
          />
        </CommonFormFieldWrapper>
        <CommonFormFieldWrapper>
          <LabelForm label={t("LABEL_IRB_DECISION")} required={true} />
          {
            IRBDecisions.map(decision => (
              <Radio
                key={decision.id}
                checked={decision.id === studyInfo.irbDecision}
                value={decision.id}
                onChange={(e) => handleChange("irbDecision", e.target.value)}
              >
                {decision.content}
              </Radio>
            ))
          }
          {studyInfo.irbDecision === IRBDecision.APPROVED && 
            <IRBDecisionTimeWrapepr>
              <DateInputShell label={t("LABEL_APPROVAL_START_DATE")} required>
                <DatePicker
                  value={studyInfo.irbDecidedAt}
                  onChange={(date) => {handleChange("irbDecidedAt", date)}}
                />
              </DateInputShell>
              <DateInputShell label={t("LABEL_APPROVAL_EXPIRATION_DATE")} required>
                <DatePicker
                  value={studyInfo.irbExpiredAt}
                  min={studyInfo.irbDecidedAt}
                  max={undefined}
                  onChange={(date) => {handleChange("irbExpiredAt", date)}}
                />
              </DateInputShell>
            </IRBDecisionTimeWrapepr>
          }
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
          <Button
            data-testid="create-study-next"
            disabled={!isAllSet}
            onClick={handleClickNextButton}
            fill="solid"
            className='main-button__continue'
            $loading={isDataTypeLoading}
          >
            {t("TITLE_NEXT_BUTTON")}
          </Button>
        </MainButtonWrapper>
      </Content>
  );
};

export default CreateStudyCard;
