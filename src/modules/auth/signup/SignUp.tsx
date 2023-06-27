import React, { ChangeEvent, useCallback, useEffect, useState } from 'react';
import useKey from 'react-use/lib/useKey';

import styled from 'styled-components';

import Button from 'src/common/components/Button';
import InputField from 'src/common/components/InputField';
import PasswordInputField from 'src/common/components/PasswordInputField';
import { SnackbarContainer } from 'src/modules/snackbar';
import { colors, px, typography } from 'src/styles';
import Link from 'src/common/components/Link';
import { Path } from 'src/modules/navigation/store';
import { useSignUp } from 'src/modules/auth/auth.slice';
import ScreenCenteredCard from '../common/ScreenCenteredCard';
import {
  PasswordRequirements,
  RequirementItem,
  useCheckPassword,
} from '../common/PasswordRequirements';
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

const SignUp: React.FC = () => {
  const [password, setPassword] = useState('');
  const [disabled, setDisabled] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const [isPassed, requirements] = useCheckPassword({ name, password });

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
                data-testid="auth-signup-email"
                name="email"
                type="email"
                label="Email"
                value={email}
                onChange={handleEmailChange}
                placeholder="Enter email"
                withoutErrorText
                maxLength={256}
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
                maxLength={30}
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
                maxLength={256}
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
        </ScreenContentWrapper>
      </ScreenCenteredCard>
    </ScreenWrapper>
  );
};

export default SignUp;
