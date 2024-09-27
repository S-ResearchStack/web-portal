import React, { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import useKey from 'react-use/lib/useKey';
import styled from 'styled-components';

import { Path } from 'src/modules/navigation/store';
import { colors, px, typography } from 'src/styles';
import { validateEmail } from 'src/common/utils/email';
import { useSignUp } from 'src/modules/auth/auth.slice';
import { SnackbarContainer } from 'src/modules/snackbar';
import Button from 'src/common/components/Button';
import InputField from 'src/common/components/InputField';
import PasswordInputField from 'src/common/components/PasswordInputField';
import Link from 'src/common/components/Link';
import ScreenHeader from '../common/ScreenHeader';
import ScreenWrapper from '../common/ScreenWrapper';
import ScreenCenteredCard from '../common/ScreenCenteredCard';
import ScreenContentWrapper from '../common/ScreenContentWrapper';
import {
  PasswordRequirements,
  RequirementItem,
  useCheckPassword,
} from '../common/PasswordRequirements';

const SignUp: React.FC = () => {
  const [disabled, setDisabled] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { isLoading, error, resetError, signUp } = useSignUp();
  const [passwordPassed, requirements] = useCheckPassword({
    email: email.split('@')[0] || '',
    password
  });
  const emailPassed = useMemo(() => validateEmail(email), [email]);

  const handleEmailChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setEmail(event.target.value);
      if (error) {
        resetError();
      }
    },
    [error]
  );

  const handlePasswordChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setPassword(event.target.value);
      if (error) {
        resetError();
      }
    },
    [error]
  );

  const handleClick = async () => {
    if (disabled) {
      return;
    }

    await signUp({
      email,
      password,
    });
  };

  useKey('Enter', handleClick);

  useEffect(() => {
    setDisabled(!email || !password || !emailPassed || !passwordPassed);
  }, [email, password, emailPassed, passwordPassed]);

  return (
    <ScreenWrapper
      data-testid="auth-signup"
      mediaMaxHeightToScrollY={704}
      mediaMaxWidthToScrollX={732}
    >
      <ScreenCenteredCard minWidth={733} width={55.556} ratio={0.96125}>
        <ScreenContentWrapper>
          <Content>
            <Header>Create account</Header>
            <InputsWrapper>
              <InputField
                name="email"
                type="email"
                label="Email"
                placeholder="Enter email"
                data-testid="auth-signup-email"
                withoutErrorText
                maxLength={256}
                value={email}
                error={email && !emailPassed}
                onChange={handleEmailChange}
              />
              <PasswordInputField
                name="password"
                label="Password"
                placeholder="Enter password"
                data-testid="auth-signup-password"
                withoutErrorText
                maxLength={256}
                value={password}
                error={password && !passwordPassed}
                onChange={handlePasswordChange}
              />
            </InputsWrapper>
            <PasswordRequirements>
              {requirements.map((requirement) => (
                <RequirementItem
                  key={requirement.rule}
                  rule={requirement.rule}
                  passed={!password ? undefined : requirement.passed}
                  disabled={!password}
                />
              ))}
            </PasswordRequirements>
            <Button
              fill="solid"
              data-testid="auth-signup-create"
              disabled={disabled}
              $loading={isLoading}
              onClick={handleClick}
            >
              Create Account
            </Button>
            <SignInOffer>
              Already have an account?
              <Link to={Path.SignIn}>Sign in</Link>
            </SignInOffer>
            <ErrorText data-testid="signup-screen-error">
              {error}
            </ErrorText>
          </Content>
          <SnackbarContainer useSimpleGrid />
        </ScreenContentWrapper>
      </ScreenCenteredCard>
    </ScreenWrapper>
  );
};

export default SignUp;

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

const InputsWrapper = styled.div`
  margin-top: ${px(3)};
  margin-bottom: ${px(10)};
  display: flex;
  align-items: stretch;
  flex-direction: column;
  row-gap: ${px(17)};
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

const ErrorText = styled.div`
  ${typography.bodySmallRegular};
  color: ${colors.statusErrorText};
  height: ${px(40)};
  width: 100%;
  text-align: center;
  padding-top: ${px(20)};
`;
