import React, { ChangeEvent, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

import { Path } from 'src/modules/navigation/store';
import { colors, px, typography } from 'src/styles';
import { useEnterPress } from './hooks';
import { useSignIn } from 'src/modules/auth/auth.slice';
import { SnackbarContainer } from 'src/modules/snackbar';
import Link from 'src/common/components/Link';
import Button from 'src/common/components/Button';
import Checkbox from 'src/common/components/CheckBox';
import InputField from 'src/common/components/InputField';
import PasswordInputField from 'src/common/components/PasswordInputField';
import ScreenHeader from '../common/ScreenHeader';
import ScreenWrapper from '../common/ScreenWrapper';
import ScreenCenteredCard from '../common/ScreenCenteredCard';
import ScreenContentWrapper from '../common/ScreenContentWrapper';
import GoogleSignInButton from "src/common/components/GoogleSignInButton";

enum AuthenticationMode {
  Self = 'self',
  Google = 'google',
  Both = 'both',
};

const SignIn: React.FC = () => {
  const AUTHENTICATION_MODE = process.env.AUTHENTICATION_MODE;

  const existedEmail = useMemo(
    () => new URLSearchParams(window.location.search).get('email') || '',
    []
  );

  const [email, setEmail] = useState<string>(existedEmail);
  const [password, setPassword] = useState<string>('');
  const [rememberUser, setRememberUser] = useState<boolean>(true);
  const [disabled, setDisabled] = useState<boolean>(true);

  const { isLoading, error, resetError, signIn, signInWithGoogle } = useSignIn();

  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
    if (error) {
      resetError();
    }
  };

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
    if (error) {
      resetError();
    }
  };

  const handleCheckBoxChange = () => setRememberUser(!rememberUser);

  const handleSignIn = async () => {
    if (!isLoading && !disabled) {
      await signIn({
        email,
        password,
        rememberUser,
      });
    }
  };

  const handleSignInWithGoogle = async (codeResponse: google.accounts.oauth2.CodeResponse) => {
    const { code } = codeResponse;
    if (code) {
      await signInWithGoogle({
        code,
        rememberUser,
      })
    }
  };

  useEnterPress(handleSignIn);

  useEffect(() => {
    if (password && email && !error) {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  }, [password, email, error]);

  if (AuthenticationMode.Google === AUTHENTICATION_MODE) {
    return (
      <ScreenWrapper
        data-testid="signin-screen"
        mediaMaxHeightToScrollY={511}
        mediaMaxWidthToScrollX={682}
      >
        <ScreenCenteredCard
          width={55.556}
          minWidth={773}
          ratio={(existedEmail ? 678 : 600) / 800}
          onMainButtonClick={handleSignIn}
        >
          <ScreenContentWrapper>
            <Content>
              <Header>Sign in</Header>
              <GoogleSignInButton
                onSuccess={handleSignInWithGoogle}
                onFailure={() => { }}
              />
            </Content>
          </ScreenContentWrapper>
        </ScreenCenteredCard>
      </ScreenWrapper>
    )
  }

  return (
    <ScreenWrapper
      data-testid="signin-screen"
      mediaMaxHeightToScrollY={511}
      mediaMaxWidthToScrollX={682}
    >
      <ScreenCenteredCard
        width={55.556}
        minWidth={773}
        ratio={(existedEmail ? 678 : 600) / 800}
        onMainButtonClick={handleSignIn}
      >
        <ScreenContentWrapper>
          <Content>
            <Header>Sign in</Header>
            <InputField
              name="email"
              type="email"
              label="Email"
              aria-label="Email"
              placeholder="Enter your email"
              data-testid="signin-screen-email"
              maxLength={256}
              value={email}
              readOnly={isLoading}
              onChange={handleEmailChange}
            />
            <PasswordInputField
              name="password"
              label="Password"
              autoComplete="new-password"
              aria-label="Password"
              placeholder="Enter password"
              data-testid="signin-screen-password"
              maxLength={256}
              value={password}
              readOnly={isLoading}
              onChange={handlePasswordChange}
            />
            <ControlsWrapper>
              <Checkbox
                data-testid="signin-screen-remember"
                checked={rememberUser}
                onChange={handleCheckBoxChange}
              >
                Remember me
              </Checkbox>
            </ControlsWrapper>
            <ActionButtonContainer>
              <Button
                fill="solid"
                data-testid="signin-screen-send"
                disabled={disabled}
                $loading={isLoading}
                onClick={handleSignIn}
              >
                Sign In
              </Button>
              {AuthenticationMode.Both === AUTHENTICATION_MODE &&
                <GoogleSignInButton
                  onSuccess={handleSignInWithGoogle}
                  onFailure={() => { }}
                />
              }
            </ActionButtonContainer>
            <SignUpOffer>
              Don’t have an account?
              <Link to={Path.AccountCreate}>Create an account</Link>
            </SignUpOffer>
            <ErrorText data-testid="signin-screen-error">
              {error}
            </ErrorText>
          </Content>
          <SnackbarContainer useSimpleGrid />
        </ScreenContentWrapper>
      </ScreenCenteredCard>
    </ScreenWrapper>
  );
};

export default SignIn;

const Content = styled.div`
  width: ${px(448)};
  margin: auto;
  display: flex;
  flex-direction: column;
`;

const Header = styled(ScreenHeader)`
  margin: ${px(40)} auto ${px(42)};
`;

const ControlsWrapper = styled.div`
  display: inline-flex;
  justify-content: space-between;
  align-items: flex-start;
  height: ${px(63)};
  color: ${colors.primary};
`;

const StyledButton = styled(Button)`
  height: ${px(34)};

  &:disabled > div {
    color: ${colors.textDisabled};
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

const NotificationContainer = styled.div`
  display: flex;
  margin-top: ${px(-18)};
  margin-bottom: ${px(24)};

  > svg {
    width: ${px(24)};
    height: ${px(24)};
    margin-right: ${px(8)};

    path {
      fill: ${colors.statusErrorText};
    }
  }
`;

const NotificationMessage = styled.div`
  ${typography.bodySmallRegular};
  color: ${colors.statusErrorText};
  flex: 1;
`;

const SignUpOffer = styled.div`
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

const ActionButtonContainer = styled.div`
  gap: ${px(24)};
  display: grid;
`
