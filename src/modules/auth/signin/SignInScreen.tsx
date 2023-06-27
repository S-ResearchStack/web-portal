import React, { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { push } from 'connected-react-router';

import styled from 'styled-components';

import { signin } from 'src/modules/auth/auth.slice';
import { useAppDispatch } from 'src/modules/store';
import Link from 'src/common/components/Link';
import Button from 'src/common/components/Button';
import Checkbox from 'src/common/components/CheckBox';
import InputField from 'src/common/components/InputField';
import PasswordInputField from 'src/common/components/PasswordInputField';
import applyDefaultApiErrorHandlers from 'src/modules/api/applyDefaultApiErrorHandlers';
import { colors, px, typography } from 'src/styles';
import InfoIcon from 'src/assets/icons/info.svg';
import { Path } from 'src/modules/navigation/store';
import ScreenCenteredCard from '../common/ScreenCenteredCard';
import { useEnterPress } from './hooks';
import ScreenHeader from '../common/ScreenHeader';
import ScreenWrapper from '../common/ScreenWrapper';

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

const Notification = ({ email }: { email: string }) => (
  <NotificationContainer>
    <InfoIcon />
    <NotificationMessage>
      {`We found an account for ${email}. Please enter your password to sign in.`}
    </NotificationMessage>
  </NotificationContainer>
);

const SignInScreen: React.FC = () => {
  const existedEmail = useMemo(
    () => new URLSearchParams(window.location.search).get('email') || '',
    []
  );

  const [email, setEmail] = useState<string>(existedEmail);
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [disabled, setDisabled] = useState<boolean>(true);
  const [rememberUser, setRememberUser] = useState<boolean>(false);
  const dispatch = useAppDispatch();

  const handleForgotPassword = () => {
    dispatch(push(Path.ForgotPassword));
  };

  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
    if (error) {
      setError(false);
    }
  };

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
    if (error) {
      setError(false);
    }
  };

  const handleClick = async () => {
    if (!isLoading && !disabled) {
      setIsLoading(true);
      setError(false);

      try {
        await dispatch(
          signin({
            email,
            password,
            rememberUser,
          })
        );
      } catch (e) {
        applyDefaultApiErrorHandlers(e, dispatch);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEnterPress(handleClick);

  const handleCheckBoxChange = () => setRememberUser(!rememberUser);

  useEffect(() => {
    if (password && email && !error) {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  }, [password, email, error]);

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
        onMainButtonClick={handleClick}
      >
        <Content>
          <Header>Sign in</Header>
          {existedEmail && <Notification email={existedEmail} />}
          <InputField
            name="email"
            data-testid="signin-screen-email"
            type="email"
            label="Email"
            value={email}
            onChange={handleEmailChange}
            error={error}
            readOnly={isLoading}
            aria-label="Email"
            placeholder="Enter your email"
          />
          <PasswordInputField
            name="password"
            data-testid="signin-screen-password"
            error={error}
            label="Password"
            value={password}
            onChange={handlePasswordChange}
            autoComplete="new-password"
            readOnly={isLoading}
            aria-label="Password"
            placeholder="Enter password"
          />
          <ControlsWrapper>
            <Checkbox
              data-testid="signin-screen-remember"
              checked={rememberUser}
              onChange={handleCheckBoxChange}
            >
              <div>Remember me</div>
            </Checkbox>
            <StyledButton
              fill="text"
              width={120}
              rate="small"
              onClick={handleForgotPassword}
              rippleOff
              placeholder="Enter email"
            >
              Forgot Password?
            </StyledButton>
          </ControlsWrapper>
          <Button
            data-testid="signin-screen-send"
            disabled={disabled}
            onClick={handleClick}
            fill="solid"
            $loading={isLoading}
          >
            Sign In
          </Button>
          <SignUpOffer>
            Don’t have an account?
            <Link to={Path.AccountCreate}>Create an account</Link>
          </SignUpOffer>
          <ErrorText data-testid="signin-screen-error">
            {error && 'Incorrect email or password, please try again.'}
          </ErrorText>
        </Content>
      </ScreenCenteredCard>
    </ScreenWrapper>
  );
};

export default SignInScreen;
