import React, { ChangeEvent, useCallback, useEffect, useState } from 'react';
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

export interface ContactFields {
  email: string,
  officePhone: string,
  mobilePhone: string
}

interface ContactProps {
  fields: ContactFields,
  onChangeOfficePhone: (officePhone: string) => void,
  onChangeMobilePhone: (mobilePhone: string) => void,
  onChangeStatus: (finished: boolean) => void
}

const StepContact: React.FC<ContactProps> = (props) => {
  const {fields, onChangeOfficePhone, onChangeMobilePhone, onChangeStatus} = props;

  const [officePhone, setOfficePhone] = useState(fields.officePhone);
  const [mobilePhone, setMobilePhone] = useState(fields.mobilePhone);

  const handleOfficePhoneChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setOfficePhone(event.target.value)
      onChangeOfficePhone(event.target.value)
    },
    []
  );
  const handleMobilePhoneChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setMobilePhone(event.target.value)
      onChangeMobilePhone(event.target.value)
    },
    []
  );

  useEffect(() => {
    if(!officePhone && !mobilePhone) {
      onChangeStatus(false)
    } else if(officePhone && mobilePhone) {
      onChangeStatus(true)
    }
  }, [officePhone, mobilePhone])

  return (
    <InputsWrapper>
      <InputField
        data-testid="auth-signup-email"
        name="email"
        type="email"
        label="Email"
        value={fields.email}
        placeholder="Enter email"
        withoutErrorText
        disabled
        maxLength={256}
      />
      <InputField
        data-testid="auth-signup-office-phone"
        name="officePhone"
        type="text"
        label="Office Phone Number"
        value={officePhone}
        onChange={handleOfficePhoneChange}
        placeholder="Enter office phone number"
        withoutErrorText
        maxLength={256}
      />
      <InputField
        data-testid="auth-signup-mobile-phone"
        name="mobilePhone"
        type="text"
        label="Mobile Phone Number"
        value={mobilePhone}
        onChange={handleMobilePhoneChange}
        placeholder="Enter mobile phone number"
        withoutErrorText
        maxLength={256}
      />
    </InputsWrapper>
  );
};

export default StepContact;
