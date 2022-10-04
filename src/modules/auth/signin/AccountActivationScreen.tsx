import React, { ChangeEvent, useEffect, useMemo, useState } from 'react';
import PasswordValidator from 'password-validator';
import styled from 'styled-components';
import { useLocation } from 'react-router-dom';

import LockIcon from 'src/assets/icons/lock.svg';
import Button from 'src/common/components/Button';
import InputField from 'src/common/components/InputField';
import PasswordInputField from 'src/common/components/PasswordInputField';
import Radio from 'src/common/components/Radio';
import { SnackbarContainer } from 'src/modules/snackbar';
import { useAppDispatch } from 'src/modules/store';
import { px, typography } from 'src/styles';
import { activateAccount } from '../auth.slice';
import { useEnterPress } from './hooks';
import ScreenCenteredCard from './ScreenCenteredCard';

type PasswordRequirement = {
  rule: string;
  passed?: boolean;
  validator: PasswordValidator;
};

const getRequirements = (userName: string) => [
  {
    rule: 'Be at least 12 characters in length',
    validator: new PasswordValidator().is().min(12),
  },
  {
    rule: 'Contains 1 upper case, 1 lower case, 1 number, and 1 special character',
    validator: new PasswordValidator()
      .has()
      .uppercase()
      .has()
      .lowercase()
      .has()
      .digits()
      .has()
      .symbols(),
  },
  {
    rule: 'Does not contain more than 3 identical characters in a row',
    validator: new PasswordValidator().not(/(.)\1{3,}/g),
  },
  {
    rule: 'Does not contain username',
    validator: new PasswordValidator().not(userName),
  },
];

const checkPassword = (password: string, userName: string): Array<PasswordRequirement> =>
  getRequirements(userName).map((r) => ({
    ...r,
    passed: password.length ? (r.validator.validate(password) as boolean) : undefined,
  }));

const MainWrapper = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  @media (max-height: ${px(704)}) {
    overflow-y: scroll;
  }
  @media (max-width: ${px(732)}) {
    overflow-x: scroll;
  }
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: center;
`;

const Content = styled.div`
  height: ${px(641)};
  width: ${px(448)};
  margin: auto;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const Header = styled.div`
  ${typography.headingLargeSemibold};
  margin: 0 auto ${px(36)};
`;

const RequirementsWrapper = styled.div`
  display: inline-flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  height: ${px(182)};
  width: ${px(447)};
  top: ${px(8)};
  margin-bottom: ${px(10)};
`;

const StyledRequirement = styled.div`
  ${typography.titleRegular16};
  height: ${px(40)};
  &:nth-child(2) {
    height: ${px(62)};
    width: ${px(370)};
  }
`;

const RequirementText = styled.span<{ disabled: boolean }>`
  color: ${({ disabled, theme }) =>
    disabled ? theme.colors.updTextDisabled : theme.colors.updTextPrimary};
`;

const AccountActivationScreen: React.FC = () => {
  const [password, setPassword] = useState<string>('');
  const [disabled, setDisabled] = useState<boolean>(true);
  const [name, setName] = useState<string>('');
  const [isLoading, setLoading] = useState(false);

  const dispatch = useAppDispatch();

  const location = useLocation();
  const { email, resetToken } = useMemo(() => {
    const query = new URLSearchParams(location.search);
    return {
      email: query.get('email') || '',
      resetToken: query.get('reset-token') || '',
    };
  }, [location.search]);

  const [isPassed, requirements] = useMemo(() => {
    // TODO: maybe later backend will provide user name
    const userName = email.split('@')[0];

    return [
      checkPassword(password, userName).every((r) => r.passed === true),
      checkPassword(password, userName),
    ];
  }, [password, email]);

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const handleClick = async () => {
    if (disabled) {
      return;
    }
    try {
      setLoading(true);
      await dispatch(
        activateAccount({
          email,
          name,
          password,
          resetToken,
        })
      );
    } catch (err) {
      // handled by store
    } finally {
      setLoading(false);
    }
  };

  useEnterPress(handleClick);

  useEffect(() => {
    setDisabled(!password || !isPassed || !name);
  }, [password, isPassed, name]);

  return (
    <MainWrapper>
      <ScreenCenteredCard minWidth={733} width={55.556} ratio={0.96125}>
        <ContentWrapper>
          <Content>
            <Header>Account activation</Header>
            <InputField
              type="email"
              label="Email"
              value={email}
              disabled
              endExtra={{ component: <LockIcon />, extraWidth: 24 }}
            />
            <InputField type="text" label="Name" value={name} onChange={handleNameChange} />
            <PasswordInputField
              error={password && !isPassed}
              label="Password"
              value={password}
              onChange={handlePasswordChange}
            />
            <RequirementsWrapper>
              {requirements.map((requirement) => (
                <StyledRequirement key={`${requirement.rule}-wrapper`}>
                  <Radio
                    readOnly
                    key={`${requirement.rule}-radio`}
                    kind={(!password && 'success') || (requirement.passed ? 'success' : 'error')}
                    color={requirement.passed ? 'updStatusSuccess' : 'disabled'}
                    checked
                    disabled={!password}
                  >
                    <RequirementText
                      key={requirement.rule}
                      id={requirement.rule}
                      disabled={!requirement.passed}
                    >
                      {requirement.rule}
                    </RequirementText>
                  </Radio>
                </StyledRequirement>
              ))}
            </RequirementsWrapper>
            <Button disabled={disabled} onClick={handleClick} fill="solid" $loading={isLoading}>
              Activate Account
            </Button>
          </Content>
          <SnackbarContainer />
        </ContentWrapper>
      </ScreenCenteredCard>
    </MainWrapper>
  );
};

export default AccountActivationScreen;
