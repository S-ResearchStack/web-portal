import React, {useEffect, useRef, useState} from 'react';
import styled from 'styled-components';

import Button from 'src/common/components/Button';
import {SnackbarContainer} from 'src/modules/snackbar';
import {colors, px, typography} from 'src/styles';
import StepDetail, {DetailFields} from "src/modules/auth/registration/StepDetail";
import StepContact, {ContactFields} from "src/modules/auth/registration/StepContact";
import SwipeableViews from 'react-swipeable-views'
import {useAppDispatch} from "src/modules/store";
import {registerUser, userEmailRegister} from "src/modules/auth/auth.slice";
import StepAttachment from "src/modules/auth/registration/StepAttachments";
import {useSelector} from "react-redux";
import ScreenCenteredCard from '../common/ScreenCenteredCard';
import ScreenHeader from '../common/ScreenHeader';
import ScreenWrapper from '../common/ScreenWrapper';
import ScreenContentWrapper from '../common/ScreenContentWrapper';


const Content = styled.div`
  width: ${px(448)};
  margin: auto;
  display: flex;
  flex-direction: column;
  padding-bottom: ${px(16)};
`;

const Header = styled(ScreenHeader)`
  margin: 0 auto ${px(36)};
`;

const ProgressWrapper = styled.div`
  display: flex;
  align-items: center;
  flex-direction: row;
  justify-content: center;
  column-gap: ${px(32)};
  margin-bottom: ${px(38)};;
`;

const ProgressText = styled.div.attrs((props: {enabled: boolean}) => props)`
  color: ${(props )=> props.enabled ? colors.primary : colors.primaryShadow} ;
  ${typography.bodyXSmallSemibold}
`;

const ButtonWrapper = styled.div`
  margin-top: ${px(32)};
  display: flex;
  align-items: stretch;
  flex-direction: row;
  column-gap: ${px(17)};
`;

type SignUpFields = DetailFields & ContactFields;

const RegistrationScreen: React.FC = () => {
  const totalPages = 3;

  const progresses = [ "Details", "Contacts", "Attachments" ]

  const hasPrevButtons = [false, true, true];
  const hasNextButtons = [true, true, false];

  const dispatch = useAppDispatch()
  
  const [finishedStates, setFinishedStates] = useState([false, false, true]);
  const [currentPage, setCurrentPage] = useState(0);

  const defaultSignUpFields: SignUpFields = {
    firstName: "",
    lastName: "",
    company: "",
    email: useSelector(userEmailRegister) ?? "",
    team: "",
    officePhone: "",
    mobilePhone: ""
  }

  const details = useRef(defaultSignUpFields);
  const setFirstName = (firstName: string) => { details.current.firstName = firstName };
  const setLastName = (lastName: string) => { details.current.lastName = lastName };
  const setCompany = (company: string) => { details.current.company = company };
  const setTeam = (team: string) => { details.current.team = team };

  const setOfficePhone = (officePhone: string) => {details.current.officePhone = officePhone};
  const setMobilePhone = (mobilePhone: string) => {details.current.mobilePhone = mobilePhone}
  const changeStatus = (finished: boolean) => {
    const currentStatus = finishedStates[currentPage]
    if(finished !== currentStatus) {
      const clickable = [...finishedStates]
      clickable[currentPage] = finished
      setFinishedStates(clickable)
    }
  }

  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
    }
  };

  const handleNext = () => {
    // re-check the button is enabled
    if (finishedStates[currentPage] && currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1)
    }
  };

  const handleSubmit = async () => {
    await dispatch(registerUser({
      firstName: details.current.firstName,
      lastName: details.current.lastName,
      company: details.current.company,
      team: details.current.team,
      officePhoneNumber: details.current.officePhone,
      mobilePhoneNumber: details.current.mobilePhone
    }))
  }

  useEffect(() => {

  }, [currentPage])

  return (
    <ScreenWrapper
      data-testid="auth-signup"
      mediaMaxHeightToScrollY={704}
      mediaMaxWidthToScrollX={732}
    >
      <ScreenCenteredCard minWidth={733} width={55.556} ratio={0.96125}>
        <ScreenContentWrapper>
          <Content>
            <Header>Add Information</Header>
            <ProgressWrapper>
              {progresses.map((progress, index) => (
                <ProgressText key={progress} enabled={currentPage === index}>{index + 1}. {progress}</ProgressText>
              ))}
            </ProgressWrapper>
            <SwipeableViews index={currentPage} animateTransitions>
              <StepDetail
                fields={details.current}
                onChangeFirstName={setFirstName}
                onChangeLastName={setLastName}
                onChangeCompany={setCompany}
                onChangeTeam={setTeam}
                onChangeStatus={changeStatus}
              />
              <StepContact
                fields={details.current}
                onChangeOfficePhone={setOfficePhone}
                onChangeMobilePhone={setMobilePhone}
                onChangeStatus={changeStatus}
              />
              <StepAttachment
                files={[]}
                onUploadFile={() => {}}
              />
            </SwipeableViews>
            <ButtonWrapper>
              <Button data-testid="registration-prev-button" fill="bordered" onClick={handlePrev} disabled={!hasPrevButtons[currentPage]}>Prev</Button>
              {hasNextButtons[currentPage] && <Button data-testid="registration-next-button" fill="solid" onClick={handleNext} disabled={!finishedStates[currentPage]}>Next</Button>}
              {currentPage === totalPages - 1  && <Button data-testid="registration-done-button" fill="solid" onClick={handleSubmit}>Done</Button>}
            </ButtonWrapper>
            </Content>
          <SnackbarContainer/>
        </ScreenContentWrapper>
      </ScreenCenteredCard>
    </ScreenWrapper>
  );
};

export default RegistrationScreen;
