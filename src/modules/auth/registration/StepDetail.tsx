import React, {ChangeEvent, useCallback, useEffect, useState} from 'react';
import styled from 'styled-components';
import InputField from 'src/common/components/InputField';

const InputsWrapper = styled.div`
  margin-top: 3px;
  margin-bottom: 10px;
  display: flex;
  align-items: stretch;
  flex-direction: column;
  row-gap: 25px;
`;

const RowInputsWrapper = styled.div`
  display: flex;
  align-items: stretch;
  flex-direction: row;
  column-gap: 17px;
`;

export interface DetailFields {
  firstName: string,
  lastName: string,
  company: string,
  team: string
}

interface DetailProps {
  fields: DetailFields,
  onChangeFirstName: (firstName: string) => void,
  onChangeLastName: (lastName: string) => void,
  onChangeCompany: (company: string) => void,
  onChangeTeam: (team: string) => void,
  onChangeStatus: (finished: boolean) => void
}

const StepDetail: React.FC<DetailProps> = (props) => {
  const {fields, onChangeFirstName, onChangeLastName, onChangeCompany, onChangeTeam, onChangeStatus} = props;

  const [firstName, setFirstName] = useState(fields.firstName);
  const [lastName, setLastName] = useState(fields.lastName);
  const [company, setCompany] = useState(fields.company);
  const [team, setTeam] = useState(fields.team);

  const handleFirstNameChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setFirstName(event.target.value)
      onChangeFirstName(event.target.value)
    },
    []
  );
  const handleLastNameChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setLastName(event.target.value)
      onChangeLastName(event.target.value)
    },
    []
  );
  const handleCompanyChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setCompany((event.target.value))
      onChangeCompany(event.target.value)
    },
    []
  );
  const handleTeamChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setTeam(event.target.value)
      onChangeTeam(event.target.value)
    },
    []
  );

  useEffect(() => {
    if(!firstName && !lastName && !company && !team) {
      onChangeStatus(false)
    } else if(firstName && lastName && company && team) {
      onChangeStatus(true)
    }
  }, [firstName, lastName, company, team])

  return (
    <InputsWrapper>
      <RowInputsWrapper>
        <InputField
          data-testid="auth-signup-first-name"
          name="firstName"
          type="text"
          label="First Name"
          value={firstName}
          onChange={handleFirstNameChange}
          placeholder="Enter first name"
          withoutErrorText
          maxLength={30}
        />
        <InputField
          data-testid="auth-signup-last-name"
          name="lastName"
          type="text"
          label="Last Name"
          value={lastName}
          onChange={handleLastNameChange}
          placeholder="Enter last name"
          withoutErrorText
          maxLength={30}
        />
      </RowInputsWrapper>
      <InputField
        data-testid="auth-signup-company"
        name="company"
        type="text"
        label="Company"
        value={company}
        onChange={handleCompanyChange}
        placeholder="Enter company"
        withoutErrorText
        maxLength={30}
      />
      <InputField
        data-testid="auth-signup-team"
        name="team"
        type="text"
        label="Team"
        value={team}
        onChange={handleTeamChange}
        placeholder="Enter team"
        withoutErrorText
        maxLength={30}
      />
    </InputsWrapper>
  );
};

export default StepDetail;
