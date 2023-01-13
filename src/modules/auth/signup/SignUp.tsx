import React, { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import PasswordValidator from 'password-validator';
import styled from 'styled-components';
import useKey from 'react-use/lib/useKey';

import Button from 'src/common/components/Button';
import InputField from 'src/common/components/InputField';
import PasswordInputField from 'src/common/components/PasswordInputField';
import Radio from 'src/common/components/Radio';
import { SnackbarContainer } from 'src/modules/snackbar';
import { colors, px, typography } from 'src/styles';
import Link from 'src/common/components/Link';
import { Path } from 'src/modules/navigation/store';
import { useSignUp } from 'src/modules/auth/auth.slice';

import ScreenCenteredCard from '../common/ScreenCenteredCard';

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
  width: ${px(448)};
  margin: auto;
  display: flex;
  flex-direction: column;
  padding-bottom: ${px(16)};
`;

const Header = styled.div`
  ${typography.headingLargeSemibold};
  margin: 0 auto ${px(36)};
`;

const InputsWrapper = styled.div`
  margin-top: ${px(3)};
  margin-bottom: ${px(10)};
  display: flex;
  align-items: stretch;
  flex-direction: column;
  row-gap: ${px(17)};
`;

const RequirementsWrapper = styled.div`
  margin-top: ${px(14)};
  margin-bottom: ${px(26)};
`;

const StyledRequirement = styled.div`
  height: ${px(40)};
`;

const RequirementText = styled.span<{ error: boolean }>`
  ${typography.bodyXSmallRegular};
  color: ${({ error, theme }) => (error ? theme.colors.textDisabled : theme.colors.textPrimary)};
`;

const SignInOffer = styled.div`
  ${typography.bodySmallRegular};
  color: ${colors.textPrimary};
  margin-top: ${px(8)};

  a {
    ${typography.bodySmallSemibold};
    color: ${colors.textPrimaryBlue};
    display: inline-block;
    margin-left: ${px(8)};
  }
`;

const SignUp: React.FC = () => {
  const [password, setPassword] = useState('');
  const [disabled, setDisabled] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const [isPassed, requirements] = useMemo(
    () => [
      checkPassword(password, name).every((r) => r.passed === true),
      checkPassword(password, name),
    ],
    [password, name]
  );

  const handlePasswordChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setPassword(event.target.value),
    []
  );
  const handleNameChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setName(event.target.value),
    []
  );
  const handleEmailChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setEmail(event.target.value),
    []
  );

  const { isLoading, signUp } = useSignUp();

  const handleClick = async () => {
    if (disabled) {
      return;
    }

    await signUp({
      email,
      password,
      profile: {
        status: 'active', // FIXME: needed?
        name,
      },
    });
  };

  useKey('Enter', handleClick);

  useEffect(() => {
    setDisabled(!password || !isPassed || !name || !email);
  }, [password, isPassed, name, email]);

  return (
    <MainWrapper data-testid="auth-signup">
      <ScreenCenteredCard minWidth={733} width={55.556} ratio={0.96125}>
        <ContentWrapper>
          <Content>
            <Header>Create account</Header>
            <InputsWrapper>
              <InputField
                data-testid="auth-signup-email"
                name="email"
                type="email"
                label="Email"
                value={email}
                onChange={handleEmailChange}
                placeholder="Enter email"
                withoutErrorText
              />
              <InputField
                data-testid="auth-signup-name"
                name="name"
                type="text"
                label="Name"
                value={name}
                onChange={handleNameChange}
                placeholder="Enter name"
                withoutErrorText
              />
              <PasswordInputField
                name="password"
                data-testid="auth-signup-password"
                error={password && !isPassed}
                withoutErrorText
                label="Password"
                value={password}
                onChange={handlePasswordChange}
                placeholder="Enter password"
              />
            </InputsWrapper>
            <RequirementsWrapper>
              {requirements.map((requirement) => (
                <StyledRequirement key={`${requirement.rule}-wrapper`}>
                  <Radio
                    data-testid="auth-signup-radio"
                    readOnly
                    key={`${requirement.rule}-radio`}
                    kind={(!password && 'success') || (requirement.passed ? 'success' : 'error')}
                    color={requirement.passed ? 'statusSuccess' : 'disabled'}
                    checked
                    disabled={!password}
                  >
                    <RequirementText id={requirement.rule} error={!requirement.passed}>
                      {requirement.rule}
                    </RequirementText>
                  </Radio>
                </StyledRequirement>
              ))}
            </RequirementsWrapper>
            <Button
              data-testid="auth-signup-create"
              disabled={disabled}
              onClick={handleClick}
              fill="solid"
              $loading={isLoading}
            >
              Create Account
            </Button>
            <SignInOffer>
              Already have an account?
              <Link to={Path.SignIn}>Sign in</Link>
            </SignInOffer>
          </Content>
          <SnackbarContainer />
        </ContentWrapper>
      </ScreenCenteredCard>
    </MainWrapper>
  );
};

export default SignUp;
